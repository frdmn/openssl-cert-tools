'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const opensslTools = require('../main.js');

const fixtures = path.join(__dirname, 'fixtures');
const read = (name) => fs.readFileSync(path.join(fixtures, name));

const serverCert = read('server-cert.pem');
const serverCsr = read('server.csr');
const serverKey = read('server-key.pem');
const legacyCert = read('legacy-cert.pem');
const legacyCsr = read('legacy-csr.pem');
const legacyKey = read('legacy-key.pem');
const rootCert = read('root-cert.pem');
const ecCert = read('ec-cert.pem');
const ecCsr = read('ec-csr.pem');
const ecKey = read('ec-key.pem');

// Ground truth computed with:
//   openssl x509|req|rsa -noout -modulus ... | openssl dgst -<algorithm>
const SERVER_MODULUS_SHA256 = '3291a1ee920dbaac434cdc653e74dea77e7a5979333842aaed06d4db18552c84';
const SERVER_MODULUS_MD5 = '1a82121657cf391d7e075acab1829441';
const LEGACY_CERT_SHA256 = '903852adf40f7087df962b0a04312c36bef3f20206f8a01f5d7e8a23f59e1fd2';
const LEGACY_CERT_MD5 = 'baf59ff7f5b05fde6799439b6f31a290';
const LEGACY_CSR_MD5 = 'dbc530fbb1e60b5cf43cc9c7f8dcc1ad';
const LEGACY_KEY_MD5 = '0b47baa451ba0d99eda2ca44dc4bd000';
const LEGACY_KEY_SHA256 = '0583b0f265569ec7b472c587e7704a78462a53a518949df979e921b5feb255f3';

// Ground truth computed with:
//   openssl pkey -in <key> -pubout -outform DER | openssl dgst -<algorithm>
const SERVER_SPKI_SHA256 = 'f552ba4d11bd5a9c2f8827d9e09995315ceff096606dead756afca5d351853ea';
const SERVER_SPKI_MD5 = '3187d33c616e1d614f5731da7abcc501';
const EC_SPKI_SHA256 = '360ac4249da45292e84f0fc52f4928ad4aaf955fdee6a1efeeec0f5df523362b';

test('getCertificateInfo parses issuer, subject and dates', async () => {
  const info = await opensslTools.getCertificateInfo(serverCert);

  // Both DNs contain escaped commas ("Foo, Inc."), exercising RFC2253 unescaping
  assert.deepStrictEqual(info.issuer, {
    C: 'DE',
    O: 'openssl-cert-tools, Inc.',
    CN: 'Test Intermediate CA'
  });

  assert.deepStrictEqual(info.subject, {
    emailAddress: 'admin@example.com',
    CN: 'localhost',
    OU: 'openssl-cert-tools',
    O: 'Foo, Inc.',
    L: 'Eibelstadt',
    ST: 'Bavaria',
    C: 'DE'
  });

  assert.ok(info.validFrom instanceof Date && !Number.isNaN(info.validFrom.getTime()));
  assert.ok(info.validTo instanceof Date && !Number.isNaN(info.validTo.getTime()));
  assert.ok(info.validTo > info.validFrom);

  assert.ok(Buffer.isBuffer(info.certificate) && info.certificate.equals(serverCert));
});

test('getCertificateInfo reports remaining days for valid certificates', async () => {
  const info = await opensslTools.getCertificateInfo(serverCert);
  assert.ok(info.remainingDays > 3600);
  assert.strictEqual(info.expiredDays, undefined);
});

test('getCertificateInfo reports expired days for expired certificates', async () => {
  const info = await opensslTools.getCertificateInfo(legacyCert);
  assert.strictEqual(info.remainingDays, 0);
  assert.ok(info.expiredDays > 3000);

  // Duplicate OU RDNs collapse to the last occurrence (known object-shape limitation)
  assert.deepStrictEqual(info.subject, {
    CN: 'sni33280.cloudflaressl.com',
    OU: 'Domain Control Validated'
  });
});

test('getCertificateInfo rejects invalid input', async () => {
  await assert.rejects(() => opensslTools.getCertificateInfo('not a certificate'), /certificate/i);
});

test('getCertificateRequestInfo parses the subject', async () => {
  const info = await opensslTools.getCertificateRequestInfo(serverCsr);

  assert.deepStrictEqual(info.subject, {
    emailAddress: 'admin@example.com',
    CN: 'localhost',
    OU: 'openssl-cert-tools',
    O: 'Foo, Inc.',
    L: 'Eibelstadt',
    ST: 'Bavaria',
    C: 'DE'
  });

  assert.ok(Buffer.isBuffer(info.certificate) && info.certificate.equals(serverCsr));
});

test('getCertificateRequestInfo rejects invalid input', async () => {
  await assert.rejects(() => opensslTools.getCertificateRequestInfo('not a request'), /request/i);
});

