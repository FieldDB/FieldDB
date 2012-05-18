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
             *         
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
    
