var expect = require('chai').expect,
    opensslTools = require('../main.js');

var testCertificate =
'-----BEGIN CERTIFICATE-----\n' +
'MIIGLzCCBdagAwIBAgIQH3be7EHzH3zHdBvhyXC4wDAKBggqhkjOPQQDAjCBkjEL\n' +
'MAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UE\n' +
'BxMHU2FsZm9yZDEaMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQxODA2BgNVBAMT\n' +
'L0NPTU9ETyBFQ0MgRG9tYWluIFZhbGlkYXRpb24gU2VjdXJlIFNlcnZlciBDQSAy\n' +
'MB4XDTE1MDkyNjAwMDAwMFoXDTE1MTIzMDIzNTk1OVowazEhMB8GA1UECxMYRG9t\n' +
'YWluIENvbnRyb2wgVmFsaWRhdGVkMSEwHwYDVQQLExhQb3NpdGl2ZVNTTCBNdWx0\n' +
'aS1Eb21haW4xIzAhBgNVBAMTGnNuaTMzMjgwLmNsb3VkZmxhcmVzc2wuY29tMFkw\n' +
'EwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE/VVyjyzoogarRb9sqmpqwwAf+Kh69I9E\n' +
'5NeT/1s9nVjvEzYTnrEN3xqNrzbA/y61AbJ6Yy714OCq1ViAmBuCPaOCBDIwggQu\n' +
'MB8GA1UdIwQYMBaAFEAJYWfwvINxT94SCCxv1NQrdj2WMB0GA1UdDgQWBBT1uV7H\n' +
'fwV8Ca9MxjAiSHOEyE9EVDAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAd\n' +
'BgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwTwYDVR0gBEgwRjA6BgsrBgEE\n' +
'AbIxAQICBzArMCkGCCsGAQUFBwIBFh1odHRwczovL3NlY3VyZS5jb21vZG8uY29t\n' +
'L0NQUzAIBgZngQwBAgEwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDovL2NybC5jb21v\n' +
'ZG9jYTQuY29tL0NPTU9ET0VDQ0RvbWFpblZhbGlkYXRpb25TZWN1cmVTZXJ2ZXJD\n' +
'QTIuY3JsMIGIBggrBgEFBQcBAQR8MHowUQYIKwYBBQUHMAKGRWh0dHA6Ly9jcnQu\n' +
'Y29tb2RvY2E0LmNvbS9DT01PRE9FQ0NEb21haW5WYWxpZGF0aW9uU2VjdXJlU2Vy\n' +
'dmVyQ0EyLmNydDAlBggrBgEFBQcwAYYZaHR0cDovL29jc3AuY29tb2RvY2E0LmNv\n' +
'bTCCAnkGA1UdEQSCAnAwggJsghpzbmkzMzI4MC5jbG91ZGZsYXJlc3NsLmNvbYIT\n' +
'Ki4xMDAxY29ja3RhaWxzLmNvbYIRKi4xMDAxbW90ZXVycy5jb22CEiouYWxpZml0\n' +
'emdlcmFsZC5tZYINKi5hbGlrZml0ei5tZYINKi5ib3J1dC5wYXJ0eYINKi5lbGth\n' +
'c3NhLmNvbYIIKi5mcmQubW6CGyouZy1hbmQtYy1lbGVjdHJvbmljcy5jby51a4IJ\n' +
'Ki5naGFjLmRlgg4qLmtub3R0Ym95cy5ldYIaKi5tb250Z29tZXJ5dm9jYWxjb2Fj\n' +
'aC5jb22CDioubW96YWlrLmNvLmlkggsqLm1vemFpay5pZIIKKi5uZXdlci5jY4IW\n' +
'Ki5wZXJzb25hbGl6YXJibG9nLmNvbYIUKi5zd2FnZG9nd2Fsa2luZy5jb22CGSou\n' +
'dGhlZ29sZGVuYW5kY29tcGFueS5jb22CETEwMDFjb2NrdGFpbHMuY29tgg8xMDAx\n' +
'bW90ZXVycy5jb22CEGFsaWZpdHpnZXJhbGQubWWCC2FsaWtmaXR6Lm1lggtib3J1\n' +
'dC5wYXJ0eYILZWxrYXNzYS5jb22CBmZyZC5tboIZZy1hbmQtYy1lbGVjdHJvbmlj\n' +
'cy5jby51a4IHZ2hhYy5kZYIMa25vdHRib3lzLmV1ghhtb250Z29tZXJ5dm9jYWxj\n' +
'b2FjaC5jb22CDG1vemFpay5jby5pZIIJbW96YWlrLmlkgghuZXdlci5jY4IUcGVy\n' +
'c29uYWxpemFyYmxvZy5jb22CEnN3YWdkb2d3YWxraW5nLmNvbYIXdGhlZ29sZGVu\n' +
'YW5kY29tcGFueS5jb20wCgYIKoZIzj0EAwIDRwAwRAIgZzfbzLiht8LIcEwvCKIj\n' +
'xRC5hF3mcVUzAYMTsAp+PWoCIBCaOZvgDR0t7tCijM6o5N3vNHDs0vQbtQkEaQSx\n' +
'/j9A\n' +
'-----END CERTIFICATE-----';

