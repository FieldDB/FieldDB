define("navigation/Navigation",
    [ "use!backbone"],
    function(Backbone) {
      var Navigation = Backbone.Model
      .extend(

          /** @lends Navigation.prototype */
          {
            /**
             * @class Navigation is a panel on the main dashboard screen, which displays a menu of
             * things the User can do (ex. open a new session, browse all entries, etc.).  
             * 
             * * @property {Import} importer The importer is an Importer object which
     *           attaches itself to the document page on Chrome Extensions
     *           and non-mobile browsers to listen to drag and drop events
     *           and attempt to import the contents of the dragged and
     *           dropped files. On android the app will have to import data
     *           via the menus.        
             * 
             * 
             * 
             * @extends Backbone.Model
             * @constructs
             */

            
            initialize : function() {
              }
          
          });

           

      return Navigation;
    });
    
