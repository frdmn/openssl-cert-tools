'use strict';

/*
 * Copyright (c) 2015 by Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

const { spawn } = require('child_process');
const { createHash } = require('node:crypto');

const SUPPORTED_HASH_ALGORITHMS = ['md5', 'sha1', 'sha256', 'sha512'];
const DEFAULT_HASH_ALGORITHM = 'sha256';

/**
 * Reject with a friendlier error when the openssl binary is missing
 * @param {Error} err Spawn error
 * @return {Error} Error to reject with
 */
function wrapSpawnError(err) {
  if (err && err.code === 'ENOENT') {
    return new Error('openssl binary not found in $PATH');
  }
  return err;
}

/**
 * Run an openssl command and feed input via stdin
 * @param {Array<String>} args OpenSSL arguments
 * @param {String|Buffer} input stdin payload
 * @return {Promise<Object>} stdout, stderr and exit code of the execution
 */
function runOpenSsl(args, input) {
  return new Promise((resolve, reject) => {
    const openssl = spawn('openssl', args);

    let stdout = '';
    let stderr = '';

    openssl.stdout.on('data', (out) => {
      stdout += out.toString();
    });

    openssl.stderr.on('data', (out) => {
      stderr += out.toString();
    });

    openssl.on('error', (err) => reject(wrapSpawnError(err)));
    openssl.on('close', (code) => resolve({ stdout, stderr, code }));

    openssl.stdin.end(input);
  });
}

/**
 * Split a string on a separator, ignoring escaped occurrences
 * @param {String} input Input text
 * @param {String} separator Separator character
 * @return {Array<String>} Segments
 */
function splitEscaped(input, separator) {
  const parts = [];
  let current = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '\\' && i + 1 < input.length) {
      current += char + input[++i];
    } else if (char === separator) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  parts.push(current);
  return parts;
}

/**
 * Unescape RFC2253 character ("\,") and hex ("\2C") escapes
 * @param {String} value Input text
 * @return {String} Unescaped text
 */
