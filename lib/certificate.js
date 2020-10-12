/* jshint node: true */
'use strict';

/*
 * Copyright (c) 2015 by Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

var spawn = require('child_process').spawn;

module.exports = {
  /**
   * Download certificate from remote host
   * @param  {String} host              Input hostname
   * @param  {String} port              Input port
   * @param  {Function} cb              Callback
   * @return {Error} err, {Object} data Error and data object
   */
  getCertificate: function (host, port, cb) {
    var err,
        data = {},
        stderr,
        stdout;

    var openssl = spawn('openssl', ['s_client', '-connect', host + ':' + port, '-servername', host]);

    // Clear timeout when execution was successful
    openssl.on('exit', function(code){
      clearTimeout(timeoutTimer);

      // Check if exit code is null
      if(code === null){
        // ... probably killed due to time out
        err = new Error('Time out while trying to extract certificate chain for ' + host + ':' + port);
        return cb(err, data);
      }

      if(stderr){
        // Search for possible errors in stderr
        var errorRegexp = /(Connection refused)|(Can't assign requested address)|(gethostbyname failure)|(getaddrinfo: nodename)/;
        var regexTester = errorRegexp.test(stderr);

        // If match, raise error
        if (regexTester) {
          err = new Error(stderr.toString().replace(/^\s+|\s+$/g, ''));

          // Callback and return array
          return cb(err, data);
        }
      }

      if(stdout){
        var data = stdout.toString();

        // Search for certificate in stdout
        var matches = data.match(/-----BEGIN CERTIFICATE-----([\s\S.]*)-----END CERTIFICATE-----/);

        try {
          data = matches[0];
        } catch (e) {
          // ... otherwise raise error
          err = new Error('Couldn\'t extract certificate for ' + host + ':' + port);
        }
      }

      // ... callback and return certificate
      return cb(err, data);
    });

    // Catch stderr and search for possible errors
    openssl.stderr.on('data', function (out) {
      stderr += out.toString();
    });

    openssl.stdout.on('data', function (out) {
      stdout += out.toString();
    });

    // End stdin (otherwise it'll run indefinitely)
  	openssl.stdin.end();

    // Timeout function to kill in case of errors
    var timeoutTimer = setTimeout(function(){
      openssl.kill();
    }, 5000);
  },

  /**
   * Download complete certificate chain from remote host
   * @param  {String} host              Input hostname
   * @param  {String} port              Input port
   * @param  {Function} cb              Callback
   * @return {Error} err, {Array} data Error and data object
   */
  getCertificateChain: function (host, port, cb) {
    var err,
        stdout,
        stderr;

    var openssl = spawn('openssl', ['s_client', '-showcerts', '-connect', host + ':' + port, '-servername', host]);

    // Clear timeout when execution was successful
    openssl.on('exit', function(code){
      clearTimeout(timeoutTimer);

      // Check if exit code is null
      if(code === null){
        // ... probably killed due to time out
        err = new Error('Time out while trying to extract certificate chain for ' + host + ':' + port);
        return cb(err, data);
      }

      if(stderr){
        // Search for possible errors in stderr
        var errorRegexp = /(Connection refused)|(Can't assign requested address)|(gethostbyname failure)|(getaddrinfo: nodename)|(Name or service not known)/;
        var regexTester = errorRegexp.test(stderr);

        // If match, raise error
        if (regexTester) {
          err = new Error(stderr.toString().replace(/^\s+|\s+$/g, ''));

          // Callback and return array
          return cb(err, data);
        }
      }

      if(stdout){
        // Search for certificate in stdout
        var matches = stdout.match(/s:([\s\S.]*?)i:[\s\S.]*?-----BEGIN CERTIFICATE-----([\s\S.]*?)-----END CERTIFICATE-----/g);

        try {
          var data = [];
          for (var match of matches) {
            var lines = match.split('\n');
            // Remove "issuer" line (c:/C)
            lines.splice(1, 1);
            // Remove "subject" line in separate variable
            lines.splice(0, 1);
            data.push(lines.join('\n'));
          }
        } catch (e) {
          // ... otherwise raise error
          err = new Error('Couldn\'t extract certificate chain for ' + host + ':' + port);
        }
      }

      // ... callback and return certificate chain
      return cb(err, data);
    });

    // Catch stderr and search for possible errors
    openssl.stderr.on('data', function (out) {
      stderr += out.toString();
    });

    openssl.stdout.on('data', function (out) {
      stdout += out.toString();
    });

    // End stdin (otherwise it'll run indefinitely)
  	openssl.stdin.end();

    // Timeout function to kill in case of errors
    var timeoutTimer = setTimeout(function(){
      openssl.kill();
    }, 5000);
  }
};
