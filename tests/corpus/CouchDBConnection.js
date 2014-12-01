var CORS = require("./../../api/CORS.js");

var CouchDBConnection = function(url, user) {
  this.url = url;
  this.user = user;
  this.result = {};
  this.uploadResult = {};
  this.login = function(optionalCallback) {

    var that = this;
    CORS.makeCORSRequest({
      type: "POST",
      url: that.url,
      data: that.user,
      success: function(serverResults) {
        that.result = serverResults;
        console.log("server contacted", serverResults);
        if (typeof optionalCallback === "function") {
          optionalCallback();
        }
      },
      error: function(serverResults) {
        that.result = serverResults;
        console
          .log("There was a problem contacting the server to login.");
      }
    });
  };
  this.uploadADocument = function(doc, database, optionalCallback) {
    var that = this;
    that.uploadResult = {};
    var method = "POST";
    var uploadURLSuffix = database;
    if (doc.id) {
      method = "PUT";
      uploadURLSuffix = database + "/" + doc._id;
    }
    var upload = function() {
      CORS
        .makeCORSRequest({
          type: method,
          url: that.url.replace("_session", uploadURLSuffix),
          data: doc,
          success: function(serverResults) {
            that.uploadResult = serverResults;
            console.log("server contacted", serverResults);
            if (typeof optionalCallback === "function") {
              optionalCallback();
            }
          },
          error: function(serverResults) {
            that.uploadResult = serverResults;
            console
              .log("There was a problem contacting the server to upload.");
          }
        });
    };

    /*
     * Run the upload, log the user in, if they aren't already.
     */
    if (!this.loggedIn) {
      this.login(upload);
    } else {
      upload();
    }
  };
  this.docUploaded = function() {
    return this.uploadResult.ok;
  };
  this.loggedIn = function() {
    return this.result.name === this.user.name;
  };
  this.assertLoginSuccessful = function() {
    expect(this.result.name).toEqual(this.user.name);
  };
  this.assertUploadSuccessful = function() {
    expect(this.uploadResult.ok).toBeTruthy();
  };
};

exports.CouchDBConnection = CouchDBConnection;
