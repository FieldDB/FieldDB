define([
    "backbone",
    "data_list/DataList"
], function(
    Backbone, 
    DataList
) {
    var DataLists = Backbone.Collection.extend(
    /** @lends DataLists.prototype */
    {
       /**
        * @class A collection of DataLists
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       
       model: DataList
    });
    
    return DataLists;
});
