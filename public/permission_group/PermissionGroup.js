define("permission_group/PermissionGroup", [ 
    "use!backbone"
], function(Backbone) {
  var PermissionGroup = Backbone.Collection.extend(

      /** @lends PermissionGroup.prototype  */

      {
        /**
         * @class A permission group is a collection of users and a collection 
         * of permissions. 
         * // A permission group is a collection of users and a collection 
// of permissions. 

         * @extends Backbone.Collection
         * @constructs
         * 
         */  
        initialize: function() {
          this.bind('error', function(model, error) {
            // TODO Handle validation errors
          });

          model: User
        }
      });

//var t1 = new User({ teamid: "123", teamname: "OMC" });
//var t2 = new User({ teamid: "456", teamname: "ABC" });
//var t3 = new User({ teamid: "789", teamname: "DEF" });

//var myTeam = new Team([t1, t2, t3]);
//console.log( myTeam.models	);







//var Teammate = User.extend({
//initialize: function(attributes) {
//Teammate.__super__.initialize.call(this, attributes);
//this.set("teamid" , ""),
//this.set("teamname" , "");
//}
//});

  return PermissionGroup;
});
