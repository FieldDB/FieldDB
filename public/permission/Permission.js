define(
    [ "use!backbone"
      ],
      function(Backbone){
      var Permission = Backbone.Model.extend(

          /** @lends Permission.prototype 	*/

          {
            /**
             * @class The permission class specifies data access types (e.g. read,
             *        write, admin) for a usergeneric with respect to a corpus.
             * 
             * @property {String} type Type is the permission type, which is one of {read, write, export}
             * @property {UserGeneric} user User is the id of the {User, Bot, Informant, Team} with this permission. 
             * s
             * @extends Backbone.Model
             * @constructs
             */ 
            intialize: function() {

            },
            defaults: {
              type: "r",
              user: null
            },
            types: {
              read: "r",
              write: "w",
              exportt: "e"
            }
          });

      return Permission;
    });

