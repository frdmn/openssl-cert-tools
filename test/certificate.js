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

var expectedCertificateChain =
[
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
    '-----END CERTIFICATE-----',
  '-----BEGIN CERTIFICATE-----\n' +
    'MIIElDCCA3ygAwIBAgIQAf2j627KdciIQ4tyS8+8kTANBgkqhkiG9w0BAQsFADBh\n' +
    'MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3\n' +
    'd3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD\n' +
    'QTAeFw0xMzAzMDgxMjAwMDBaFw0yMzAzMDgxMjAwMDBaME0xCzAJBgNVBAYTAlVT\n' +
    'MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxJzAlBgNVBAMTHkRpZ2lDZXJ0IFNIQTIg\n' +
    'U2VjdXJlIFNlcnZlciBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB\n' +
    'ANyuWJBNwcQwFZA1W248ghX1LFy949v/cUP6ZCWA1O4Yok3wZtAKc24RmDYXZK83\n' +
    'nf36QYSvx6+M/hpzTc8zl5CilodTgyu5pnVILR1WN3vaMTIa16yrBvSqXUu3R0bd\n' +
    'KpPDkC55gIDvEwRqFDu1m5K+wgdlTvza/P96rtxcflUxDOg5B6TXvi/TC2rSsd9f\n' +
    '/ld0Uzs1gN2ujkSYs58O09rg1/RrKatEp0tYhG2SS4HD2nOLEpdIkARFdRrdNzGX\n' +
    'kujNVA075ME/OV4uuPNcfhCOhkEAjUVmR7ChZc6gqikJTvOX6+guqw9ypzAO+sf0\n' +
    '/RR3w6RbKFfCs/mC/bdFWJsCAwEAAaOCAVowggFWMBIGA1UdEwEB/wQIMAYBAf8C\n' +
    'AQAwDgYDVR0PAQH/BAQDAgGGMDQGCCsGAQUFBwEBBCgwJjAkBggrBgEFBQcwAYYY\n' +
    'aHR0cDovL29jc3AuZGlnaWNlcnQuY29tMHsGA1UdHwR0MHIwN6A1oDOGMWh0dHA6\n' +
    'Ly9jcmwzLmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydEdsb2JhbFJvb3RDQS5jcmwwN6A1\n' +
    'oDOGMWh0dHA6Ly9jcmw0LmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydEdsb2JhbFJvb3RD\n' +
    'QS5jcmwwPQYDVR0gBDYwNDAyBgRVHSAAMCowKAYIKwYBBQUHAgEWHGh0dHBzOi8v\n' +
    'd3d3LmRpZ2ljZXJ0LmNvbS9DUFMwHQYDVR0OBBYEFA+AYRyCMWHVLyjnjUY4tCzh\n' +
    'xtniMB8GA1UdIwQYMBaAFAPeUDVW0Uy7ZvCj4hsbw5eyPdFVMA0GCSqGSIb3DQEB\n' +
    'CwUAA4IBAQAjPt9L0jFCpbZ+QlwaRMxp0Wi0XUvgBCFsS+JtzLHgl4+mUwnNqipl\n' +
    '5TlPHoOlblyYoiQm5vuh7ZPHLgLGTUq/sELfeNqzqPlt/yGFUzZgTHbO7Djc1lGA\n' +
    '8MXW5dRNJ2Srm8c+cftIl7gzbckTB+6WohsYFfZcTEDts8Ls/3HB40f/1LkAtDdC\n' +
    '2iDJ6m6K7hQGrn2iWZiIqBtvLfTyyRRfJs8sjX7tN8Cp1Tm5gr8ZDOo0rwAhaPit\n' +
    'c+LJMto4JQtV05od8GiG7S5BNO98pVAdvzr508EIDObtHopYJeS4d60tbvVS3bR0\n' +
    'j6tJLp07kzQoH3jOlOrHvdPJbRzeXDLz\n' +
    '-----END CERTIFICATE-----',
  '-----BEGIN CERTIFICATE-----\n' +
    'MIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBh\n' +
    'MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3\n' +
    'd3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD\n' +
    'QTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVT\n' +
    'MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j\n' +
    'b20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG\n' +
    '9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsB\n' +
    'CSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97\n' +
    'nh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt\n' +
    '43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7P\n' +
    'T19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4\n' +
    'gdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAO\n' +
    'BgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbR\n' +
    'TLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUw\n' +
    'DQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/Esr\n' +
    'hMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg\n' +
    '06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJF\n' +
    'PnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0ls\n' +
    'YSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQk\n' +
    'CAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=\n' +
    '-----END CERTIFICATE-----'
];

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

  describe('getCertificateChain', function(){
    it('should return the expected certficate chain of news.ycombinator.com', function(done) {
      opensslTools.getCertificateChain('news.ycombinator.com', '443', function(err, crt){
        if (err) {
          console.log(err);
        } else {
          expect(crt).to.deep.equal(expectedCertificateChain);
          done();
        }
      });
    });
  });
});
