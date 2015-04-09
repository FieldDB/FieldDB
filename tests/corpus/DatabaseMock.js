var Q = require("q");

var mockDatabase = {
  get: function(id) {
    console.log("Mocking database get(id) ", id);
    var deferred = Q.defer();
    Q.nextTick(function() {
      if (id === "2839aj983aja") {
        deferred.resolve({
          dbname: "lingallama-communitycorpus",
          something: "else",
          _rev: Date.now() + "-fetchresult",
          _id: "2839aj983aja",
          modifiedByUser: {
            "label": "modifiedByUser",
            "value": "inuktitutcleaningbot",
            "mask": "inuktitutcleaningbot",
            "encrypted": "",
            "shouldBeEncrypted": "",
            "help": "An array of users who modified the datum",
            "showToUserTypes": "all",
            "readonly": true,
            "users": [{
              "gravatar": "968b8e7fb72b5ffe2915256c28a9414c",
              "username": "inuktitutcleaningbot",
              "collection": "users",
              "firstname": "Cleaner",
              "lastname": "Bot"
            }],
            "userchooseable": "disabled"
          }
        });
      } else {
        deferred.resolve({
          _id: id,
          _rev: "2-aweomw",
          title: "Community corpus"
        });
      }
    });
    return deferred.promise;
  },
  set: function(arg1, arg2) {
    var deferred = Q.defer(),
      key,
      value;

    if (!arg2) {
      value = arg1;
      key = value.id || value._id;
    } else {
      key = arg1;
      value = arg2;
      value.id = key;
    }

    console.log("Mocking database set(key, value) ", key);
    Q.nextTick(function() {
      value.rev = Date.now() + "-saveresult";
      value.id = key || "aBc" + Date.now();
      // console.log("resolving the samething that was saved, with a new rev", value);
      delete value.fossil;
      deferred.resolve(value);
    });
    return deferred.promise;
  },
  fetchRevisions: function(id, optionalUrl) {
    var deferred = Q.defer();
    optionalUrl = optionalUrl || this.url || "https://corpus.example.org/anexampleuser-firstcorpus";
    Q.nextTick(function() {
      var mockCouchDBResponse = {
        _id: id,
        _rev: "3-825cb35de44c433bfb2df415563a19de",
        _revs_info: [{
          rev: "3-825cb35de44c433bfb2df415563a19de",
          status: "available"
        }, {
          rev: "2-7051cbe5c8faecd085a3fa619e6e6337",
          status: "available"
        }, {
          rev: "1-967a00dff5e02add41819138abb3284d",
          status: "available"
        }]
      };
      var revisions = [];

      mockCouchDBResponse._revs_info.map(function(revisionInfo) {
        if (revisionInfo.status === "available") {
          revisions.push(optionalUrl + "/" + id + "?rev=\"" + revisionInfo.rev + "\"");
        }
      });

      deferred.resolve(revisions);
    });
    return deferred.promise;
  },
  fetchCollection: function(collectionUrl) {
    console.log("Mocking database fetchCollection(collectionUrl) ", collectionUrl);
    var deferred = Q.defer();
    Q.nextTick(function() {
      if (collectionUrl === "comments") {
        deferred.resolve({
          collection: collectionUrl,
          title: "A generated datalist",
          description: "something here",
          docIds: ["abc", "123", "kweo", "654"]
        });
      } else {
        deferred.resolve({
          collection: collectionUrl,
          title: "Another generated datalist",
          description: "something here",
          docIds: ["abc", "123", "654"]
        });
      }
    });
    return deferred.promise;
  },
};

exports.mockDatabase = mockDatabase;
