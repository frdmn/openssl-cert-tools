'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const tls = require('node:tls');

const opensslTools = require('../main.js');

const fixtures = path.join(__dirname, 'fixtures');

const serverKey = fs.readFileSync(path.join(fixtures, 'server-key.pem'));
// A served chain must be a single value: cert arrays are for SNI contexts,
// where every entry would need to match the key.
const serverChain = Buffer.concat([
  fs.readFileSync(path.join(fixtures, 'server-cert.pem')),
  fs.readFileSync(path.join(fixtures, 'intermediate-cert.pem'))
]);

let tlsServer;
let tlsPort;
let silentServer;
let silentPort;

before(async () => {
  // Local TLS server serving a leaf + intermediate chain
  tlsServer = tls.createServer({ key: serverKey, cert: serverChain }, (socket) => socket.end());
  await new Promise((resolve) => tlsServer.listen(0, '127.0.0.1', resolve));
  tlsPort = tlsServer.address().port;

  // TCP server that accepts connections but never responds
  silentServer = net.createServer(() => {});
  await new Promise((resolve) => silentServer.listen(0, '127.0.0.1', resolve));
  silentPort = silentServer.address().port;
});

after(async () => {
  await new Promise((resolve) => tlsServer.close(resolve));
  await new Promise((resolve) => silentServer.close(resolve));
});

test('getCertificate returns the leaf certificate of a TLS server', async () => {
  const certificate = await opensslTools.getCertificate('localhost', tlsPort);

  assert.match(certificate, /^-----BEGIN CERTIFICATE-----/);
  assert.match(certificate, /-----END CERTIFICATE-----$/);

  const info = await opensslTools.getCertificateInfo(certificate);
  assert.strictEqual(info.subject.CN, 'localhost');
});

test('getCertificateChain returns the complete chain served by a TLS server', async () => {
  const chain = await opensslTools.getCertificateChain('localhost', tlsPort);

  assert.strictEqual(chain.length, 2);

  const [leaf, intermediate] = await Promise.all(chain.map((cert) => opensslTools.getCertificateInfo(cert)));
  assert.strictEqual(leaf.subject.CN, 'localhost');
  assert.strictEqual(leaf.issuer.CN, 'Test Intermediate CA');
  assert.strictEqual(intermediate.subject.CN, 'Test Intermediate CA');
});

test('getCertificate rejects invalid ports', async () => {
  await assert.rejects(() => opensslTools.getCertificate('localhost', 70000), /Invalid port/);
  await assert.rejects(() => opensslTools.getCertificate('localhost', 'abc'), /Invalid port/);
});

test('getCertificate rejects when the connection is refused', async () => {
  // Find a port with nothing listening
  const reserve = net.createServer();
  await new Promise((resolve) => reserve.listen(0, '127.0.0.1', resolve));
  const closedPort = reserve.address().port;
  await new Promise((resolve) => reserve.close(resolve));

  await assert.rejects(
    () => opensslTools.getCertificate('localhost', closedPort, { timeout: 5000 }),
    /Couldn't extract certificate/
  );
});

test('getCertificateChain rejects when the connection is refused', async () => {
  const reserve = net.createServer();
  await new Promise((resolve) => reserve.listen(0, '127.0.0.1', resolve));
  const closedPort = reserve.address().port;
  await new Promise((resolve) => reserve.close(resolve));

  await assert.rejects(
    () => opensslTools.getCertificateChain('localhost', closedPort, { timeout: 5000 }),
    /Couldn't extract certificate chain/
  );
});

test('getCertificateChain times out when the server never responds', async () => {
  await assert.rejects(
    () => opensslTools.getCertificateChain('localhost', silentPort, { timeout: 700 }),
    /Time out while trying to extract certificate chain/
  );
});

test('getCertificate fetches a live certificate (requires network)', { skip: !process.env.RUN_NETWORK_TESTS }, async () => {
  const certificate = await opensslTools.getCertificate('news.ycombinator.com', '443', { timeout: 15000 });
  assert.match(certificate, /^-----BEGIN CERTIFICATE-----/);

  const chain = await opensslTools.getCertificateChain('news.ycombinator.com', '443', { timeout: 15000 });
  assert.ok(chain.length >= 1);

  const info = await opensslTools.getCertificateInfo(certificate);
  assert.ok(info.issuer.CN);
  assert.ok(info.remainingDays >= 0);
});
