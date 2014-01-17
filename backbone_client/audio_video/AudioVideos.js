define([
    "backbone",
    "audio_video/AudioVideo"
], function(
    Backbone, 
    AudioVideo
) {
    var AudioVideos = Backbone.Collection.extend(
    /** @lends AudioVideos.prototype */
    {
       /**
        * @class A collection of AudioVideos Probably will be used in the fullscreen corpus view.
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       
       /**
        * backbone-couchdb adaptor set up
        */
       // db : {
       //   view : "audioVideos",
       //   changes : false,
       //   filter : Backbone.couch_connector.config.ddoc_name + "/audioVideos"
       // },
       // The couchdb-connector is capable of mapping the url scheme
       // proposed by the authors of Backbone to documents in your database,
       // so that you don't have to change existing apps when you switch the sync-strategy
       // url : "/audioVideos",
       // The messages should be ordered by date
       comparator : function(doc){
         return doc.get("timestamp");
       },
       
       internalModels : AudioVideo,

       model: AudioVideo
       
    });
    
    return AudioVideos;
});
