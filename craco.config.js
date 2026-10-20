// CRACO config: override Create React App's webpack config without ejecting.
//
// Root cause of ERR_OSSL_EVP_UNSUPPORTED on Node 17+ (OpenSSL 3.0):
// CRA 5's `file-loader` (used for images/SVGs) relies on `loader-utils`, whose
// `getHashDigest` defaults to the MD4 algorithm that OpenSSL 3.0 removed.
// webpack 5's own hashing is fine, so overriding `output.hashFunction` does NOT
// fix this — the failing hash lives inside loader-utils.
//
// Fix: force loader-utils to produce a non-MD4 digest by setting the global
// crypto hash substitution. The simplest, dependency-free approach is to patch
// Node's crypto.createHash so any request for the legacy "md4" transparently
// uses "sha256" instead. This keeps CRA/file-loader intact and removes the need
// for the --openssl-legacy-provider flag.
const crypto = require('crypto');

const originalCreateHash = crypto.createHash;
crypto.createHash = (algorithm, options) => {
  if (algorithm === 'md4') {
    return originalCreateHash('sha256', options);
  }
  return originalCreateHash(algorithm, options);
};

module.exports = {
  webpack: {
    configure: (webpackConfig) => webpackConfig
  }
};
