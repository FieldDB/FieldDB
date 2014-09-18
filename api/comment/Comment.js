var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

/**
 * @class Comments allow users to collaborate between each other and take
 *        note of important things, issues to be fixed, etc. These can
 *        appear on datum, sessions corpora, and dataLists. Comments can
 *        also be edited and removed.
 *
 * @property {String} text Describe text here.
 * @property {Number} username Describe username here.
 * @property {Date} timestamp Describe timestamp here.
 *
 * @name  Comment
 * @extends FieldDBObject
 * @constructs
 */
var Comment = function Comment(options) {
  this.debug("Constructing Comment ", options);
  FieldDBObject.apply(this, arguments);
};

Comment.prototype = Object.create(FieldDBObject.prototype, /** @lends Comment.prototype */ {

  constructor: {
    value: Comment
  },

  build: {
    value: function(usermask) {
      this.timestamp = Date.now();
      this.gravatar = usermask.gravatar;
      this.username = usermask.username;
    }
  },

  timestamp: {
    get: function() {
      return this._timestamp;
    },
    set: function(value) {
      if (value === this._timestamp) {
        return;
      }
      if (!value) {
        delete this._timestamp;
        return;
      }
      if (("" + value).indexOf("Z") > -1) {
        value = (new Date(value)).getTime();
      }

      this._timestamp = value;
    }
  },

  /**
   * The edit function allows users to edit a comment.
   *
   * @param {String}  newtext Takes new text and replaces old one.
   */
  edit: {
    value: function(newtext) {
      this.text = newtext;
      this.timestampModified = Date.now();
    }
  },

  commentCreatedActivity: {
    value: function(indirectObjectString) {
      var commentstring = this.text;
      return [{
          verb: "commented",
          verbicon: "icon-comment",
          directobjecticon: "",
          directobject: "'" + commentstring + "'",
          indirectobject: indirectObjectString,
          teamOrPersonal: "team",
          context: " via Offline App."
        },

        {
          verb: "commented",
          verbicon: "icon-comment",
          directobjecticon: "",
          directobject: "'" + commentstring + "'",
          indirectobject: indirectObjectString,
          teamOrPersonal: "personal",
          context: " via Offline App."
        }
      ];
    }
  }

});

exports.Comment = Comment;
