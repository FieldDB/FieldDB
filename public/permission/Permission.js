define([
    "libs/backbone"
], function(
    Backbone
) {
  var Permission = Backbone.Model.extend(
  /** @lends Permission.prototype 	*/
  {
    /**
     * @class The permission class specifies which user (User, Consultant or Bot)
     *        can do what action to what component in a given corpus. 
     *        The specification needs three arguments: User, Verb, Object 
     *       
     *        
     * @property {UserGeneric} user This is userid or username 
     * @property {String} verb Verb is the action permitted: 
     * 				admin: corpus admin. admin can handle permission of other users 
     *				read: can read 
     *				addNew: can add/create new datum etc. 
     *				edit: can edit/change the content of datum etc., including delete datum which is basically just changing datum states  
     *				comment: can comment on datum etc. 
     *				export: can export datum etc. 
     * @property {String} object Object is sub-component of the corpus to which 
     *	     	    the action is directed: 
     *				corpus: corpus and corpus details (description etc.) 
     *				datum: datums in the corpus including their states 
     *				session: sessions in the corpus 
     *				datalist: datalists in the corpus  
     * 
     * @extends Backbone.Model
     * @constructs
     */
    intialize : function() {
      //    var mayi = new MotherMayI("localhost", 6379, 0); 
    },
  
    // Default: all action-component combinations are permitted to 
    // every user? (think about a user working on by him/herself on his/her 
    // own corpus, and hasn't made it public).     
    defaults : {
      //mayi.may("userid", "admin", "corpusid", function(may){
      //	if(may) {
      //    	} else {    		
      //    	}
          	
      // })    	
          	
      // mayi.grant("userid", "admin", "", function(success) {});     	
      // mayi.grant("userid", "read", "corpusid", function(success) {});     	
      // mayi.grant("userid", "edit", "corpusid", function(success) {});     	
      // mayi.grant("userid", "comment", "corpusid", function(success) {});     	
      // mayi.grant("userid", "export", "corpusid", function(success) {});
    },
    
    model : {
      // There are no nested models
    },
    
    parse : function(response) {
      if (response.ok === undefined) {
        for (var key in this.model) {
          var embeddedClass = this.model[key];
          var embeddedData = response[key];
          response[key] = new embeddedClass(embeddedData, {parse:true});
        }
      }
      
      return response;
    }
  });

  return Permission;
});