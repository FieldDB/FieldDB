define([
    "use!backbone"
], function (Backbone) {
    var Permission = Backbone.Model.extend({
        intialize: function() {
            
        },
        defaults: {
            type: "r"
        }
    });
    
    return Permission;
});
