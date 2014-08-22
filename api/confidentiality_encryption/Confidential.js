var AES = require("./Crypto_AES").CryptoJS.AES;
var CryptoEncoding = require("./Crypto_AES").CryptoJS.enc.Utf8;
var FieldDBObject = require('./../FieldDBObject').FieldDBObject;
var atob = require('atob');
var btoa = require('btoa');

/**
 * @class Confidential
 * @name Confidential
 *
 * @description makes it possible to generate pass phrases (one per
 *        corpus) to encrypt and decrypt confidential data points. The
 *        confidential data is stored encrypted, and can only be decrypted
 *        if one has the corpus' secret key, or if one is logged into the
 *        system with their user name and password. This allows the corpus
 *        to be shared with anyone, with out worrying about confidential
 *        data or consultant stories being publically accessible. We are
 *        using the AES cipher algorithm.
 *
 * The Advanced Encryption Standard (AES) is a U.S. Federal Information
 * Processing Standard (FIPS). It was selected after a 5-year process where
 * 15 competing designs were evaluated.
 *
 * <a href="http://code.google.com/p/crypto-js/">More information on
 * CryptoJS</a>
 *
 * @extends Object
 *
 * @constructs
 *
 */
var Confidential = function Confidential(options) {
  this.debug("Constructing Confidential: ", options);
  if (options && options.filledWithDefaults) {
    this.fillWithDefaults();
    delete options.filledWithDefaults;
  }
  FieldDBObject.apply(this, arguments);
};

/**
 * The secretkeygenerator uses a "GUID" like generation to create a string
 * for the secret key.
 *
 * @returns {String} a string which is likely unique, in the format of a
 *          Globally Unique ID (GUID)
 */
Confidential.secretKeyGenerator = function() {
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

Confidential.prototype = Object.create(FieldDBObject.prototype, /** @lends Confidential.prototype */ {
  constructor: {
    value: Confidential
  },

  decryptedMode: {
    value: false
  },

  /**
   * Encrypt accepts a string (UTF8) and returns a CryptoJS object, in base64
   * encoding so that it looks like a string, and can be saved as a string in
   * the corpus.
   *
   * @param message
   *          A UTF8 string
   * @returns Returns a base64 string prefixed with "confidential" so that the
   *          views can choose to not display the entire string for the user.
   */
  encrypt: {
    value: function(value) {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
        this.debug("Converted object to string before encryption");
      }
      var result = AES.encrypt(value, this.secretkey);
      this.verbose(this.secretkey, result.toString(), btoa(result.toString()));
      // return the base64 version to save it as a string in the corpus
      return "confidential:" + btoa(result.toString());
    }
  },

  /**
   * Decrypt uses this object's secret key to decode its parameter using the
   * AES algorithm.
   *
   * @param encrypted
   *          A base64 string prefixed (or not) with the word "confidential"
   * @returns Returns the encrypted result as a UTF8 string.
   */
  decrypt: {
    value: function(encrypted) {
      var result = encrypted;
      if (this.decryptedMode === undefined) {
        var self = this;
        this.turnOnDecryptedMode(function() {
          encrypted = encrypted.replace("confidential:", "");
          // decode base64
          encrypted = atob(encrypted);
          self.verbose("Decrypting after turning on decrypted mode " + encrypted, self.secretkey);
          result = AES.decrypt(encrypted, self.secretkey).toString(CryptoEncoding);
          try {
            if ((result.indexOf("{") === 0 && result.indexOf("}") === result.length - 1) || (result.indexOf("[") === 0 && result.indexOf("]") === result.length - 1)) {
              result = JSON.parse(result);
              self.debug("Decrypting an object");
            }
          } catch (e) {
            self.verbose("Decrypting a non-object");
          }
          return result;
        });
      } else {
        encrypted = encrypted.replace("confidential:", "");
        // decode base64
        encrypted = atob(encrypted);
        this.verbose("Decrypting " + encrypted, this.secretkey);
        result = AES.decrypt(encrypted, this.secretkey).toString(CryptoEncoding);
        try {
          if ((result[0] === "{" && result[result.length - 1] === "}") || (result[0] === "[" && result[result.length - 1] === "]") ) {
            result = JSON.parse(result);
            this.debug("Decrypting an object");
          }
        } catch (e) {
          this.verbose("Decrypting a non-object");
        }
        return result;
      }
    }
  },

  secretkey: {
    get: function() {
      if (!this._secretkey) {
        this._secretkey = "";
      }
      return this._secretkey;
    },
    set: function(value) {
      if (value === this._secretkey) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._secretkey = value.trim();
    }
  },

  fillWithDefaults: {
    value: function() {
      if (this.secretkey === "This should be replaced with a top secret pass phrase.") {
        this.secretkey = this.secretKeyGenerator();
      }
    }
  },

  turnOnDecryptedMode: {
    value: function(callback) {
      this.decryptedMode = false;
      if (callback) {
        callback();
      }
    }
  }


});

exports.Confidential = Confidential;
