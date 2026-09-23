/**
 *                                 _       _              _
 *   ___  _ __   ___ _ __  ___ ___| |     | |_ ___   ___ | |___
 *  / _ \| '_ \ / _ \ '_ \/ __/ __| |_____| __/ _ \ / _ \| / __|
 * | (_) | |_) |  __/ | | \__ \__ \ |_____| || (_) | (_) | \__ \
 *  \___/| .__/ \___|_| |_|___/___/_|      \__\___/ \___/|_|___/
 *       |_|
 *
 * Type definitions for openssl-cert-tools
 */

/** Digest algorithm used by the hash functions */
export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

/** Options for remote certificate lookups */
export interface SslTargetOptions {
  /** Time out in milliseconds. Default: 5000 */
  timeout?: number;
}

/** Options for the hash functions */
export interface HashOptions {
  /** Digest algorithm. Default: 'sha256' */
  algorithm?: HashAlgorithm;
}

/**
 * Key/value pairs of a distinguished name, e.g. `{ C: 'DE', CN: 'example.com' }`.
 * If a component appears more than once, the last occurrence wins.
 */
export interface DistinguishedName {
  [component: string]: string;
}

/** Information decoded from a certificate */
export interface CertificateInfo {
  /** The input certificate, echoed as given (string or Buffer) */
  certificate: string | Buffer;
  issuer: DistinguishedName;
  subject: DistinguishedName;
  validFrom: Date;
  validTo: Date;
  /** Days until the certificate expires; 0 if already expired */
  remainingDays: number;
  /** Days since the certificate expired; only present for expired certificates */
  expiredDays?: number;
}

/** Information decoded from a certificate signing request */
export interface CertificateRequestInfo {
  /** The input request, echoed as given (string or Buffer) */
  certificate: string | Buffer;
  subject: DistinguishedName;
}

/** Download the certificate of a remote host */
export function getCertificate(host: string, port: number | string, options?: SslTargetOptions): Promise<string>;

/** Download the complete certificate chain served by a remote host */
export function getCertificateChain(host: string, port: number | string, options?: SslTargetOptions): Promise<string[]>;

/** Decode issuer, subject and validity dates of a certificate */
export function getCertificateInfo(certificate: string | Buffer): Promise<CertificateInfo>;

/** Decode the subject of a certificate signing request */
export function getCertificateRequestInfo(certificateRequest: string | Buffer): Promise<CertificateRequestInfo>;

/** Hash the modulus of a certificate (SHA-256 by default) */
export function getCertificateHash(certificate: string | Buffer, options?: HashOptions): Promise<string>;

/** Hash the modulus of a certificate signing request (SHA-256 by default) */
export function getCertificateRequestHash(certificateRequest: string | Buffer, options?: HashOptions): Promise<string>;

/** Hash the modulus of a private key (SHA-256 by default) */
export function getPrivateKeyHash(privateKey: string | Buffer, options?: HashOptions): Promise<string>;

/** Input type accepted by getPublicKeyHash */
export type PublicKeyHashKind = 'certificate' | 'request' | 'key';

/**
 * Hash the Subject Public Key Info (SPKI) of the public key inside a
 * certificate, certificate signing request or private key (SHA-256 by
 * default). Inputs from the same keypair produce the same hash, for any
 * key algorithm (RSA, EC, Ed25519, ...).
 */
export function getPublicKeyHash(input: string | Buffer, kind: PublicKeyHashKind, options?: HashOptions): Promise<string>;
