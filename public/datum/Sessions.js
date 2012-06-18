define([
    "use!backbone",
    "datum/Session"
], function(
    Backbone, 
    Session
) {
    var Sessions = Backbone.Collection.extend(
    /** @lends Datums.prototype */
    {
       /**
        * @class A collection of Sessions Probably will be used in the fullscreen corpus view.
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       
       model: Session
    });
    
    return Sessions;
});