test('getCertificateHash defaults to SHA-256', async () => {
  assert.strictEqual(await opensslTools.getCertificateHash(serverCert), SERVER_MODULUS_SHA256);
  assert.strictEqual(await opensslTools.getCertificateHash(legacyCert), LEGACY_CERT_SHA256);
});

test('getCertificateHash supports md5', async () => {
  assert.strictEqual(await opensslTools.getCertificateHash(serverCert, { algorithm: 'md5' }), SERVER_MODULUS_MD5);
  assert.strictEqual(await opensslTools.getCertificateHash(legacyCert, { algorithm: 'md5' }), LEGACY_CERT_MD5);
});

test('matching certificate, key and CSR produce the same modulus hash', async () => {
  const certHash = await opensslTools.getCertificateHash(serverCert);
  assert.strictEqual(await opensslTools.getPrivateKeyHash(serverKey), certHash);
  assert.strictEqual(await opensslTools.getCertificateRequestHash(serverCsr), certHash);
});

test('legacy CSR and key hashes match openssl ground truth', async () => {
  assert.strictEqual(await opensslTools.getCertificateRequestHash(legacyCsr, { algorithm: 'md5' }), LEGACY_CSR_MD5);
  assert.strictEqual(await opensslTools.getPrivateKeyHash(legacyKey, { algorithm: 'md5' }), LEGACY_KEY_MD5);
  assert.strictEqual(await opensslTools.getPrivateKeyHash(legacyKey), LEGACY_KEY_SHA256);
});

test('sha1 and sha512 algorithms work', async () => {
  assert.match(await opensslTools.getCertificateHash(serverCert, { algorithm: 'sha1' }), /^[0-9a-f]{40}$/);
  assert.match(await opensslTools.getCertificateHash(serverCert, { algorithm: 'sha512' }), /^[0-9a-f]{128}$/);
});

test('unsupported hash algorithms are rejected', async () => {
  await assert.rejects(() => opensslTools.getCertificateHash(serverCert, { algorithm: 'rot13' }), /Unsupported hash algorithm/);
});

test('getPublicKeyHash matches across certificate, CSR and key for RSA inputs', async () => {
  assert.strictEqual(await opensslTools.getPublicKeyHash(serverCert, 'certificate'), SERVER_SPKI_SHA256);
  assert.strictEqual(await opensslTools.getPublicKeyHash(serverCsr, 'request'), SERVER_SPKI_SHA256);
  assert.strictEqual(await opensslTools.getPublicKeyHash(serverKey, 'key'), SERVER_SPKI_SHA256);
});

test('getPublicKeyHash matches across certificate, CSR and key for EC inputs', async () => {
  const certHash = await opensslTools.getPublicKeyHash(ecCert, 'certificate');
  assert.strictEqual(certHash, EC_SPKI_SHA256);
  assert.strictEqual(await opensslTools.getPublicKeyHash(ecCsr, 'request'), certHash);
  assert.strictEqual(await opensslTools.getPublicKeyHash(ecKey, 'key'), certHash);
});

test('getPublicKeyHash differs between different keypairs', async () => {
  const rootHash = await opensslTools.getPublicKeyHash(rootCert, 'certificate');
  assert.notStrictEqual(rootHash, SERVER_SPKI_SHA256);
});

test('getPublicKeyHash defaults to 64 lowercase hex characters', async () => {
  assert.match(await opensslTools.getPublicKeyHash(ecKey, 'key'), /^[0-9a-f]{64}$/);
});

test('getPublicKeyHash supports md5', async () => {
  assert.strictEqual(await opensslTools.getPublicKeyHash(serverKey, 'key', { algorithm: 'md5' }), SERVER_SPKI_MD5);
  assert.match(await opensslTools.getPublicKeyHash(ecKey, 'key', { algorithm: 'md5' }), /^[0-9a-f]{32}$/);
});

test('getPublicKeyHash rejects unsupported hash algorithms', async () => {
  await assert.rejects(() => opensslTools.getPublicKeyHash(serverCert, 'certificate', { algorithm: 'rot13' }), /Unsupported hash algorithm/);
});

test('getPublicKeyHash rejects unknown kinds', async () => {
  await assert.rejects(() => opensslTools.getPublicKeyHash(serverCert, 'crt'), /Unsupported input kind/);
});

test('getPublicKeyHash rejects inputs that do not match the kind', async () => {
  await assert.rejects(() => opensslTools.getPublicKeyHash(serverCert, 'key'), /private key/i);
});

test('missing openssl binary produces a friendly error', () => {
  // Run the library in a child process whose PATH contains no openssl
  const result = spawnSync(
    process.execPath,
    ['-e', 'require(\'./main.js\').getCertificateHash(\'x\').catch((e) => console.error(e.message))'],
    { cwd: path.join(__dirname, '..'), env: { ...process.env, PATH: '/nonexistent' }, encoding: 'utf8' }
  );

  assert.strictEqual(result.status, 0);
  assert.match(result.stderr, /openssl binary not found in \$PATH/);
});
