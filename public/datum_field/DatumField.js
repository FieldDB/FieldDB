define("datum_field/DatumField", [ 
    "use!backbone" 
], function(Backbone) {
  var DatumField = Backbone.Model.extend(
      /** @lends Preference.prototype */
      {
        /**
         * @class The datum fields are the additional fields added by user
         * 
         * @extends Backbone.Model
         * @constructs
         */
        initialize : function() {
        },
        
        defaults : {
            //here are some extra fields that I think linguists may want.
          
//      	      fields: 
      	     
        	
        	script: "",
        	context: "",
        	semanticDenotation: "",
        	ipa: "",
        	segmentation: "tusu-naya-wa-n",
        	other: "",
        	
        }
       });
  

  return DatumField;
});
