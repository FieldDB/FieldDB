define("datum/Datums", [
    "use!backbone",
    "datum/Datum",
    "libs/Utils"
], function(Backbone, Datum) {
    var Datums = Backbone.Collection.extend(
    /** @lends Datums.prototype */
    {
       /**
        * @class A collection of Datums.
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       
       model: Datum,
       
       pouch: Backbone.sync.pouch(Utils.pouchUrl)
    });
    
    return Datums;
});