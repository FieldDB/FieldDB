define( [ 
    "use!backbone" ,
    "datum/DatumField",
    "datum/DatumState"
], function(Backbone,DatumField,DatumState) {
  var DatumPref = Backbone.Model.extend(
      /** @lends Preference.prototype */
      {
        /**
         * @class The datum preferences is the page where the user can decide which fields, statees and menu buttons they want. 
         * For instance, if a user doesn't use LaTeX, they can remove the button.  Or if they don't have any audio, they can get rid of the drop audio field.
         * 
         * @extends Backbone.Model
         * @constructs
         */
        initialize : function() {
        },
        
        defaults : {
            //here are some extra fields that I think linguists may want.
            DatumField : null,
            DatumState: null,
          
        },
       });
  

  return DatumPref;
});