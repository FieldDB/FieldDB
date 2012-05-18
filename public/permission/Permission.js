define("permission/Permission", 
<<<<<<< HEAD
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
=======
		["use!backbone"], 
		function (Backbone) {
	
	var Permission = Backbone.Model.extend(
			
		/** @lends Permission.prototype */ 
	{
		/** @class The permission class specifies the types of access permission a user has with respect to a corpus, e.g. read, write, admin.  
		 */
	
  return function () {
    return {};
  
  }); 

  
});
	
  
>>>>>>> e92371bbeb027b0a8bc2f9282edaf5a0b623db3f