var expectedCertificateHash = 'e30fbb5ba0cecaad7a2d0cb836584c05';

var testCertificateRequest =
'-----BEGIN CERTIFICATE REQUEST-----\n' +
'MIIC+jCCAeICAQAwgbQxCzAJBgNVBAYTAkRFMRAwDgYDVQQIDAdCYXZhcmlhMRMw\n' +
'EQYDVQQHDApFaWJlbHN0YWR0MSUwIwYDVQQKDBxZRUFIV0hBVD8hIE1pbmVjcmFm\n' +
'dCBzZXJ2ZXJzMRQwEgYDVQQLDAtNYWlsIHN5c3RlbTEcMBoGA1UEAwwTY2hld2Jh\n' +
'Y2NhLnllYWh3aC5hdDEjMCEGCSqGSIb3DQEJARYUcG9zdG1hc3RlckB5ZWFod2gu\n' +
'YXQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDAi9mSsi01EDc3QMCL\n' +
'lreBVzDSsICIc8w4mttgSg+cW/Hl98iDZ/awyv0hEeXLg/rybR42LHCRXyJbiuV8\n' +
'edOGbYN5ODD3di5tOmzjgJm34gmSxuzzZSe6431C9nR0BJaPwGbBoFqBO5MiWD1i\n' +
'Z7Cv3a+xJQO0gN+3PIgSMOGAD608bqJN58ewtqqYY0xM3vQCEcf40TJJc8fv1+a5\n' +
'1BM07s26L0Az5xZeIcWOqBgvBQhY0dI3QEKW5BbQDVA/OFilpbJFqCseosjz0/YG\n' +
'tS46CHGjNuViAcxeJ/IWKRWB3TCd2KhIqaEZLCVTWPqCaQ7CioITgrQW+c/qVCfv\n' +
'to6xAgMBAAGgADANBgkqhkiG9w0BAQsFAAOCAQEAu8gxx8RrQPeWvKJiY3fmTNHg\n' +
'lEDQU2vTPU+56UZEuCVztj1LdmjzFpH6biFa+C2XxkTxfeXc9OakklWlIgfP7b2Y\n' +
'RTObWPcpyDSE+yB79Lhybb4Wr3vASJJWSgwqymp5BjEj0iHeVFzvippvvyPieafr\n' +
'a31cPiG5UbOWOXpeZ73K1qBqmpRglzYouqWPA0D9e9wks71INhPL8wODRha2RZ9M\n' +
'voaVZHsm6NB+WAZzK+wznc1wLs/mVigqfjakU//VXi8opb7hTkH1/8h8Pn5uCFM7\n' +
'3UcTESfcIv3XuKeLXKQEJZtR3PQlWDb+pI7x1iUm7k0Q1KXsYysdUzq/fGTSdw==\n' +
'-----END CERTIFICATE REQUEST-----';

var expectedCertificateRequestHash = 'dbc530fbb1e60b5cf43cc9c7f8dcc1ad';

var testPrivateKey =
'-----BEGIN RSA PRIVATE KEY-----\n' +
'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\n' +
'-----END RSA PRIVATE KEY-----\n';

var expectedPrivateKeyHash = '0b47baa451ba0d99eda2ca44dc4bd000';

