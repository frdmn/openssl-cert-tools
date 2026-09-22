'use strict';

/*
 * Copyright (c) 2015 by Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

const { spawn } = require('child_process');

const DEFAULT_TIMEOUT = 5000;

/**
 * Validate a host/port combination
 * @param {String} host Input hostname
 * @param {String|Number} port Input port
 * @throws {Error} If host or port are invalid
 */
function validateTarget(host, port) {
  if (typeof host !== 'string' || host.length === 0) {
    throw new Error('Host must be a non-empty string');
  }

  const portNumber = Number(port);
  if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
    throw new Error(`Invalid port "${port}", must be an integer between 1 and 65535`);
  }
}

/**
 * Extract all PEM encoded certificate blocks from an openssl output
 * @param {String} output Input text
 * @return {Array<String>} Certificate blocks
 */
function extractCertificates(output) {
  return output.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) || [];
}

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
 * Run openssl s_client and collect its output
 * @param {Array<String>} args Additional s_client arguments
 * @param {String} host Input hostname
 * @param {String|Number} port Input port
 * @param {Number} timeout Time out in milliseconds
 * @return {Promise<Object>} stdout and stderr of the execution
 */
function runSClient(args, host, port, timeout) {
  return new Promise((resolve, reject) => {
    const openssl = spawn('openssl', ['s_client', ...args, '-connect', `${host}:${port}`, '-servername', host]);

    let stdout = '';
    let stderr = '';
    let settled = false;

    function settle(fn, value) {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      fn(value);
    }

    // Kill the process in case of errors
    const timer = setTimeout(() => {
      openssl.kill();
      settle(reject, new Error(`Time out while trying to extract certificate chain for ${host}:${port}`));
    }, timeout);

    openssl.stdout.on('data', (out) => {
      stdout += out.toString();
    });

    openssl.stderr.on('data', (out) => {
      stderr += out.toString();
    });

    openssl.on('error', (err) => settle(reject, wrapSpawnError(err)));
    openssl.on('close', () => settle(resolve, { stdout, stderr }));

    // End stdin (otherwise it'll run indefinitely)
    openssl.stdin.end();
  });
}

/**
 * Download certificate from remote host
 * @param {String} host Input hostname
 * @param {String|Number} port Input port
 * @param {Object} [options]
 * @param {Number} [options.timeout=5000] Time out in milliseconds
 * @return {Promise<String>} PEM encoded certificate
 */
async function getCertificate(host, port, { timeout = DEFAULT_TIMEOUT } = {}) {
  validateTarget(host, port);

  const { stdout, stderr } = await runSClient([], host, port, timeout);
  const [certificate] = extractCertificates(stdout);

  if (!certificate) {
    const details = stderr.trim() ? `: ${stderr.trim()}` : '';
    throw new Error(`Couldn't extract certificate for ${host}:${port}${details}`);
  }

  return certificate;
}

/**
 * Download complete certificate chain from remote host
 * @param {String} host Input hostname
 * @param {String|Number} port Input port
 * @param {Object} [options]
 * @param {Number} [options.timeout=5000] Time out in milliseconds
 * @return {Promise<Array<String>>} PEM encoded certificate chain
 */
async function getCertificateChain(host, port, { timeout = DEFAULT_TIMEOUT } = {}) {
  validateTarget(host, port);

  const { stdout, stderr } = await runSClient(['-showcerts'], host, port, timeout);
  const chain = extractCertificates(stdout);

  if (chain.length === 0) {
    const details = stderr.trim() ? `: ${stderr.trim()}` : '';
    throw new Error(`Couldn't extract certificate chain for ${host}:${port}${details}`);
  }

  return chain;
}

module.exports = {
  getCertificate,
  getCertificateChain
};
