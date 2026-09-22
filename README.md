# openssl-cert-tools

[![npm version](https://img.shields.io/npm/v/openssl-cert-tools.svg)](https://www.npmjs.com/package/openssl-cert-tools) [![CI](https://github.com/frdmn/openssl-cert-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/frdmn/openssl-cert-tools/actions/workflows/ci.yml)

Node.js module to handle TLS certificates using OpenSSL.

- [`getCertificateInfo()`](#getcertificateinfo)
- [`getCertificateRequestInfo()`](#getcertificaterequestinfo)
- [`getCertificate()`](#getcertificate)
- [`getCertificateChain()`](#getcertificatechain)
- [`getCertificateHash()`](#getcertificatehash)
- [`getCertificateRequestHash()`](#getcertificaterequesthash)
- [`getPrivateKeyHash()`](#getprivatekeyhash)

## Installation

```shell
cd your-project/
npm install openssl-cert-tools
```

## Usage

All functions return Promises and work with `async`/`await`:

```javascript
const opensslTools = require('openssl-cert-tools');
```

### `getCertificateInfo()`

Decodes a PEM encoded certificate (string or `Buffer`) into its issuer,
subject and validity dates:

```javascript
const fs = require('fs');

const demoCertificate = fs.readFileSync('certificate.pem');

const info = await opensslTools.getCertificateInfo(demoCertificate);
console.log(info);
/* =>
 * {
 *   certificate: <Buffer ...>,
 *   issuer: {
 *     C: 'US',
 *     O: "Let's Encrypt",
 *     CN: 'R11'
 *   },
 *   subject: {
 *     CN: 'frd.mn'
 *   },
 *   validFrom: 2026-06-17T00:00:00.000Z,
 *   validTo: 2026-12-16T00:00:00.000Z,
 *   remainingDays: 84
 * }
 */
```

For expired certificates, `remainingDays` is `0` and the additional
`expiredDays` property reports how long ago the certificate expired.

Two behaviors worth knowing:

- `certificate` echoes the input exactly as it was passed in (a `Buffer`
  in, a `Buffer` out; a string in, a string out).
- `issuer`/`subject` are plain objects keyed by DN component. If a
  component appears more than once (e.g. two `OU=` entries), the last
  occurrence wins.

Distinguished names are parsed from the RFC2253 representation, so values
containing escaped commas or equals signs (e.g. `O=Foo\, Inc.`) are handled
correctly.

### `getCertificateRequestInfo()`

Decodes a PEM encoded certificate signing request into its subject:

```javascript
const demoCertificateRequest = fs.readFileSync('request.csr');

const info = await opensslTools.getCertificateRequestInfo(demoCertificateRequest);
console.log(info);
/* =>
 * {
 *   certificate: <Buffer ...>,
 *   subject: {
 *     C: 'DE',
 *     ST: 'Bavaria',
 *     L: 'Eibelstadt',
 *     O: 'YEAHWHAT?! Minecraft servers',
 *     OU: 'Mail system',
 *     CN: 'chewbacca.yeahwh.at',
 *     emailAddress: 'postmaster@yeahwh.at'
 *   }
 * }
 */
```

### `getCertificate()`

Downloads the certificate of a remote host:

```javascript
const crt = await opensslTools.getCertificate('frd.mn', '443');
console.log(crt);
/* =>
 * -----BEGIN CERTIFICATE-----
 * MIIFeDCCA2igAwIBAgISAy3SwuLrRcMtba+SuIL2Dtr7MA0GCSqGSIb3DQEBCwUA
 * ...
 * -----END CERTIFICATE-----
 */
```

An optional third argument adjusts the timeout (in milliseconds,
defaults to `5000`):

```javascript
const crt = await opensslTools.getCertificate('frd.mn', 443, { timeout: 10000 });
```

### `getCertificateChain()`

Downloads the complete certificate chain served by a remote host:

```javascript
const chain = await opensslTools.getCertificateChain('frd.mn', '443');
console.log(chain);
/* =>
 * [
 *   '-----BEGIN CERTIFICATE-----\n...',
 *   '-----BEGIN CERTIFICATE-----\n...',
 *   '-----BEGIN CERTIFICATE-----\n...'
 * ]
 */
```

Accepts the same `{ timeout }` option as `getCertificate()`.

### `getCertificateHash()`

Returns the hash of a certificate's modulus. Useful to check whether a
certificate, a request and a private key belong together: matching inputs
produce the same modulus hash. Defaults to SHA-256:

```javascript
await opensslTools.getCertificateHash(demoCertificate);
// => '903852adf40f7087df962b0a04312c36bef3f20206f8a01f5d7e8a23f59e1fd2'

await opensslTools.getCertificateHash(demoCertificate, { algorithm: 'md5' });
// => 'baf59ff7f5b05fde6799439b6f31a290'
```

Supported algorithms: `md5`, `sha1`, `sha256` (default) and `sha512`.

### `getCertificateRequestHash()`

Same as `getCertificateHash()`, but for certificate signing requests:

```javascript
await opensslTools.getCertificateRequestHash(demoCertificateRequest);
// => '9ae9b46a2030628f01883f32c88a10e7d62c695dcbfedaa1b1c755a749a5db6a'
```

### `getPrivateKeyHash()`

Same as `getCertificateHash()`, but for private keys:

```javascript
await opensslTools.getPrivateKeyHash(demoPrivateKey);
// => '0583b0f265569ec7b472c587e7704a78462a53a518949df979e921b5feb255f3'
```

## Migrating from 1.x

Version 2.0 is a breaking rewrite:

- **Promises instead of callbacks**: every function returns a Promise,
  drop the callback and use `await` (or `.then()`). If you need callbacks,
  Node's built-in [`util.callbackify()`](https://nodejs.org/api/util.html#utilcallbackifyfn)
  can wrap the new functions.
- **SHA-256 instead of MD5**: the three hash functions hash the modulus
  with SHA-256 by default. Pass `{ algorithm: 'md5' }` to keep comparing
  against `openssl x509 -noout -modulus | openssl md5` output.
- **Hash values changed**: besides the new default algorithm, 1.x produced
  mangled hashes (`MD5<hash>`) on OpenSSL 3.x because its output prefix
  parsing broke.
- **Configurable timeout**: `getCertificate()` and `getCertificateChain()`
  accept `{ timeout }` in milliseconds instead of the fixed 5 second limit.
- **DN values keep their exact content**: 1.x split issuer/subject names on
  every comma and equals sign, corrupting values like `O=Foo, Inc.`.

## Contributing

1. Fork it
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## Requirements / Dependencies

* Node.js >= 18
* OpenSSL binary in `$PATH` (OpenSSL 1.x, OpenSSL 3.x and LibreSSL are
  supported and covered by CI)

## Credits

* @[es128](https://github.com/es128/) for the [ssl-utils](https://github.com/es128/ssl-utils/) Node module:
https://github.com/es128/ssl-utils/

## License

[MIT](LICENSE)
