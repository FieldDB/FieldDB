var Collection = require("./../Collection").Collection;
var DatumField = require("./../datum/DatumField").DatumField;

/**
 * @class Collection of Datum Field
 * @name  DatumFields
 * @description The DatumFields is a minimal customization of the Collection
 * to add an internal model of DatumField.
 *
 * @extends Collection
 * @constructs
 */
var DatumFields = function DatumFields(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "DatumFields";
  }
  var originalObject;
  if (Object.prototype.toString.call(options) !== "[object Array]" && !options.collection && !options.inverted) {
    var fieldsObjectConvertedIntoArray = [];
    for (var field in options) {
      if (!options.hasOwnProperty(field)) {
        continue;
      }
      fieldsObjectConvertedIntoArray.push({
        id: field,
        value: options[field]
      });
    }
    originalObject = options;
    options = fieldsObjectConvertedIntoArray;
  }

  this.debug("Constructing DatumFields length: ", options);
  Collection.apply(this, arguments);

  // Simulate that it is still an object
  if (originalObject) {
    for (var field in originalObject) {
      if (!originalObject.hasOwnProperty(field)) {
        continue;
      }
      this[field] = this[field].value;
      // this.prototype[field] = {
      //   get: function() {
      //     return this.fields[field].value;
      //   },
      //   set: function(value) {
      //     this.fields[field].value = value;
      //   }
      // }
    }
  }
};

DatumFields.prototype = Object.create(Collection.prototype, /** @lends DatumFields.prototype */ {
  constructor: {
    value: DatumFields
  },

  /**
   *  The primary key < v2 was "label" but we changed to use "id" so that
   *  "label" could be used only for a human friendly (and customizable)
   *  label while the id must remain unchanged for glossing and other automation.
   * @type {Object}
   */
  primaryKey: {
    value: "id"
  },

  INTERNAL_MODELS: {
    value: {
      item: DatumField
    }
  },

  capitalizeFirstCharacterOfPrimaryKeys: {
    value: false
  },

  /**
   *  Docs/items in a DatumFields are reorderable by default
   * @type {Boolean}
   */
  docsAreReorderable: {
    get: function() {
      if (this._docsAreReorderable !== null && this._docsAreReorderable !== undefined) {
        return this._docsAreReorderable;
      }
      return true;
    },
    set: function(value) {
      if (value === null || value === undefined) {
        delete this._docsAreReorderable;
        return;
      }
      this._docsAreReorderable = value;
    }
  },

  /**
   *  Docs/items in a DatumFields are reorderable by default
   * @type {Boolean}
   */
  showDocPosition: {
    get: function() {
      if (this._showDocPosition !== null && this._showDocPosition !== undefined) {
        return this._showDocPosition;
      }
      return true;
    },
    set: function(value) {
      if (value === null || value === undefined) {
        delete this._showDocPosition;
        return;
      }
      this._showDocPosition = value;
    }
  },

  cloneStructure: {
    value: function(includeEvenEmptyAttributes) {
      if (includeEvenEmptyAttributes) {
        this.todo("includeEvenEmptyAttributes is not implemented: " + includeEvenEmptyAttributes);
      }
      var json = Collection.prototype.toJSON.apply(this, arguments);
      json.map = json.map(function(field) {
        field.value = "";
        field.mask = "";
        field.encryptedValue = "";
        return field;
      });
      return json;
    }
  }

});
exports.DatumFields = DatumFields;
