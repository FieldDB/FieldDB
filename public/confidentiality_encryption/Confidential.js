define( ["use!backbone",
         "use!crypto"
],function(Backbone, CryptoJS) {
	

  	var Confidential = Backbone.Model.extend(

  /** @lends Confidential.prototype */

  {
    /**
     * @class Confidential makes it possible to generate pass phrases (one per
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
     * @description
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */

    initialize : function() {
      console.log("Initializing confidentiality module");

      var encryptedMessage = this.encrypt("hi this is a longer message.");
      console.log("encrypted" + encryptedMessage);

      var decryptedMessage = this.decrypt(encryptedMessage);
      console.log("decrypted:" + decryptedMessage);

      if (this.get("secretkey") == "This should be a top secret pass phrase.") {
        this.set("secretkey", this.secretKeyGenerator());
      }
    },
    defaults : {
      secretkey : "This should be a top secret pass phrase."
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
    encrypt : function(message) {
      var result = CryptoJS.AES.encrypt(message, this.get("secretkey"));
      // return the base64 version to save it as a string in the corpus
      return "confidential:" + btoa(result);

    },
    /**
     * Decrypt uses this object's secret key to decode its paramater using the
     * AES algorithm.
     * 
     * @param encrypted
     *          A base64 string prefixed (or not) with the word "confidential"
     * @returns Returns the encrypted result as a UTF8 string.
     */
    decrypt : function(encrypted) {
      encrypted = encrypted.replace("confidential:", "");
      // decode base64
      encrypted = atob(encrypted);
      return CryptoJS.AES.decrypt(encrypted, this.get("secretkey")).toString(
          CryptoJS.enc.Utf8);
    },
    /**
     * The secretkeygenerator uses a "GUID" like generation to create a string
     * for the secret key.
     * 
     * @returns {String} a string which is likely unique, in the format of a
     *          Globally Unique ID (GUID)
     */
    secretKeyGenerator : function() {
      var S4 = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4()
          + S4() + S4());
    }
  });

  return Confidential;

});
