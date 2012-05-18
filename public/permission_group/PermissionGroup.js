
var PermissionGroup = Backbone.Collection.extend(
		
/** @lends PermissionGroup.prototype  */
		
{
/**
 * @class A permission group has a collection of users and a collection 
 * of permissions. 
 * @extends Backbone.Collection
 * @constructs
 * 
 * 
 */

	model: User.
	
	
        

 

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
//    
    var g1 = new User({ permission1: "read", permission2: "write" });
    var g2 = new User({ permission1: "read" });
    var g3 = new User({ permission1: "read", permission2: "write", permission3: "admin" });
    
   var myPermissionGroup = new PermissionGroup([g1, g2, g3]);
    console.log( myPermissionGroup.models	);
    

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
