define([
  "backbone"
], function(
  Backbone
) {
  var CouchDBAttachment = Backbone.Model.extend(
    /** @lends CouchDBAttachment.prototype */
    {
      /**
         * @class CouchDBAttachment models allows a user to add audio, video, text and image files.
         *
         *"1389572491200.wav": {
               "content_type": "audio/wav",
               "revpos": 2,
               "digest": "md5-fCungZOE9WJIc+a+01MOxA==",
               "length": 786476,
               "stub": true
           }
         * @description Initialize function
         *
         * @extends Backbone.Model
         *
         * @constructs
         */
      
    });

  var CouchDBAttachments = Backbone.Model.extend(
    /** @lends CouchDBAttachments.prototype */
    {
      /**
       * @class CouchDBAttachments models allows a user to add audio, video, text and image files.
       *
       *
       * "_attachments": {
             "1389572491200.wav": {
                 "content_type": "audio/wav",
                 "revpos": 2,
                 "digest": "md5-fCungZOE9WJIc+a+01MOxA==",
                 "length": 786476,
                 "stub": true
             }
         }
       * @description Initialize function
       *
       * @extends Backbone.Model
       *
       * @constructs
       */
      initialize: function() {},

      originalParse: Backbone.Model.prototype.parse,
      parse: function(originalModel) {
        
        for (var attachment in originalModel) {
          if (originalModel.hasOwnProperty(attachment)) {
            console.log("Here is an attachment", attachment);
            console.log(originalModel[attachment]);
          }
        }

        return originalModel;
        // return this.originalParse(originalModel);
      },
    });

  return CouchDBAttachments;
});
