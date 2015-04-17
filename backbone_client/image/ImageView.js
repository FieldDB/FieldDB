define([
  "backbone",
  "handlebars",
  "image/Image"
], function(Backbone,
  Handlebars,
  Image) {
  var ImageView = Backbone.View.extend(
    /** @lends ImagesView.prototype */
    {
      /**
       * @class ImagesView
       *
       * @extends Backbone.View
       * @constructs
       */
      initialize: function() {
        if (OPrime.debugMode) OPrime.debug("INSERT VIEW init");

      },
      events: {
        "click .remove-image": "removeImage",
        "blur .edit-caption-input": function(e) {
          e.stopPropagation();
          e.preventDefault();
          this.model.set("caption", $(e.target).val().trim());
        }
      },
      model: Image,
      template: Handlebars.templates.image,
      tagName: "span",

      render: function() {
        if (OPrime.debugMode) OPrime.debug("IMAGE render");

        var jsonToRender = this.model.toJSON();
        if (!jsonToRender.URL) {
          jsonToRender.URL = jsonToRender.filename;
          if (jsonToRender.URL.indexOf("://") === -1) {
            jsonToRender.URL = OPrime.audioUrl + "/" + window.app.get("corpus").get("dbname") + "/" + jsonToRender.filename;
          }
        }
        $(this.el).html(this.template(jsonToRender));

        return this;
      },

      removeImage: function(e) {
        e.stopPropagation();
        e.preventDefault();
        var c = confirm("Are you sure you want to put this image in the trash?");
        if (c) {
          this.model.set("trashed", "deleted");
        }
      }
    });
  return ImageView;
});
