if (OPrime) {
  OPrime.debug("Loading AuthenticationServices");
} else {
  console.log("Loading AuthenticationServices");
}

angular.module('AuthenticationServices', [ 'ngResource' ])
/**
 * Encrypt accepts a string (UTF8) and returns a CryptoJS object, in base64
 * encoding so that it looks like a string, and can be saved as a string in the
 * corpus.
 * 
 * @param contents
 *          A UTF8 string
 * @returns Returns a base64 string prefixed with "confidential" so that the
 *          views can choose to not display the entire string for the user.
 */
.factory("EncryptUser", function(contents) {
  var result = CryptoJS.AES.encrypt(contents, OPrime.userEncryptionToken());
  // return the base64 version to save it as a string in the corpus
  return "confidential:" + btoa(result);
})
/**
 * Decrypt uses this object's secret key to decode its parameter using the AES
 * algorithm.
 * 
 * @param encrypted
 *          A base64 string prefixed (or not) with the word "confidential"
 * @returns Returns the encrypted result as a UTF8 string.
 */
.factory(
    "DecryptUser",
    function(encrypted) {
      encrypted = encrypted.replace("confidential:", "");
      // decode base64
      encrypted = atob(encrypted);
      resultpromise = CryptoJS.AES.decrypt(encrypted,
          OPrime.userEncryptionToken()).toString(CryptoJS.enc.Utf8);
      return resultpromise;
    });
