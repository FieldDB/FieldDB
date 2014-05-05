var Q = require("q");
var CORS = require("./CORS").CORS;

var FieldDBConnection = FieldDBConnection || {};
FieldDBConnection.CORS = CORS;

FieldDBConnection.setXMLHttpRequestLocal = function(injectedCORS) {
  FieldDBConnection.CORS = injectedCORS;
};

FieldDBConnection.connection = {
  localCouch: {
    connected: false,
    url: 'https://localhost:6984',
    couchUser: null
  },
  centralAPI: {
    connected: false,
    url: 'https://localhost:3181/v2',
    fieldDBUser: null
  }
};

FieldDBConnection.connect = function(options) {
  var deffered = Q.defer();

  if (this.timestamp && this.connection.couchUser && this.connection.fieldDBUser && Date.now() - this.timestamp < 1000) {
    console.log("connection information is not old.");
    Q.nextTick(function() {
      deffered.resolve(this.connection);
    });
    return deffered.promise;
  }

  var defferedLocal = Q.defer(),
    defferedCentral = Q.defer(),
    promises = [defferedLocal.promise, defferedCentral.promise],
    self = this;

  // Find out if this user is able to work offline with a couchdb
  FieldDBConnection.CORS.makeCORSRequest({
    method: 'GET',
    dataType: 'json',
    url: self.connection.localCouch.url + '/_session'
  }).then(function(response) {
    this.timestamp = Date.now();
    console.log(response);

    if (!response || !response.userCtx) {
      self.connection.localCouch.connected = false;
      self.connection.localCouch.timestamp = Date.now();
      defferedLocal.reject({
        eror: 'Recieved an odd response from the local couch. Can\'t contact the local couchdb, it might be off or it might not be installed. This device can work online only.'
      });
      return;
    }

    self.connection.localCouch.connected = true;
    self.connection.localCouch.timestamp = Date.now();
    self.connection.localCouch.couchUser = response.userCtx;
    if (!response.userCtx.name) {
      FieldDBConnection.CORS.makeCORSRequest({
        method: 'POST',
        dataType: 'json',
        data: {
          name: 'public',
          password: 'none'
        },
        url: self.connection.localCouch.url + '/_session'
      }).then(function() {
        console.log('Logged the user in as the public user so they can only see public info.');
        defferedLocal.resolve(response);

      }).fail(function(reason) {
        console.log('The public user doesnt exist on this couch...', reason);
        defferedLocal.reject(reason);
      });
    }

  }).fail(function(reason) {
    this.timestamp = Date.now();
    console.log(reason);
    self.connection.localCouch.connected = false;
    self.connection.localCouch.timestamp = Date.now();
    defferedLocal.reject(reason);
  });

  // Find out if this user is able to work online with the central api
  FieldDBConnection.CORS.makeCORSRequest({
    method: 'GET',
    dataType: 'json',
    url: self.connection.centralAPI.url + '/users'
  }).then(function(response) {
    this.timestamp = Date.now();
    console.log("FieldDBConnection", response);

    if (!response || !response.user) {
      self.connection.centralAPI.connected = false;
      self.connection.centralAPI.timestamp = Date.now();
      defferedCentral.reject({
        eror: 'Received an odd response from the api. Can\'t contact the api server. This is a bug which must be reported.'
      });
      return;
    }

    self.connection.centralAPI.connected = true;
    self.connection.centralAPI.timestamp = Date.now();
    self.connection.localCouch.user = response.user;
    if (!response.user.username) {
      FieldDBConnection.CORS.makeCORSRequest({
        method: 'POST',
        dataType: 'json',
        data: {
          username: 'public',
          password: 'none'
        },
        url: self.connection.centralAPI.url + '/users'
      }).then(function() {
        console.log('Logged the user in as the public user so they can only see public info.');
        defferedCentral.resolve(response);

      }).fail(function(reason) {
        console.log('The public user doesn\'t exist on this couch...', reason);
        defferedCentral.reject(reason);
      });
    }

  }).fail(function(reason) {
    this.timestamp = Date.now();
    console.log(reason);
    self.connection.centralAPI.connected = false;
    self.connection.centralAPI.timestamp = Date.now();
    defferedCentral.reject(reason);
  });

  Q.allSettled(promises).then(function(results) {
    console.log(results);
    deffered.resolve(this.connection);
  });

  return deffered.promise;

};


if (exports) {
  exports.FieldDBConnection = FieldDBConnection;
}
