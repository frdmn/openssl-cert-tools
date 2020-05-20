var expect = require('chai').expect,
    opensslTools = require('../main.js');

var expectedCertificate =
'-----BEGIN CERTIFICATE-----\n' +
'MIIGqzCCBZOgAwIBAgIQB0/pAsa31hmIThyhhU2ReDANBgkqhkiG9w0BAQsFADBN\n' +
'MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMScwJQYDVQQDEx5E\n' +
'aWdpQ2VydCBTSEEyIFNlY3VyZSBTZXJ2ZXIgQ0EwHhcNMTkwNzA4MDAwMDAwWhcN\n' +
'MjEwOTEwMTIwMDAwWjB2MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5p\n' +
'YTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEbMBkGA1UEChMSWSBDb21iaW5hdG9y\n' +
'LCBJbmMuMR0wGwYDVQQDExRuZXdzLnljb21iaW5hdG9yLmNvbTCCASIwDQYJKoZI\n' +
'hvcNAQEBBQADggEPADCCAQoCggEBAMsNA6BafLAJyN3SjorK4fq6P8oArZLHCHwB\n' +
'uf4NQ0Oo/CdMgrV28/PM4yh2U0++zL9ZuS3foqMOSwy6DZbZIfBa/WBjhJKd4/gy\n' +
'2yJwOGwSsIyVMpQ/HsBrZRruN2oEiu4inE4hPyYC03Z7zRlTDOuxDDBOJjuKMYRr\n' +
'aMlzOqj7ZZDLAOYgRDoGHTGF1AnqT+ZsV98rXCijgFGvHTaXqJxcz+edKfHTzy+n\n' +
'jsgbbbBJ9jGATX8qXqdqjCHm6D5G6hJ2MfcQt4Ohd5sm8BKvZAEMCcsLww2ijwx9\n' +
'j7ZadN7n7dOp5sY32BEhe7l0ki22TDS+pcaySoP8E5axqrnAMkUCAwEAAaOCA1ww\n' +
'ggNYMB8GA1UdIwQYMBaAFA+AYRyCMWHVLyjnjUY4tCzhxtniMB0GA1UdDgQWBBQO\n' +
'JfQVakUgYp9x0ncgzQTXXFjfOjAfBgNVHREEGDAWghRuZXdzLnljb21iaW5hdG9y\n' +
'LmNvbTAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUF\n' +
'BwMCMGsGA1UdHwRkMGIwL6AtoCuGKWh0dHA6Ly9jcmwzLmRpZ2ljZXJ0LmNvbS9z\n' +
'c2NhLXNoYTItZzYuY3JsMC+gLaArhilodHRwOi8vY3JsNC5kaWdpY2VydC5jb20v\n' +
'c3NjYS1zaGEyLWc2LmNybDBMBgNVHSAERTBDMDcGCWCGSAGG/WwBATAqMCgGCCsG\n' +
'AQUFBwIBFhxodHRwczovL3d3dy5kaWdpY2VydC5jb20vQ1BTMAgGBmeBDAECAjB8\n' +
'BggrBgEFBQcBAQRwMG4wJAYIKwYBBQUHMAGGGGh0dHA6Ly9vY3NwLmRpZ2ljZXJ0\n' +
'LmNvbTBGBggrBgEFBQcwAoY6aHR0cDovL2NhY2VydHMuZGlnaWNlcnQuY29tL0Rp\n' +
'Z2lDZXJ0U0hBMlNlY3VyZVNlcnZlckNBLmNydDAMBgNVHRMBAf8EAjAAMIIBfQYK\n' +
'KwYBBAHWeQIEAgSCAW0EggFpAWcAdgDuS723dc5guuFCaR+r4Z5mow9+X7By2IMA\n' +
'xHuJeqj9ywAAAWvSsgGGAAAEAwBHMEUCIQDuwilh2VuUnkTH0tmDUbAdKWDxFukD\n' +
'm/4EktTbiwgFNAIgZltmbZUzknxDpGUXkVLpFmWTogu4wAGxh72hbbFp804AdgCH\n' +
'db/nWXz4jEOZX73zbv9WjUdWNv9KtWDBtOr/XqCDDwAAAWvSsgIeAAAEAwBHMEUC\n' +
'IQDzAY1oWZD1mhX+nCKORP4DxtO3AnhLSUMOyvv3OBbICQIgWWzTJP2gsPM6vHux\n' +
'kb6fQtPekabXk0nhrOScMHr/cvAAdQBElGUusO7Or8RAB9io/ijA2uaCvtjLMbU/\n' +
'0zOWtbaBqAAAAWvSsgEiAAAEAwBGMEQCIFqbAfpfnJFvd4miwlb3ZMCy/tph+qn6\n' +
'0gFBIGhOFVlQAiBqo/dlgJEfPJU2pjPlR22kl7wTbnFnbVabTAy8eKx+DjANBgkq\n' +
'hkiG9w0BAQsFAAOCAQEARcovgnGiFSc6ve8yTxFOho47wBKXwYAUfoGiiRFybcX6\n' +
'43JcEMyH6KYU8qnfhKzp9juYBXTuc+4BqLP8fGdrP6I7xfYux6PWdhZ9ReVxZhrn\n' +
'+7neAPnr4IcDyUMGB3bqn4wslL8Go1+dHKfM+Ix8k/+ytaXWYZQgiWNwmuR3Piay\n' +
'vo5ioURVp9Hm28b1A5o828aXph6nbPhyaLD5gUdQTuprQGpJMo2tL9AmZhtw3iPH\n' +
'Nu6RzBFp27492OM1t0vvbEsNkMgD3/wSCMev5rleor1bvTT+GkSEArEdpHRydtcN\n' +
'WeNYP84Yjw6OFSHdi2W0VojRGhxm7PZCMqswN/XaBg==\n' +
'-----END CERTIFICATE-----';

describe('openssl-cert-tools test cases', function() {
  describe('getCertificate', function() {
    it('should return the expected certficate of news.ycombinator.com', function(done) {
      opensslTools.getCertificate('news.ycombinator.com', '443', function(err, crt){
        if (err) {
          console.log(err);
        } else {
          expect(crt).to.deep.equal(expectedCertificate);
          done();
        }
      });
    });

    it('should return error, because the port 65536 doesn\'t exist', function(done) {
      opensslTools.getCertificate('localhost', '65536', function(err, crt){
        if (err) {
          expect(err.toString()).to.contains('Error');
          done();
        } else {
          console.log(crt);
        }
      });
    });

    it('should run into timeout, because no HTTPS on news.ycombinator.com:444', function(done) {
      opensslTools.getCertificate('news.ycombinator.com', '444', function(err, crt){
        if (err) {
          expect(err.toString()).to.contains('Time out while trying to extract');
          done();
        } else {
          console.log(crt);
        }
      });
    });

  });
});
