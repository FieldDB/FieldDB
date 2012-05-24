define("datum_prefs/DatumPrefs", [ 
    "use!backbone" ,
    "datum_field/DatumField",
    "datum_menu/DatumMenu",
    "datum_status/DatumStatus"
], function(Backbone,DatumField,DatumMenu,DatumStatus) {
  var DatumPrefs = Backbone.Model.extend(
      /** @lends Preference.prototype */
      {
        /**
         * @class The datum preferences is the page where the user can decide which fields, statuses and menu buttons they want. 
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
            DatumStatus: null,
            DatumMenu: null
          
        },
       });
  

  return DatumPrefs;
});