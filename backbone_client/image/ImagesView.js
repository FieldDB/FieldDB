define([
  "backbone",
  "handlebars",
  "image/Image",
  "image/ImageView",
  "app/UpdatingCollectionView",
], function(Backbone,
  Handlebars,
  Image,
  ImageView,
  UpdatingCollectionView
) {
  var ImagesView = Backbone.View.extend(
    /** @lends ImagesView.prototype */
    {
      /**
       * @class ImagesView
       *
       * @property {String} format Valid values are "rightSide" or "minimized".
       *
       * @extends Backbone.View
       * @constructs
       */
      initialize: function() {
        this.changeViewsOfInternalModels();
      },
      changeViewsOfInternalModels: function() {
        this.collectionView = new UpdatingCollectionView({
          collection: this.model,
          childViewConstructor: ImageView,
          childViewTagName: "li",
        });
      },
      /**
       * Events that the Image is listening to and their handlers.
       */
      events: {
        
      },

      template: Handlebars.templates.images,

      minimizedTemplate: Handlebars.templates.images_minimized,

      render: function() {
        var jsonToRender = {};
        jsonToRender.uploadurl = "http://localhost:5984/dbtestupload/docuploadimages/attachfile"+Date.now();//app.getCouchUrl()+"/testingupload/"
        jsonToRender.docRevision = "1-967a00dff5e02add41819138abb3284d";
        // jsonToRender.uploadurl = "https://corpus.lingsync.org/dev-firstcorpus/testingupload/file"+Date.now();//+"?rev="+jsonToRender.docRevision;
        // this.setElement($(""));

        $(this.el).html(this.template(jsonToRender));

        //Updating Collection View Rendering
        this.collectionView.el = $(this.el).find(".images-list");
        this.collectionView.render();

        return this;
      }
    });
  return ImagesView;
});
