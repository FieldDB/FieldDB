define([
    "backbone",
    "data_list/Conversation"
], function(
    Backbone, 
    Conversation
) {
    var Conversations = Backbone.Collection.extend(
    /** @lends Conversations.prototype */
    {
       /**
        * @class A collection of Conversations
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       internalModels : Conversation,
       model: Conversation
    });
    
    return Conversations;
});
