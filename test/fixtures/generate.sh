#!/bin/sh
#
# Regenerates the test certificate hierarchy:
#
#   Test Root CA -> Test Intermediate CA -> server cert for localhost
#
# Run from anywhere: sh test/fixtures/generate.sh
#
set -eu
cd "$(dirname "$0")"

# Root CA
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
  -keyout root-key.pem -out root-cert.pem \
  -subj '/C=DE/O=openssl-cert-tools/CN=Test Root CA'

# Intermediate CA (signed by root)
openssl req -new -newkey rsa:2048 -nodes \
  -keyout intermediate-key.pem -out intermediate.csr \
  -subj '/C=DE/O=openssl-cert-tools, Inc./CN=Test Intermediate CA'
openssl x509 -req -in intermediate.csr \
  -CA root-cert.pem -CAkey root-key.pem -CAcreateserial -days 3650 \
  -extfile intermediate.ext -out intermediate-cert.pem

# Server certificate (signed by intermediate), valid for localhost.
# The comma in the organization name is intentional: it exercises
# RFC2253 escape handling when the library parses issuer/subject DNs.
openssl req -new -newkey rsa:2048 -nodes \
  -keyout server-key.pem -out server.csr \
  -subj '/C=DE/ST=Bavaria/L=Eibelstadt/O=Foo, Inc./OU=openssl-cert-tools/CN=localhost/emailAddress=admin@example.com'
openssl x509 -req -in server.csr \
  -CA intermediate-cert.pem -CAkey intermediate-key.pem -CAcreateserial -days 3650 \
  -extfile server.ext -out server-cert.pem

# EC certificate/CSR/key trio (prime256v1) from a single keypair,
# signed by the intermediate. Exercises the SPKI based public key
# hash for non-RSA keys, where the modulus hash functions fail.
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out ec-key.pem
openssl req -new -key ec-key.pem -out ec-csr.pem \
  -subj '/C=DE/O=openssl-cert-tools/CN=localhost EC'
openssl x509 -req -in ec-csr.pem \
  -CA intermediate-cert.pem -CAkey intermediate-key.pem -CAcreateserial -days 3650 \
  -out ec-cert.pem

rm -f intermediate.csr root-cert.srl intermediate-cert.srl
