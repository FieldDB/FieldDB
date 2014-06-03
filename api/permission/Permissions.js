define([
  "backbone",
  "permission/Permission"
], function(
  Backbone,
  Permission
) {
  var Permissions = Backbone.Collection.extend(
    /** @lends Permissions.prototype */
    {
      /**
       * @class A collection of Permissions
       *
       * @extends Backbone.Collection
       * @constructs
       */
      initialize: function() {},
      internalModels: Permission,
      model: Permission,

      fetch: function(doneLoadingPermissions) {
        if (!this.get("team")) {
          //If app is completed loaded use the user, otherwise put a blank user
          if (window.appView) {
            this.set("team", window.app.get("authentication").get("userPublic"));
            //          this.get("team").id = window.app.get("authentication").get("userPublic").id;
          } else {
            //          this.set("team", new UserMask({pouchname: this.get("pouchname")}));
          }
        }

        var self = this;
        // load the permissions in from the server.
        window.app.get("authentication").fetchListOfUsersGroupedByPermissions(function(users) {
          var typeaheadusers = [];
          for (var userX in users.notonteam) {
            if (users.notonteam[userX].username) {
              typeaheadusers.push(users.notonteam[userX].username);
            } else {
              if (OPrime.debugMode) {
                OPrime.debug("This user is invalid", users.notonteam[userX]);
              }
            }
          }
          typeaheadusers = JSON.stringify(typeaheadusers);
          var potentialusers = users.allusers || [];

          var admins = new Users();
          self.add(new Permission({
            users: admins,
            role: "admin",
            typeaheadusers: typeaheadusers,
            potentialusers: potentialusers,
            pouchname: self.get("pouchname")
          }));

          var writers = new Users();
          self.add(new Permission({
            users: writers,
            role: "writer",
            typeaheadusers: typeaheadusers,
            potentialusers: potentialusers,
            pouchname: self.get("pouchname")
          }));

          var readers = new Users();
          self.add(new Permission({
            users: readers,
            role: "reader",
            typeaheadusers: typeaheadusers,
            potentialusers: potentialusers,
            pouchname: self.get("pouchname")
          }));

          var u;
          var user;
          if (users.admins && users.admins.length > 0) {
            for (u in users.admins) {
              if (!users.admins[u].username) {
                continue;
              }
              user = {
                "username": users.admins[u].username
              };
              if (users.admins[u].gravatar) {
                user.gravatar = users.admins[u].gravatar;
              }
              admins.models.push(new UserMask(user));
            }
          }
          if (users.writers && users.writers.length > 0) {
            for (u in users.writers) {
              if (!users.writers[u].username) {
                continue;
              }
              user = {
                "username": users.writers[u].username
              };
              if (users.writers[u].gravatar) {
                user.gravatar = users.writers[u].gravatar;
              }
              writers.models.push(new UserMask(user));
            }
          }
          if (users.readers && users.readers.length > 0) {
            for (u in users.readers) {
              if (!users.readers[u].username) {
                continue;
              }
              user = {
                "username": users.readers[u].username
              };
              if (users.readers[u].gravatar) {
                user.gravatar = users.readers[u].gravatar;
              }
              readers.models.push(new UserMask(user));
            }
          }
          //Set up the typeahead for the permissions edit

          if (typeof doneLoadingPermissions === "function") {
            doneLoadingPermissions();
          }
        });
      }

    });

  return Permissions;
});
