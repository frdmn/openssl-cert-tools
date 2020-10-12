<a name="1.4.1"></a>
# 1.4.1 (2020-10-12)

- Improve response from getCertificateChain()

<a name="1.4.0"></a>
# 1.4.0 (2020-10-12)

- Fix test cases (test against Node 8 and 12)
- Fix vulnarability report
- New feature: receive complete intermediate chain from remote host
- New feature: functions to receive hashes of certificates, requests and keys (closes [#5](https://github.com/frdmn/openssl-cert-tools/issues/5))

<a name="1.3.4"></a>
# 1.3.4 (2020-05-20)

- Fix test cases
- Fix vulnarability reports
- Allow subjects and issuers without whitespaces (fixes [#11](https://github.com/frdmn/openssl-cert-tools/issues/11))

<a name="1.3.3"></a>
# 1.3.3 (2019-02-05)

- Fix test cases
- Update subject CN of remote hostname in test case

<a name="1.3.2"></a>
# 1.3.2 (2019-02-05)

- Fix missing issuer/subject

<a name="1.3.1"></a>
# 1.3.1 (2018-11-28)

- Update dependencies
- Fix "remainingDays" response when certificate is already expired

<a name="1.3.0"></a>
# 1.3.0 (2018-07-11)

- Update Travis CI Node build environment
- Fix spawn buffer parsing & npm auditing issues ([PR#7](https://github.com/frdmn/openssl-cert-tools/pull/7)) (Thanks @[sauvainr](https://github.com/sauvainr))

<a name="1.2.1"></a>
# 1.2.1 (2016-11-16)

* Move chai and mocha to devDependencies ([PR#4](https://github.com/frdmn/openssl-cert-tools/pull/4)) (Thanks @[boneskull](https://github.com/boneskull))
* Update NPM packages ([426d870](https://github.com/frdmn/openssl-cert-tools/commit/426d870))
* Add new possible error when hostname can't be found ([1f769e8](https://github.com/frdmn/openssl-cert-tools/commit/1f769e8))
* Version bump to 1.2.1 ([7d4a517](https://github.com/frdmn/openssl-cert-tools/commit/7d4a517))

<a name="1.2.0"></a>
# 1.2.0 (2015-11-17)

* Actually calculate remaining days instead of certifice duration ([2216c68](https://github.com/frdmn/openssl-cert-tools/commit/2216c68))
* Version bump to 1.2.0 ([99b18e6](https://github.com/frdmn/openssl-cert-tools/commit/99b18e6))

<a name="1.1.1"></a>
# 1.1.1 (2015-11-17)

* Update test case ([b37638b](https://github.com/frdmn/openssl-cert-tools/commit/b37638b))
* Version bump to 1.1.1 ([75b0df5](https://github.com/frdmn/openssl-cert-tools/commit/75b0df5))

<a name="1.1.0"></a>
# 1.1.0 (2015-11-17)

* Add docu for new getCertificate() ([29db653](https://github.com/frdmn/openssl-cert-tools/commit/29db653))
* Add info for each error code ([3a2831b](https://github.com/frdmn/openssl-cert-tools/commit/3a2831b))
* Add new function to get remote certificate ([0eaad84](https://github.com/frdmn/openssl-cert-tools/commit/0eaad84))
* Catch stderr for possible errors during connect ([34d0f23](https://github.com/frdmn/openssl-cert-tools/commit/34d0f23))
* Get rid of version in README.md ([f9f5c3e](https://github.com/frdmn/openssl-cert-tools/commit/f9f5c3e))
* Implement timout in case of errors ([9df4fab](https://github.com/frdmn/openssl-cert-tools/commit/9df4fab))
* Improve error handling ([a804db1](https://github.com/frdmn/openssl-cert-tools/commit/a804db1))
* Increase timeout for running tests ([d8faa1d](https://github.com/frdmn/openssl-cert-tools/commit/d8faa1d))
* Test cases for new getCertificate function ([690fa95](https://github.com/frdmn/openssl-cert-tools/commit/690fa95))
* Trim error output ([7da7581](https://github.com/frdmn/openssl-cert-tools/commit/7da7581))
* Try catch while searching for certificate ([ad710b0](https://github.com/frdmn/openssl-cert-tools/commit/ad710b0))
* Update header ([dc0be07](https://github.com/frdmn/openssl-cert-tools/commit/dc0be07))
* Use openssl binary in $PATH ([6456445](https://github.com/frdmn/openssl-cert-tools/commit/6456445))
* Version bump to 1.1.0 ([524c157](https://github.com/frdmn/openssl-cert-tools/commit/524c157))

<a name="1.0.2"></a>
# 1.0.2 (2015-10-19)

* Add test cases ([b37666b](https://github.com/frdmn/openssl-cert-tools/commit/b37666b))
* Implement [Travis CI](https://travis-ci.org/frdmn/openssl-cert-tools)

<a name="1.0.1"></a>
# 1.0.1 (2015-10-19)

* Fix library paths ([5588b2e](https://github.com/frdmn/openssl-cert-tools/commit/5588b2e))

<a name="1.0.0"></a>
# 1.0.0 (2015-10-18)

* Add existing functions ([eeb8303](https://github.com/frdmn/openssl-cert-tools/commit/eeb8303))
* Add JShint and CodeStyleCheck dotfiles ([6f02eab](https://github.com/frdmn/openssl-cert-tools/commit/6f02eab))
* Add package.json ([05d8313](https://github.com/frdmn/openssl-cert-tools/commit/05d8313))
* Initial commit ([2f4a242](https://github.com/frdmn/openssl-cert-tools/commit/2f4a242))
* Update README.md ([7129982](https://github.com/frdmn/openssl-cert-tools/commit/7129982))
