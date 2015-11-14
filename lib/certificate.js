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
   * @return {Error} err, {Object} info Error and information object
   */
  getCertificate: function (host, port, cb) {
    var infoObject = {},
        err;

    var openssl = spawn('/usr/local/opt/openssl/bin/openssl', ['s_client', '-connect', host + ':' + port, '-servername', host]);

    openssl.stdout.on('data', function (out) {
      var data = out.toString();

      // Search for certificate in stdout
      var matches = data.match(/-----BEGIN CERTIFICATE-----([\s\S.]*)-----END CERTIFICATE-----/);

      // If at last one match ...
      if (matches.length > 0) {
        // ... callback and return certificate
        cb(err, matches[0]);
      } else {
        // ... otherwise throw error
        err = new Error('Couldn\'t extract certificate for ' + host + ':' + port);

        // and return
        return cb(err, matches);
      }
    });

  	openssl.stdin.end();

  }
};
