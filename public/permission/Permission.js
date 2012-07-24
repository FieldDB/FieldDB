define([
    "backbone"
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
    },
  
    defaults : {
//      usernames: [],
//      role: "", //admin, contributor, collaborator
//      corpusname: "",
    },
    
    // Internal models: used by the parse function
    model : {
      // There are no nested models
    },
    saveAndInterConnectInApp : function(callback){
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return Permission;
});