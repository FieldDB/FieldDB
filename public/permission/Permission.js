define("permission/Permission", 
		[ "use!backbone"
		  ],
		  function(Backbone){
	  var Permission = Backbone.Model.extend(
			
		  /** @lends Permission.prototype 	*/
			  
		{
		  /**
		   * @class The permission class specifies data access types (e.g. read, write, admin) for a user with respect to a corpus. 
		   * 
		   *   @extends Backbone.Model
		   *   @constructs 
		   */ 
	        intialize: function() {
	            
	        },
	        defaults: {
	            type: "r"
	        }
	    });
	    
	    return Permission;
	});


// var Permission = function(username, corpusid, [permissions]){
//		  this.get("username") == username {
//		  this.get("corpusid") == corpusid 
// 
//
//  }
//
//
