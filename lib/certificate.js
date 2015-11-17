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
        data = {};

    var openssl = spawn('/usr/local/opt/openssl/bin/openssl', ['s_client', '-connect', host + ':' + port, '-servername', host]);

    // Clear timeout when execution was successful
    openssl.on('exit', function(){
      clearTimeout(timeoutTimer);
    });

    openssl.stdout.on('data', function (out) {
      var data = out.toString();

      // Search for certificate in stdout
      var matches = data.match(/-----BEGIN CERTIFICATE-----([\s\S.]*)-----END CERTIFICATE-----/);

      // If at last one match ...
      if (matches.length > 0) {
        // Save in data
        data = matches[0];
      } else {
        // ... otherwise raise error
        err = new Error('Couldn\'t extract certificate for ' + host + ':' + port);
      }

      // ... callback and return certificate
      return cb(err, data);
    });

    // End stdin (otherwise it'll run indefinitely)
  	openssl.stdin.end();

    // Timeout function to kill in case of errors
    var timeoutTimer = setTimeout(function(){
      openssl.kill();
      // ... otherwise throw error
      err = new Error('Time out while trying to extract certificate for ' + host + ':' + port);

      // and return
      return cb(err, data);
    }, 5000);
  }
};
