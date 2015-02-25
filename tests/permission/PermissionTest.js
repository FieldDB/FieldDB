var Permissions = require("./../../api/permission/Permissions").Permissions;
var SAMPLE_v1_PERMISSIONS_SYSTEMS = require("./../../sample_data/permissions_v1.22.1.json");
describe("Permission Tests", function() {
  xdescribe("construction", function() {
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

    it("should provide a list of current hats on the team", function() {
      expect(permissions.currentPermissions).toEqual(["admins", "writers", "readers", "commenters", "exporters"]);
    });

    xdescribe("adding users", function() {
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



  xdescribe("sample permissions", function() {

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
        // debugMode: true
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

  describe("ways to view permissions sytems", function() {

    it("should present a view that is implicational like PHPMyAdmin", function() {
      var permissions = new Permissions();
      permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[0].users)));

      expect(permissions.admins).toBeDefined();
      expect(permissions.admins.length).toEqual(2);

      expect(permissions.readerCommenterWriterAdmins).toBeDefined();
      expect(permissions.readerCommenterWriterAdmins.length).toEqual(1);
      expect(permissions.readerCommenterWriterAdmins._collection[0].username).toEqual("rplyrde");

      expect(permissions.readerCommenterWriters).toBeDefined();
      expect(permissions.readerCommenterWriters.length).toEqual(15);
      expect(permissions.readerCommenterWriters._collection[4].username).toEqual("aivgeniia");

      expect(permissions.readerCommenterOnlys).toBeDefined();
      expect(permissions.readerCommenterOnlys.length).toEqual(0);

      expect(permissions.viewAsDataBasePermissionSystem.admins).toBeDefined();
      expect(permissions.viewAsDataBasePermissionSystem.writers).toBeDefined();
      expect(permissions.viewAsDataBasePermissionSystem.readers).toBeDefined();
      expect(permissions.viewAsDataBasePermissionSystem.commenters).toBeDefined();

      expect(permissions.viewAsDataBasePermissionSystem.admins.length).toEqual(1);
      expect(permissions.viewAsDataBasePermissionSystem.writers.length).toEqual(15);
      expect(permissions.viewAsDataBasePermissionSystem.readers.length).toEqual(0);
      expect(permissions.viewAsDataBasePermissionSystem.commenters.length).toEqual(0);
    });



    describe("syntactic sugar for groups", function() {

      it("should be able to build custom groups ", function() {
        var permissions = new Permissions();
        permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[0].users)));

        expect(permissions.admins).toBeDefined();
        expect(permissions.admins.length).toEqual(2);
        expect(permissions.admins.map(function(user) {
          return user.username;
        })).toEqual(["linus", "rplyrde"]);

        var myCustomGroup = permissions.giveMeUsersWithTheseRolesAndNotTheseRoles();
        expect(permissions.bugMessage).toBeDefined();
        expect(permissions.bugMessage).toContain("must supply the roles you want");

        delete permissions.bugMessage;
        myCustomGroup = permissions.giveMeUsersWithTheseRolesAndNotTheseRoles("admin", "writer");
        expect(permissions.bugMessage).toBeDefined();
        expect(permissions.bugMessage).toContain("must supply an array of the roles you want");

        delete permissions.bugMessage;
        myCustomGroup = permissions.giveMeUsersWithTheseRolesAndNotTheseRoles(["admin"], []);
        expect(permissions.bugMessage).toBeUndefined();
        expect(myCustomGroup.length).toEqual(permissions.admins.length);

        myCustomGroup = permissions.giveMeUsersWithTheseRolesAndNotTheseRoles(["admin"], ["writer", "reader"]);
        expect(myCustomGroup.length).toEqual(1);

        myCustomGroup = permissions.giveMeUsersWithTheseRolesAndNotTheseRoles(["reader"], ["writers"]);
        expect(myCustomGroup.length).toEqual(0);

        myCustomGroup = permissions.giveMeUsersWithTheseRolesAndNotTheseRoles(["reader", "writer"], ["admin"]);
        expect(myCustomGroup.length).toEqual(15);

      });

      it("should be able to show groups that could happen in a field methods class", function() {
        var permissions = new Permissions();
        permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[0].users)));

        expect(permissions.admins.users.linus).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.adminOnlys).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.adminOnlys.length).toEqual(1);
        expect(permissions.viewAsGroupedPermissionSystem.adminOnlys._collection[0].username).toEqual("linus");

        // it should be fast
        // expect(Date.now() - permissions._adminOnlys.timestamp).toBeLessThan(1); //admin only
        // expect(Date.now() - permissions._adminOnlys.timestamp).toBeLessThan(7); //writer only and above
        // expect(Date.now() - permissions._adminOnlys.timestamp).toBeLessThan(13); //reader only and above
        // expect(Date.now() - permissions._adminOnlys.timestamp).toBeLessThan(40); //readerCommenter only and above
        // expect(Date.now() - permissions._adminOnlys.timestamp).toBeLessThan(47); //readerCommenterWriter only and above
        expect(Date.now() - permissions._adminOnlys.timestamp).toBeLessThan(60); //commentOnly only and above
      });

      it("should be able to show groups that could happen in an experiment team ", function() {
        permissions = new Permissions();
        permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[4].users)));

        expect(permissions.writers.users.public).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.writeOnlys).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.writeOnlys.length).toEqual(1);
        expect(permissions.viewAsGroupedPermissionSystem.writeOnlys._collection[0].username).toEqual("public");
      });

      it("should be able to show groups that could happen in a browseable language learning corpus ", function() {
        permissions = new Permissions();
        permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[3].users)));

        expect(permissions.readers.users.public).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.readOnlys).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.readOnlys.length).toEqual(1);
        expect(permissions.viewAsGroupedPermissionSystem.readOnlys._collection[0].username).toEqual("public");
      });

      it("should be able to show groups that could happen in a research team with consultants ", function() {
        permissions = new Permissions();
        permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[1].users)));
        // permissions.debugMode = true;

        expect(permissions.readers.users.irakli).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.readerCommenterOnlys).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.readerCommenterOnlys.length).toEqual(1);
        expect(permissions.viewAsGroupedPermissionSystem.readerCommenterOnlys._collection[0].username).toEqual("irakli");

        expect(permissions.commenters.users.qaxa).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.commentOnlys).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.commentOnlys.length).toEqual(1);
        expect(permissions.viewAsGroupedPermissionSystem.commentOnlys._collection[0].username).toEqual("qaxa");

        expect(permissions.viewAsGroupedPermissionSystem.readerWriters).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.readerWriters.length).toEqual(3);
        expect(permissions.viewAsGroupedPermissionSystem.readerWriters.map(function(user) {
          return user.username;
        })).toEqual(["estita", "tariattgeladze", "tatiik"]);
      });


      it("should be able to show groups whta could happen in a research team with RAs ", function() {
        permissions = new Permissions();
        permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[2].users)));

        expect(permissions.admins.users.tarai).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.admins).toBeDefined();
        expect(permissions.viewAsGroupedPermissionSystem.admins.length).toEqual(3);
        expect(permissions.viewAsGroupedPermissionSystem.admins.map(function(user) {
          return user.username;
        })).toEqual(["tarai", "lizzaicarolan", "lyisabailig"]);
      });

    });

    xit("should present a view that is like github like", function() {
      var permissions = new Permissions({
        debugMode: true
      });
      permissions.populate(JSON.parse(JSON.stringify(SAMPLE_v1_PERMISSIONS_SYSTEMS[0].users)));

      expect(permissions.viewAsEmailingTeamPermissionSystem.contributors).toBeDefined();
      expect(permissions.viewAsEmailingTeamPermissionSystem.collaborators).toBeDefined();
      expect(permissions.viewAsEmailingTeamPermissionSystem.owners).toBeDefined();
    });

  });

});
