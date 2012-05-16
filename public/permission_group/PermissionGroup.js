var PermissionGroup = Backbone.Collection.extend(
		
/** @lends PermissionGroup.prototype  */
		
{
/**
 * @class A permission group is a collection of users and a collection 
 * of permissions. 
 * 
 * 
 */

	model: User, 
        
        initialize: function() {
  	      this.bind('error', function(model, error) {
  	         // TODO Handle validation errors
  	      });
        }
    });
//    
    var g1 = new User({ permission1: "read", permission2: "write" });
    var g2 = new User({ permission1: "read" });
    var g3 = new User({ permission1: "read", permission2: "write", permission3: "admin" });
    
   var myPermissionGroup = new PermissionGroup([g1, g2, g3]);
    console.log( myPermissionGroup.models	);
    





// var Teammate = User.extend({
//	initialize: function(attributes) {
//		Teammate.__super__.initialize.call(this, attributes);
//		 this.set("teamid" , ""),
//		 this.set("teamname" , "");
//	   }
//    });
    

    