describe('openssl-cert-tools test cases', function() {
  describe('getCertificateInfo', function() {
    it('should return the appropriate "certificate" object', function(done) {
      opensslTools.getCertificateInfo(testCertificate, function(err, data){
        if (err) {
          console.error(err);
        } else {
          expect(data.certificate).to.deep.equal('-----BEGIN CERTIFICATE-----\nMIIGLzCCBdagAwIBAgIQH3be7EHzH3zHdBvhyXC4wDAKBggqhkjOPQQDAjCBkjEL\nMAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UE\nBxMHU2FsZm9yZDEaMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQxODA2BgNVBAMT\nL0NPTU9ETyBFQ0MgRG9tYWluIFZhbGlkYXRpb24gU2VjdXJlIFNlcnZlciBDQSAy\nMB4XDTE1MDkyNjAwMDAwMFoXDTE1MTIzMDIzNTk1OVowazEhMB8GA1UECxMYRG9t\nYWluIENvbnRyb2wgVmFsaWRhdGVkMSEwHwYDVQQLExhQb3NpdGl2ZVNTTCBNdWx0\naS1Eb21haW4xIzAhBgNVBAMTGnNuaTMzMjgwLmNsb3VkZmxhcmVzc2wuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE/VVyjyzoogarRb9sqmpqwwAf+Kh69I9E\n5NeT/1s9nVjvEzYTnrEN3xqNrzbA/y61AbJ6Yy714OCq1ViAmBuCPaOCBDIwggQu\nMB8GA1UdIwQYMBaAFEAJYWfwvINxT94SCCxv1NQrdj2WMB0GA1UdDgQWBBT1uV7H\nfwV8Ca9MxjAiSHOEyE9EVDAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAd\nBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwTwYDVR0gBEgwRjA6BgsrBgEE\nAbIxAQICBzArMCkGCCsGAQUFBwIBFh1odHRwczovL3NlY3VyZS5jb21vZG8uY29t\nL0NQUzAIBgZngQwBAgEwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDovL2NybC5jb21v\nZG9jYTQuY29tL0NPTU9ET0VDQ0RvbWFpblZhbGlkYXRpb25TZWN1cmVTZXJ2ZXJD\nQTIuY3JsMIGIBggrBgEFBQcBAQR8MHowUQYIKwYBBQUHMAKGRWh0dHA6Ly9jcnQu\nY29tb2RvY2E0LmNvbS9DT01PRE9FQ0NEb21haW5WYWxpZGF0aW9uU2VjdXJlU2Vy\ndmVyQ0EyLmNydDAlBggrBgEFBQcwAYYZaHR0cDovL29jc3AuY29tb2RvY2E0LmNv\nbTCCAnkGA1UdEQSCAnAwggJsghpzbmkzMzI4MC5jbG91ZGZsYXJlc3NsLmNvbYIT\nKi4xMDAxY29ja3RhaWxzLmNvbYIRKi4xMDAxbW90ZXVycy5jb22CEiouYWxpZml0\nemdlcmFsZC5tZYINKi5hbGlrZml0ei5tZYINKi5ib3J1dC5wYXJ0eYINKi5lbGth\nc3NhLmNvbYIIKi5mcmQubW6CGyouZy1hbmQtYy1lbGVjdHJvbmljcy5jby51a4IJ\nKi5naGFjLmRlgg4qLmtub3R0Ym95cy5ldYIaKi5tb250Z29tZXJ5dm9jYWxjb2Fj\naC5jb22CDioubW96YWlrLmNvLmlkggsqLm1vemFpay5pZIIKKi5uZXdlci5jY4IW\nKi5wZXJzb25hbGl6YXJibG9nLmNvbYIUKi5zd2FnZG9nd2Fsa2luZy5jb22CGSou\ndGhlZ29sZGVuYW5kY29tcGFueS5jb22CETEwMDFjb2NrdGFpbHMuY29tgg8xMDAx\nbW90ZXVycy5jb22CEGFsaWZpdHpnZXJhbGQubWWCC2FsaWtmaXR6Lm1lggtib3J1\ndC5wYXJ0eYILZWxrYXNzYS5jb22CBmZyZC5tboIZZy1hbmQtYy1lbGVjdHJvbmlj\ncy5jby51a4IHZ2hhYy5kZYIMa25vdHRib3lzLmV1ghhtb250Z29tZXJ5dm9jYWxj\nb2FjaC5jb22CDG1vemFpay5jby5pZIIJbW96YWlrLmlkgghuZXdlci5jY4IUcGVy\nc29uYWxpemFyYmxvZy5jb22CEnN3YWdkb2d3YWxraW5nLmNvbYIXdGhlZ29sZGVu\nYW5kY29tcGFueS5jb20wCgYIKoZIzj0EAwIDRwAwRAIgZzfbzLiht8LIcEwvCKIj\nxRC5hF3mcVUzAYMTsAp+PWoCIBCaOZvgDR0t7tCijM6o5N3vNHDs0vQbtQkEaQSx\n/j9A\n-----END CERTIFICATE-----');
          done();
         }
      });
    });

    it('should return the appropriate "issuer" object', function(done) {
      opensslTools.getCertificateInfo(testCertificate, function(err, data){
        if (err) {
          console.error(err);
        } else {
          expect(data.issuer).to.deep.equal({
            C: 'GB',
            ST: 'Greater Manchester',
            L: 'Salford',
            O: 'COMODO CA Limited',
            CN: 'COMODO ECC Domain Validation Secure Server CA 2'
          });
          done();
         }
      });
    });

    it('should return the appropriate "subject" object', function(done) {
      opensslTools.getCertificateInfo(testCertificate, function(err, data){
        if (err) {
          console.error(err);
        } else {
          expect(data.subject).to.deep.equal({
            OU: 'Domain Control Validated',
            CN: 'sni33280.cloudflaressl.com'
          });
          done();
         }
      });
    });
  });

  describe('getCertificateRequestInfo', function() {
    it('should return the appropriate "certificate" object', function(done) {
      opensslTools.getCertificateRequestInfo(testCertificateRequest, function(err, data){
        if (err) {
          console.error(err);
        } else {
          expect(data.certificate).to.deep.equal('-----BEGIN CERTIFICATE REQUEST-----\nMIIC+jCCAeICAQAwgbQxCzAJBgNVBAYTAkRFMRAwDgYDVQQIDAdCYXZhcmlhMRMw\nEQYDVQQHDApFaWJlbHN0YWR0MSUwIwYDVQQKDBxZRUFIV0hBVD8hIE1pbmVjcmFm\ndCBzZXJ2ZXJzMRQwEgYDVQQLDAtNYWlsIHN5c3RlbTEcMBoGA1UEAwwTY2hld2Jh\nY2NhLnllYWh3aC5hdDEjMCEGCSqGSIb3DQEJARYUcG9zdG1hc3RlckB5ZWFod2gu\nYXQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDAi9mSsi01EDc3QMCL\nlreBVzDSsICIc8w4mttgSg+cW/Hl98iDZ/awyv0hEeXLg/rybR42LHCRXyJbiuV8\nedOGbYN5ODD3di5tOmzjgJm34gmSxuzzZSe6431C9nR0BJaPwGbBoFqBO5MiWD1i\nZ7Cv3a+xJQO0gN+3PIgSMOGAD608bqJN58ewtqqYY0xM3vQCEcf40TJJc8fv1+a5\n1BM07s26L0Az5xZeIcWOqBgvBQhY0dI3QEKW5BbQDVA/OFilpbJFqCseosjz0/YG\ntS46CHGjNuViAcxeJ/IWKRWB3TCd2KhIqaEZLCVTWPqCaQ7CioITgrQW+c/qVCfv\nto6xAgMBAAGgADANBgkqhkiG9w0BAQsFAAOCAQEAu8gxx8RrQPeWvKJiY3fmTNHg\nlEDQU2vTPU+56UZEuCVztj1LdmjzFpH6biFa+C2XxkTxfeXc9OakklWlIgfP7b2Y\nRTObWPcpyDSE+yB79Lhybb4Wr3vASJJWSgwqymp5BjEj0iHeVFzvippvvyPieafr\na31cPiG5UbOWOXpeZ73K1qBqmpRglzYouqWPA0D9e9wks71INhPL8wODRha2RZ9M\nvoaVZHsm6NB+WAZzK+wznc1wLs/mVigqfjakU//VXi8opb7hTkH1/8h8Pn5uCFM7\n3UcTESfcIv3XuKeLXKQEJZtR3PQlWDb+pI7x1iUm7k0Q1KXsYysdUzq/fGTSdw==\n-----END CERTIFICATE REQUEST-----');
          done();
         }
      });
    });

    it('should return the appropriate "subject" object', function(done) {
      opensslTools.getCertificateRequestInfo(testCertificateRequest, function(err, data){
        if (err) {
          console.error(err);
        } else {
          expect(data.subject).to.deep.equal({
            C: 'DE',
            ST: 'Bavaria',
            L: 'Eibelstadt',
            O: 'YEAHWHAT?! Minecraft servers',
            OU: 'Mail system',
            CN: 'chewbacca.yeahwh.at',
            emailAddress: 'postmaster@yeahwh.at'
          });
          done();
         }
      });
    });
  });
  describe('getCertificateHash', function() {
    it('should return the appropriate MD5 hash', function(done) {
      opensslTools.getCertificateHash(testCertificate, function(err, data){
        if (err) {
          console.error(err);
        } else {
          expect(data).to.equal(expectedCertificateHash);
          done();
         }
      });
    });
  });
  describe('getCertificateRequestHash', function() {
    it('should return the appropriate MD5 hash', function(done) {
      opensslTools.getCertificateRequestHash(testCertificateRequest, function(err, data){
        if (err) {
          console.error(err);
        } else {
          expect(data).to.equal(expectedCertificateRequestHash);
          done();
         }
      });
    });
  });
  describe('getPrivateKeyHash', function() {
    it('should return the appropriate MD5 hash', function(done) {
      opensslTools.getPrivateKeyHash(testPrivateKey, function(err, data){
        if (err) {
          console.error(err);
        } else {
          expect(data).to.equal(expectedPrivateKeyHash);
          done();
         }
      });
    });
  });
});
