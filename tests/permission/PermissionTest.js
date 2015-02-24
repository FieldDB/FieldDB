var Permissions = require("./../../api/permission/Permissions").Permissions;
var SAMPLE_v1_PERMISSIONS_SYSTEMS = require("./../../sample_data/permissions_v1.22.1.json");
describe("Permission Tests", function() {
  describe("construction", function() {
    var permissions;

    beforeEach(function() {
      permissions = new Permissions();
      permissions.populate("defaults");
    });

    it("should load", function() {
      expect(permissions).toBeDefined();
    });

    it("should have a read permission", function() {
      expect(permissions.readers).toBeDefined();
    });

    it("should have a write permission", function() {
      expect(permissions.readers).toBeDefined();
    });

    it("should have an export permission", function() {
      expect(permissions.exporters).toBeDefined();
    });

    it("should have a list of all users to be used in type aheads", function() {
      expect(permissions.allUsers.fieldDBtype).toEqual("Users");
    });


    it("should autogenerate labels and metadata on permissions if none are provided", function() {
      expect(permissions.admins.verb).toEqual("admin");
      expect(permissions.admins.labelFieldLinguists).toEqual("Admins");
      expect(permissions.admins.helpLinguists).toEqual("These users can perform admin operations on the corpus");

      expect(permissions.writers).toBeDefined();
      expect(permissions.writers.verb).toEqual("write");
      expect(permissions.writers.labelFieldLinguists).toEqual("Writers");
      expect(permissions.writers.helpLinguists).toEqual("These users can perform write operations on the corpus");

      expect(permissions.readers.verb).toEqual("read");
      expect(permissions.readers.labelFieldLinguists).toEqual("Readers");
      expect(permissions.readers.helpLinguists).toEqual("These users can perform read operations on the corpus");

      expect(permissions.commenters.verb).toEqual("comment");
      expect(permissions.commenters.labelFieldLinguists).toEqual("Commenters");
      expect(permissions.commenters.helpLinguists).toEqual("These users can perform comment operations on the corpus");

      expect(permissions.exporters.verb).toEqual("export");
      expect(permissions.exporters.labelFieldLinguists).toEqual("Exporters");
      expect(permissions.exporters.helpLinguists).toEqual("These users can perform export operations on the corpus");
    });

    describe("adding users", function() {
      var permissions;

      beforeEach(function() {
        permissions = new Permissions();
        permissions.populate("defaults");
      });


      it("should add users with one or more roles", function() {
        permissions.addUser({
          username: "lingllama",
          gravatar: "133",
          roles: ["reader", "commenter"]
        });
        expect(permissions.readers).toBeDefined();
        expect(permissions.readers.length).toEqual(1);
        expect(permissions.readers.users.lingllama).toBeDefined();
      });



      it("should add roles to users who are already on the team", function() {
        permissions.addUser({
          username: "lingllama",
          gravatar: "133",
          roles: ["reader", "commenter"]
        });

        expect(permissions.readers).toBeDefined();
        expect(permissions.readers.length).toEqual(1);
        expect(permissions.readers.users.lingllama).toBeDefined();
        permissions.addUser({
          username: "lingllama",
          gravatar: "133",
          roles: ["writer"]
        });
        expect(permissions.writers).toBeDefined();
        expect(permissions.writers.length).toEqual(1);
        expect(permissions.writers.users.lingllama).toBeDefined();
      });



      it("should remove roles from users who are already on the team", function() {
        permissions.addUser({
          username: "lingllama",
          gravatar: "133",
          roles: ["reader", "commenter"]
        });
        expect(permissions.readers.users.lingllama).toBeDefined();
        expect(permissions.commenters.users.lingllama).toBeDefined();
        expect(permissions.writers.users.lingllama).toBeUndefined();

        permissions.removeUser({
          username: "lingllama",
          gravatar: "133",
          roles: ["reader", "admin"]
        });
        expect(permissions.readers.users.lingllama).toBeUndefined();
        expect(permissions.writers.users.lingllama).toBeUndefined();
        expect(permissions.admins.users.lingllama).toBeUndefined();
        expect(permissions.commenters.users.lingllama).toBeDefined();

        permissions.removeUser("lingllama");
        expect(permissions.readers.users.lingllama).toBeUndefined();
        expect(permissions.commenters.users.lingllama).toBeUndefined();
        expect(permissions.writers.users.lingllama).toBeUndefined();
        expect(permissions.admins.users.lingllama).toBeUndefined();
      });

    });

  });


  describe("sample permissions", function() {

    it("should have a few examples", function() {
      expect(SAMPLE_v1_PERMISSIONS_SYSTEMS).toBeDefined();
      expect(SAMPLE_v1_PERMISSIONS_SYSTEMS.length).toEqual(5);
      expect(SAMPLE_v1_PERMISSIONS_SYSTEMS[0].users.admins[1].username).toEqual("rplyrde");
      expect(SAMPLE_v1_PERMISSIONS_SYSTEMS[1].users.admins[0].username).toEqual("linus");
      expect(SAMPLE_v1_PERMISSIONS_SYSTEMS[2].users.admins[0].username).toEqual("tarai");
      expect(SAMPLE_v1_PERMISSIONS_SYSTEMS[3].users.admins[0].username).toEqual("cottunity");
      expect(SAMPLE_v1_PERMISSIONS_SYSTEMS[4].users.admins[0].username).toEqual("phonologylabacl");
    });

  });

  xdescribe("support field methods corpora", function() {

    it("should populate from a field linguistics course permissions", function() {
      var permissions = new Permissions({
        debugMode: true
      });
      permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[0].users)));


      expect(permissions.admins).toBeDefined();
      expect(permissions.admins.users.length).toEqual(2);
      expect(permissions.admins.users.toJSON()[1].username).toEqual("rplyrde");

      expect(permissions.writers).toBeDefined();
      expect(permissions.writers.users.length).toEqual(16);

      expect(permissions.readers).toBeDefined();
      expect(permissions.readers.users.length).toEqual(16);

      expect(permissions.commenters).toBeDefined();
      expect(permissions.commenters.users.length).toEqual(16);


      var isReaderAlsoAWriter;
      var isReaderAlsoACommenter;
      permissions.readers.users.map(function(reader) {
        isReaderAlsoAWriter = permissions.writers.users.indexOf(reader) > -1;
        expect(isReaderAlsoAWriter).toBeTruthy();

        isReaderAlsoACommenter = permissions.commenters.users.indexOf(reader) > -1;
        expect(isReaderAlsoACommenter).toBeTruthy();
      });

      var isAnyAdminNotAWriter = [];
      permissions.admins.users.map(function(admin) {
        isAnyAdminNotAWriter.push(permissions.writers.users.indexOf(admin) === -1);
      });
      expect(isAnyAdminNotAWriter[0]).toBeTruthy();
    });

  });


  xdescribe("support research & language community team corpora", function() {
    var permissions;
    beforeEach(function() {
      permissions = new Permissions({
        // debugMode: true
      });
      permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[1].users)));

    });

    it("should populate from a field linguistics course permissions", function() {
      expect(permissions.admins).toBeDefined();
      expect(permissions.admins.users.length).toEqual(1);
      expect(permissions.admins.users.toJSON()[0].username).toEqual("linus");

      expect(permissions.writers).toBeDefined();
      expect(permissions.writers.users.length).toEqual(5);
      expect(permissions.writers.users.toJSON()[0].username).toEqual("estita");

      expect(permissions.readers).toBeDefined();
      expect(permissions.readers.users.length).toEqual(5);
      expect(permissions.readers.users.toJSON()[0].username).toEqual("estita");

      expect(permissions.commenters).toBeDefined();
      expect(permissions.commenters.users.length).toEqual(1);
    });

    it("should accept new permissions", function() {
      expect(permissions.devcopy_writers).toBeDefined();
      expect(permissions.devcopy_writers.verb).toEqual("devcopy_write");
      expect(permissions.devcopy_writers.labelFieldLinguists).toEqual("Devcopy_writers");
      expect(permissions.devcopy_writers.helpLinguists).toEqual("These users can perform devcopy_write operations on the corpus");
      expect(permissions.devcopy_writers.users.length).toEqual(1);
    });

  });

  xdescribe("support crowdsourcing language lession corpora", function() {
    it("should populate from a field linguistics course permissions", function() {
      var permissions = new Permissions({
        // debugMode: true
      });
      permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[3].users)));

      expect(permissions.admins).toBeDefined();
      expect(permissions.admins.users.length).toEqual(3);
      expect(permissions.admins.users.toJSON()[0].username).toEqual("cottunity");

      expect(permissions.writers).toBeDefined();
      expect(permissions.writers.users.length).toEqual(6);
      expect(permissions.admins.users.toJSON()[1].username).toEqual("linus");

      var generalPublicCanSeeDataButOnlyValidUsersCanContributeIt = permissions.readers.users.indexOf("public") > -1 && permissions.writers.users.indexOf("public") === -1;
      expect(generalPublicCanSeeDataButOnlyValidUsersCanContributeIt).toBeTruthy();

      expect(permissions.readers).toBeDefined();
      expect(permissions.readers.users.length).toEqual(7);
      expect(permissions.readers.users.toJSON()[3].username).toEqual("dory");

      expect(permissions.commenters).toBeDefined();
      expect(permissions.commenters.users.length).toEqual(4);
    });

  });

  xdescribe("support pyscholinguistics corpora", function() {


    it("should populate from a psycholinguistics corpus permissions", function() {
      var permissions = new Permissions({
        // debugMode: true
      });
      permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[4].users)));

      expect(permissions.admins).toBeDefined();
      expect(permissions.admins.users.length).toEqual(1);
      expect(permissions.admins.users.toJSON()[0].username).toEqual("phonologylabacl");

      expect(permissions.writers).toBeDefined();
      expect(permissions.writers.users.length).toEqual(1);
      expect(permissions.writers.users.toJSON()[0].username).toEqual("public");

      var generalPublicCanWriteButNotRead = permissions.writers.users.indexOf("public") > -1 && permissions.readers.users.indexOf("public") === -1;
      expect(generalPublicCanWriteButNotRead).toBeTruthy();

      expect(permissions.readers).toBeDefined();
      expect(permissions.readers.users.length).toEqual(1);
      expect(permissions.readers.users.toJSON()[0].username).toEqual("phonologylabacl");

      expect(permissions.commenters).toBeDefined();
      expect(permissions.commenters.users.length).toEqual(0);

    });

  });
});
