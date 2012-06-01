define("data_list/DataList", [
    "use!backbone",
    "datum/Datum",
    "datum_status/DatumStatus",
    "datum_menu/DatumMenu",
    "datum_tag/DatumTag",
    "datum_field/DatumField",
    "session/Session"
], function(Backbone, Datum, DatumStatus, DatumMenu, DatumTag, DatumField, Session) {
    var DataList = Backbone.Model.extend(
    /** @lends DataList.prototype */
    {
        /**
         * @class The Data List widget is the list that appears after a search has been called.
         * 
         *
         * @description The initialize function brings up the dataList view.  
         * The dataList is not invoked until something is searched and then the dataList will provide
         * filtered results of the user's corpus.
         * 
         * @extends Backbone.Model
         * @constructs
         */
        initialize : function() {
            this.bind('error', function(model, error) {
                // TODO Handle validation errors
//                datumMenu : new DatumMenu()
//            	this.menuview = new DatumMenuView({model: this.model.get("datumMenu")});

            });

            // TODO Set up any other bindings (i.e. what to do when certain Events
            //      happen). Example:
            // this.bind("change:someAttribute", function() {
            //    console.log("We just changed someAttribute");
            // });

        },

        defaults : {
            //here are the attributes a datum minimally has to have, other fields can be added when the user designs their own fields later.
            title : "NELS handout",
            dateCreated : "May 29, 2012",
            description : "some useful examples"
//            datumMenu : null
          
        },
        /**
         * <TODO Describe the validation here.>
         *
         * @param {Object} attributes The set of attributes to validate.
         *
         * @returns {String} The validation error, if there is one. Otherwise, doesn't
         * return anything.
         */
        validate : function(attributes) {
            //I'm not sure what this function is supposed to do for this particular model, honestly, the use should be able to put in wahtever they want in the fields.
            // TODO Validation on the attributes. Returning a String counts as an error.
            //      Example:
            // if (attributes.someAttribute <= 0) {
            //    return "Must use positive numbers";
            // }
        },
    });

    return DataList;
});






//var DataList = DataList || {};
