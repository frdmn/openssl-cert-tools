/* jshint node: true */
'use strict';

/*
 * Copyright (c) 2015 by Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

var spawn = require('child_process').spawn;

module.exports = {
  /**
   * Decodes various information from the provided
   * certificate like issuer, subject, expiration
   * dates.
   * @param  {String|Buffer} cert       Input certificate
   * @param  {Function} cb              Callback
   * @return {Error} err, {Object} info Error and information object
   */
  getCertificateInfo: function (cert, cb) {
    var infoObject = {},
        issuerElements = [],
        subjectElements = [],
        err;

  	var openssl = spawn('openssl', ['x509', '-noout', '-issuer', '-subject', '-dates', '-nameopt', 'RFC2253']);

    var stderr = [];
    var stdout = [];

    openssl.stderr.on('data', stderr.push.bind(stderr));
    openssl.stdout.on('data', stdout.push.bind(stdout));

    openssl.on('close', function (code) {
      if (code !== 0) {
        var error = Buffer.concat(stderr).toString();
        // Callback and return array
        return cb(new Error(error), infoObject);
      }

      var data = Buffer.concat(stdout).toString();

      // Put each line into an array
      var lineArray = data.split('\n');
      // Filter out empty ones
      lineArray = lineArray.filter(function(n){ return n !== undefined && n !== '' });

      // Check if output is exact four lines
      if (lineArray.length !== 4) {
        err = new Error('Couldn\'t read certificate');
      }

      /* Construct infoObject */

      // Certificate
      infoObject.certificate = cert;

      // Issuer
      infoObject.issuer = {};
      // Split by "," separator
      issuerElements = lineArray[0].replace('issuer=', '').split(',');
      // For each elements
      for (var iI = 0; iI < issuerElements.length; iI++) {
        // Split keys and values by "=" separator
        var issuerKeyValue = issuerElements[iI].split('=');
        infoObject.issuer[issuerKeyValue[0].trim()] = issuerKeyValue[1];
      }

      // Subject
      infoObject.subject = {};
      // Split by "," separator
      subjectElements = lineArray[1].replace('subject=', '').split(',');
      // For each elements
      for (var iS = 0; iS < subjectElements.length; iS++) {
        // Split keys and values by "=" separator
        var subjectKeyValue = subjectElements[iS].split('=');
        infoObject.subject[subjectKeyValue[0].trim()] = subjectKeyValue[1];
      }

      // Dates
      infoObject.validFrom = new Date(lineArray[2].split('=')[1]);
      infoObject.validTo = new Date(lineArray[3].split('=')[1]);

      // Check if "to" date is in the past => certificate expired
      if(infoObject.validTo < new Date()) {
        infoObject.expiredDays = Math.round(Math.abs((Date.now() - infoObject.validTo.getTime())/(24*60*60*1000)));
        infoObject.remainingDays = 0;
      } else {
        infoObject.remainingDays = Math.round(Math.abs((Date.now() - infoObject.validTo.getTime())/(24*60*60*1000)));
      }

      // Callback and return array
  		return cb(err, infoObject);
  	});
  	openssl.stdin.write(cert);
  	openssl.stdin.end();
  },

  /**
   * Decodes information from the provided certificate
   * sign request.
   * @param  {String|Buffer} cert       Input certificate
   * @param  {Function} cb              Callback
   * @return {Error} err, {Object} info Error and information object
   */
  getCertificateRequestInfo: function (cert, cb) {
    var infoObject = {},
        subjectElements = [],
        err;

  	var openssl = spawn('openssl', ['req', '-noout', '-subject', '-nameopt', 'RFC2253']);

    // Catch stderr
    openssl.stderr.on('data', function (out) {
      err = new Error(out);

      // Callback and return array
  		return cb(err, infoObject);
    });

    openssl.stdout.on('data', function (out) {
      var data = out.toString();

      // Put each line into an array
      var lineArray = data.split('\n');

      // Filter out empty ones
      lineArray = lineArray.filter(function(n){ return n !== undefined && n !== '' });

      /* Construct infoObject */

      // Certificate
      infoObject.certificate = cert;

      // Subject
      infoObject.subject = {};
      // Split by "/" prefix
      subjectElements = lineArray[0].replace('subject=', '').split(',');
      // For each elements
      for (var iS = 0; iS < subjectElements.length; iS++) {
        // Split keys and values by "=" separator
        var subjectKeyValue = subjectElements[iS].split('=');
        infoObject.subject[subjectKeyValue[0].trim()] = subjectKeyValue[1];
      }

      // Callback and return array
  		return cb(err, infoObject);
  	});

  	openssl.stdin.write(cert);
  	openssl.stdin.end();
  },

   /**
   * Returns a MD5 hash of a given input certificate
   * @param  {String|Buffer} cert       Input certificate
   * @param  {Function} cb              Callback
   * @return {Error} err, {String} hash Error and certificate hash
   */
  getCertificateHash: function (cert, cb) {
    var err,
        stdout = "",
        stderr = "";

    var openssl = spawn('openssl', ['x509', '-noout', '-modulus']);
    var md5 = spawn('openssl', ['md5']);

    openssl.stdout.pipe(md5.stdin);

    md5.on('exit', function(code){
      if(stderr){
        err = new Error(stderr);
    		return cb(err, {});
      }
      if(stdout){
  	  	return cb(err, stdout.trim().replace('(stdin)= ',''));
      }
    });

    md5.stdout.on('data', function (out) {
      stdout += out.toString();
    });

    // Catch stderr
    openssl.stderr.on('data', function (out) {
      stderr += out.toString();
    });

    openssl.stdin.write(cert);
  	openssl.stdin.end();
  },

   /**
   * Returns a MD5 hash of a given input certificate
   * signing request
   * @param  {String|Buffer} csr       Input CSR
   * @param  {Function} cb              Callback
   * @return {Error} err, {String} hash Error and CSR hash
   */
  getCertificateRequestHash: function (csr, cb) {
    var err,
        stdout = "",
        stderr = "";

    var openssl = spawn('openssl', ['req', '-noout', '-modulus']);
    var md5 = spawn('openssl', ['md5']);

    openssl.stdout.pipe(md5.stdin);

    md5.on('exit', function(code){
      if(stderr){
        err = new Error(stderr);
    		return cb(err, {});
      }
      if(stdout){
  	  	return cb(err, stdout.trim().replace('(stdin)= ',''));
      }
    });

    md5.stdout.on('data', function (out) {
      stdout += out.toString();
    });

    // Catch stderr
    openssl.stderr.on('data', function (out) {
      stderr += out.toString();
    });

    openssl.stdin.write(csr);
  	openssl.stdin.end();
  }
};
