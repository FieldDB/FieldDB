define("navigation/NavigationView", [
    "use!backbone", 
    "use!handlebars", 
    "navigation/Navigation",
    "text!navigation/navigation.handlebars",
], function(Backbone, Handlebars, Navigation, navigationTemplate) {
    var NavigationView = Backbone.View.extend(
    /** @lends DatumView.prototype */
    {
        /**
         * @class The layout of a single Datum. It contains a datum status.   
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : Navigation,

        classname : "menu",

        template: Handlebars.compile(navigationTemplate),
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return NavigationView;
}); 