function unescapeDnValue(value) {
  return value
    .replace(/\\([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\(.)/g, '$1');
}

/**
 * Parse the entries of an "X509v3 Subject Alternative Name" block
 * into an object of entry types to values. openssl joins entries
 * with ", "; values containing that exact separator are re-joined
 * heuristically (a segment without a type prefix belongs to the
 * previous entry).
 * @param {String} entries Entry text, e.g. "DNS:localhost, IP Address:127.0.0.1"
 * @return {Object} Values grouped by entry type
 */
function parseSubjectAltName(entries) {
  const result = {};
  let lastType;

  for (const segment of entries.split(', ')) {
    const separator = segment.indexOf(':');
    const type = separator === -1 ? '' : segment.slice(0, separator);

    // Entry types are alphanumeric words ("DNS", "IP Address", "Registered ID", ...);
    // anything else is a continuation of a value containing ", "
    if (!/^[A-Za-z][A-Za-z ]*$/.test(type)) {
      if (lastType) {
        result[lastType][result[lastType].length - 1] += `, ${segment}`;
      }
      continue;
    }

    lastType = type;
    if (!result[type]) {
      result[type] = [];
    }
    result[type].push(segment.slice(separator + 1));
  }

  return result;
}

/**
 * Parse an RFC2253 formatted distinguished name into an object
 * @param {String} input DN, e.g. "CN=example.com,O=Foo\, Inc."
 * @return {Object} Key/value pairs of the DN
 */
function parseDistinguishedName(input) {
  const result = {};

  for (const part of splitEscaped(input.trim(), ',')) {
    // Only split key and value on the first "="
    const separator = part.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = unescapeDnValue(part.slice(0, separator)).trim();
    if (!key) {
      continue;
    }

    result[key] = unescapeDnValue(part.slice(separator + 1));
  }

  return result;
}

/**
 * Hash the modulus of a certificate, request or key
 * @param {String|Buffer} input Certificate, request or key
 * @param {Array<String>} extractorArgs OpenSSL arguments to print the modulus
 * @param {Object} [options]
 * @param {String} [options.algorithm='sha256'] Digest algorithm
 * @return {Promise<String>} Hex encoded hash
 */
async function hashModulus(input, extractorArgs, options) {
  const algorithm = String((options && options.algorithm) || DEFAULT_HASH_ALGORITHM).toLowerCase();

  if (!SUPPORTED_HASH_ALGORITHMS.includes(algorithm)) {
    throw new Error(`Unsupported hash algorithm "${options.algorithm}", supported algorithms: ${SUPPORTED_HASH_ALGORITHMS.join(', ')}`);
  }

  const extractor = spawn('openssl', extractorArgs);
  const dgst = spawn('openssl', ['dgst', `-${algorithm}`]);

  let hashOutput = '';
  dgst.stdout.on('data', (out) => {
    hashOutput += out.toString();
  });

  const track = (proc) => new Promise((resolve, reject) => {
    let stderr = '';
    proc.stderr.on('data', (out) => {
      stderr += out.toString();
    });
    proc.on('error', (err) => reject(wrapSpawnError(err)));
    proc.on('close', (code) => resolve({ code, stderr }));
  });

  extractor.stdout.pipe(dgst.stdin);
  extractor.stdin.end(input);

  const [extractorResult, dgstResult] = await Promise.all([track(extractor), track(dgst)]);

  if (extractorResult.code !== 0) {
    throw new Error(extractorResult.stderr.trim() || 'Couldn\'t extract modulus');
  }

  if (dgstResult.code !== 0) {
    throw new Error(dgstResult.stderr.trim() || 'Couldn\'t hash modulus');
  }

  const match = hashOutput.match(/[0-9a-f]{32,128}/i);
  if (!match) {
    throw new Error('Couldn\'t parse hash output');
  }

  return match[0].toLowerCase();
}

/**
 * Hash the Subject Public Key Info (SPKI) of a certificate,
 * request or key. Unlike the modulus, the SPKI structure is
 * shared by every key algorithm, so this also works for EC
 * and Ed25519 inputs.
 * @param {String|Buffer} input Certificate, request or key
 * @param {Array<String>} extractorArgs OpenSSL arguments to print the public key
 * @param {Object} [options]
 * @param {String} [options.algorithm='sha256'] Digest algorithm
 * @return {Promise<String>} Hex encoded hash
 */
async function hashPublicKey(input, extractorArgs, options) {
  const algorithm = String((options && options.algorithm) || DEFAULT_HASH_ALGORITHM).toLowerCase();

  if (!SUPPORTED_HASH_ALGORITHMS.includes(algorithm)) {
    throw new Error(`Unsupported hash algorithm "${options.algorithm}", supported algorithms: ${SUPPORTED_HASH_ALGORITHMS.join(', ')}`);
  }

  const { stdout, stderr, code } = await runOpenSsl(extractorArgs, input);

  if (code !== 0) {
    throw new Error(stderr.trim() || 'Couldn\'t extract public key');
  }

  const match = stdout.match(/-----BEGIN PUBLIC KEY-----([\s\S]*?)-----END PUBLIC KEY-----/);
  if (!match) {
    throw new Error('Couldn\'t parse public key output');
  }

  const der = Buffer.from(match[1].replace(/\s+/g, ''), 'base64');

  return createHash(algorithm).update(der).digest('hex');
}

/**
 * Decodes various information from the provided
 * certificate like issuer, subject, expiration
 * dates and the subjectAltName extension. The
 * returned "certificate" property echoes the input
 * as given (string or Buffer). Issuer and subject
 * are objects of DN components; if a component
 * appears more than once (e.g. two "OU" entries), the
 * last occurrence wins. "subjectAltName" groups the
 * SAN entries by type (e.g. { DNS: ['localhost'] })
 * and is absent when the certificate has no such
 * extension.
 * @param {String|Buffer} cert Input certificate
 * @return {Promise<Object>} Information object
 */
async function getCertificateInfo(cert) {
  const { stdout, stderr, code } = await runOpenSsl(
    ['x509', '-noout', '-issuer', '-subject', '-dates', '-nameopt', 'RFC2253', '-ext', 'subjectAltName'],
    cert
  );

  if (code !== 0) {
    throw new Error(stderr.trim() || 'Couldn\'t read certificate');
  }

  const info = { certificate: cert };
  let inSubjectAltName = false;

  for (const line of stdout.split('\n')) {
    if (line.startsWith('issuer=')) {
      info.issuer = parseDistinguishedName(line.slice('issuer='.length));
    } else if (line.startsWith('subject=')) {
      info.subject = parseDistinguishedName(line.slice('subject='.length));
    } else if (line.startsWith('notBefore=')) {
      info.validFrom = new Date(line.slice('notBefore='.length));
    } else if (line.startsWith('notAfter=')) {
      info.validTo = new Date(line.slice('notAfter='.length));
    } else if (line.startsWith('X509v3 Subject Alternative Name:')) {
      inSubjectAltName = true;
    } else if (inSubjectAltName && line.trim()) {
      info.subjectAltName = parseSubjectAltName(line.trim());
      inSubjectAltName = false;
    }
  }

  if (!info.issuer || !info.subject ||
      Number.isNaN(info.validFrom.getTime()) || Number.isNaN(info.validTo.getTime())) {
    throw new Error('Couldn\'t read certificate');
  }

  // Check if "to" date is in the past => certificate expired
  if (info.validTo < new Date()) {
    info.expiredDays = Math.round(Math.abs((Date.now() - info.validTo.getTime()) / (24 * 60 * 60 * 1000)));
    info.remainingDays = 0;
  } else {
    info.remainingDays = Math.round(Math.abs((Date.now() - info.validTo.getTime()) / (24 * 60 * 60 * 1000)));
  }

  return info;
}

/**
 * Decodes information from the provided certificate
 * sign request. The returned "certificate" property
 * echoes the input as given (string or Buffer). The
 * subject is an object of DN components; if a component
 * appears more than once, the last occurrence wins.
 * @param {String|Buffer} cert Input certificate request
 * @return {Promise<Object>} Information object
 */
async function getCertificateRequestInfo(cert) {
  const { stdout, stderr, code } = await runOpenSsl(
    ['req', '-noout', '-subject', '-nameopt', 'RFC2253'],
    cert
  );

  if (code !== 0) {
    throw new Error(stderr.trim() || 'Couldn\'t read certificate request');
  }

  const subjectLine = stdout.split('\n').find((line) => line.startsWith('subject='));
  if (!subjectLine) {
    throw new Error('Couldn\'t read certificate request');
  }

  return {
    certificate: cert,
    subject: parseDistinguishedName(subjectLine.slice('subject='.length))
  };
}

/**
 * Returns a hash of the modulus of a given input certificate
 * @param {String|Buffer} cert Input certificate
 * @param {Object} [options]
 * @param {String} [options.algorithm='sha256'] Digest algorithm (md5, sha1, sha256 or sha512)
 * @return {Promise<String>} Certificate hash
 */
async function getCertificateHash(cert, options) {
  return hashModulus(cert, ['x509', '-noout', '-modulus'], options);
}

/**
 * Returns a hash of the modulus of a given input certificate
 * signing request
 * @param {String|Buffer} csr Input CSR
 * @param {Object} [options]
 * @param {String} [options.algorithm='sha256'] Digest algorithm (md5, sha1, sha256 or sha512)
 * @return {Promise<String>} CSR hash
 */
async function getCertificateRequestHash(csr, options) {
  return hashModulus(csr, ['req', '-noout', '-modulus'], options);
}

/**
 * Returns a hash of the modulus of a given input key
 * @param {String|Buffer} key Input key
 * @param {Object} [options]
 * @param {String} [options.algorithm='sha256'] Digest algorithm (md5, sha1, sha256 or sha512)
 * @return {Promise<String>} Key hash
 */
async function getPrivateKeyHash(key, options) {
  return hashModulus(key, ['rsa', '-noout', '-modulus'], options);
}

const PUBLIC_KEY_EXTRACTOR_ARGS = {
  certificate: ['x509', '-noout', '-pubkey'],
  request: ['req', '-noout', '-pubkey'],
  key: ['pkey', '-pubout']
};

/**
 * Returns a hash of the Subject Public Key Info (SPKI) of the
 * public key inside a certificate, certificate signing request
 * or private key. Inputs from the same keypair produce the same
 * hash, for any key algorithm (RSA, EC, Ed25519, ...). The
 * result equals:
 *   openssl pkey -in key.pem -pubout -outform DER | openssl dgst -sha256
 * @param {String|Buffer} input PEM encoded certificate, certificate
 *   signing request or private key
 * @param {'certificate'|'request'|'key'} kind Which input type
 * @param {Object} [options]
 * @param {String} [options.algorithm='sha256'] Digest algorithm (md5, sha1, sha256 or sha512)
 * @return {Promise<String>} Public key hash
 */
async function getPublicKeyHash(input, kind, options) {
  const extractorArgs = PUBLIC_KEY_EXTRACTOR_ARGS[kind];

  if (!extractorArgs) {
    throw new Error(`Unsupported input kind "${kind}", supported kinds: ${Object.keys(PUBLIC_KEY_EXTRACTOR_ARGS).join(', ')}`);
  }

  return hashPublicKey(input, extractorArgs, options);
}

module.exports = {
  getCertificateInfo,
  getCertificateRequestInfo,
  getCertificateHash,
  getCertificateRequestHash,
  getPrivateKeyHash,
  getPublicKeyHash
};
