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
      	     
      	      fields: [{
      	          id: 1,
      	          label: 'Script'
      	          
	      	      }, {
	      	      id: 2,
	      	      label: 'Context',
	      	      selected: true 
	      	      
	      	      }, {
	      	      id: 3,
	      	      label: 'Semantic Denotation'
	      	    	  
	      	      }, {
	    	      id: 4,
	    	      label: 'IPA'
	    	    	  
	    	      },{
		          id: 5,
		          label: 'Segmentation'
		        	  
		          },{
		          id: 6,
		          label: 'Other'
		          } ], 
      	      
      	      active: 0,
      	      defaultStatus: 0
      	   },

       });
  

  return DatumField;
});
