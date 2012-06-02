define( [
    "use!backbone", 
    "use!handlebars", 
    "search/Search",
    "text!search/search.handlebars"
], function(Backbone, Handlebars, Search, searchTemplate) {
    var SearchView = Backbone.View.extend(
    /** @lends DatumFieldView.prototype */
    {
        /**
         * @class Search
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : Search,

        classname : "search",

        template: Handlebars.compile(searchTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return SearchView;
}); 