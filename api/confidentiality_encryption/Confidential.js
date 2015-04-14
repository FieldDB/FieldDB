/* globals window */
// var node_cryptojs = require("node-cryptojs-aes");
// var CryptoJS = node_cryptojs.CryptoJS;

//>> Error: Error: ENOENT, no such file or directory '$HOME/dative/.tmp/scripts/core.js'
// var forcingCoreToLoadForRequireJS = require("node-cryptojs-aes/lib/core");

// var CryptoEncoding =  {};// require("crypto-js/enc-utf8");
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Q = require("q");
var CryptoJS = require("./Crypto_AES").CryptoJS;
var CryptoEncoding = CryptoJS.enc.Utf8;

try {
  if (!window.atob) {
    console.log("ATOB is not defined, loading from npm");
  }
} catch (e) {
  console.log(e);
  /*jshint -W020 */
  window = {};
  window.atob = require("atob");
  window.btoa = require("btoa");
}

/**
 * @class Confidential
 * @name Confidential
 *
 * @description makes it possible to generate pass phrases (one per
 *        corpus) to encrypt and decrypt confidential data points. The
 *        confidential data is stored encrypted, and can only be decrypted
 *        if one has the corpus" secret key, or if one is logged into the
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
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Confidential";
  }
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
Confidential.secretKeyGenerator = FieldDBObject.uuidGenerator;

Confidential.prototype = Object.create(FieldDBObject.prototype, /** @lends Confidential.prototype */ {
  constructor: {
    value: Confidential
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
      if (!value) {
        return value;
      }
      if (typeof value === "object") {
        value = JSON.stringify(value);
        this.debug("Converted object to string before encryption");
      }
      if (typeof value === "number") {
        value = value + "";
        this.debug("Converted object to string before encryption");
      }
      if (!this.secretkey) {
        throw new Error("This confidential wasnt set up properly, cant encrypt.");
      }
      // this.debugMode = true;
      this.debug("encrypting " + value);
      var result = CryptoJS.AES.encrypt(value, this.secretkey.toString("base64"));
      this.verbose(this.secretkey, result.toString(), window.btoa(result.toString()));
      // return the base64 version to save it as a string in the corpus
      return "confidential:" + window.btoa(result.toString());
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
      var result = encrypted,
        self = this;

      var decryptWhenReady = function(confirmedDecryptedMode) {
        self.decryptedMode = confirmedDecryptedMode;
        encrypted = encrypted.replace("confidential:", "");
        // decode base64
        encrypted = window.atob(encrypted);
        self.verbose("Decrypting " + encrypted, self.secretkey.toString("base64"));
        result = CryptoJS.AES.decrypt(encrypted, self.secretkey.toString("base64")).toString(CryptoEncoding);
        try {
          if ((result[0] === "{" && result[result.length - 1] === "}") || (result[0] === "[" && result[result.length - 1] === "]")) {
            result = JSON.parse(result);
            self.debug("Decrypting an object");
          }
        } catch (e) {
          self.verbose("Decrypting a non-object");
        }
        return result;
      };

      if (!this.decryptedMode) {
        this.whenReady.then(decryptWhenReady, function() {
          self.warn("Not decrypting. You have not proven your identity.");
        });
      } else {
        return decryptWhenReady(this.decryptedMode);
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
      if (this._secretkey && this._secretkey.length > 2) {
        throw new Error("Confidential key cant be changed once it was created. Please create another Confidential encrypter if you wish to change the key.");
      }
      if (!value) {
        value = "";
      }
      this._secretkey = value.trim();
    }
  },

  fillWithDefaults: {
    value: function() {
      if (!this.secretkey) {
        this.secretkey = Confidential.secretKeyGenerator();
      }
      return this;
    }
  },

  decryptedMode: {
    get: function() {
      if (this._decryptedMode !== undefined) {
        return this._decryptedMode;
      }

      var deferred = Q.defer(),
        self = this;

      if (!this.whenReady) {
        this.whenReady = deferred.promise;
        this.prompt("You can only view encrypted data if you confirm your identity. Please enter your password.").then(function(promptDetails) {
          if (self.application && self.application.authentication && typeof self.application.authentication.confirmIdentity === "function") {
            self.application.authentication.confirmIdentity({
              password: promptDetails.password
            }).then(function(confirmation) {
              self.debug("Confirmed the user's identity", confirmation);
              self._decryptedMode = true;
              deferred.resolve(true);
            }, function(error) {
              self.debug("Unable to confirm the user's identity", error);
              self._decryptedMode = false;
              deferred.resolve(false);
            }).fail(function(error) {
              self.debug("Error while confirming the user's identity", error);
              self._decryptedMode = false;
              deferred.resolve(false);
            });
          } else {
            self.warn("Not running in an application, but was able to simuli-prompt the user.");
            self._decryptedMode = true;
            deferred.resolve(true);
          }
        }, function(error) {
          self.debug("Unable to prompt the user, the data will always be encrypted", error);
          self._decryptedMode = false;
          deferred.reject(false);
        }).fail(function(error) {
          self.debug("Error while prompting the user, the data will always be encrypted", error);
          self._decryptedMode = false;
          deferred.reject(false);
        });
      }

    },
    set: function(value) {
      if (value === this._decryptedMode) {
        return;
      }
      if (value) {
        this.warn("Cant set decryptedMode manually to true. ", this.decryptedMode);
        return;
      }
      this._decryptedMode = value;
    }
  }


});

exports.Confidential = Confidential;
