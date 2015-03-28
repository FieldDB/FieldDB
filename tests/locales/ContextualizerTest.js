var Contextualizer = require("./../../api/locales/Contextualizer").Contextualizer;
var ContextualizableObject = require("./../../api/locales/ContextualizableObject").ContextualizableObject;
var FieldDBObject = require("./../../api/FieldDBObject").FieldDBObject;
var mockDatabase = require("./../corpus/DatabaseMock").mockDatabase;

var specIsRunningTooLong = 5000;

describe("Contextualizer", function() {

  afterEach(function() {
    if (FieldDBObject.application) {
      console.log("Cleaning up.");
      FieldDBObject.application = null;
    }
    mockDatabase = {
      get: mockDatabase.get,
      set: mockDatabase.set
    };
    ContextualizableObject.compatibleWithSimpleStrings = true;
  });


  beforeEach(function() {
    if (FieldDBObject.application) {
      console.log("Cleaning up.");
      FieldDBObject.application = null;
    }
    mockDatabase = {
      get: mockDatabase.get,
      set: mockDatabase.set
    };
    ContextualizableObject.compatibleWithSimpleStrings = true;
  });

  describe("construction", function() {

    it("should load the Contextualizer", function() {
      expect(Contextualizer).toBeDefined();
    });

    it("should load the Contextualizer", function() {
      var contextualizer = new Contextualizer();
      expect(contextualizer).toBeDefined();
      expect(contextualizer.defaultLocale.iso).toEqual("en");
      expect(contextualizer.currentLocale.iso).toEqual("en");
      expect(contextualizer.currentContext).toEqual("default");
    });

    it("should let users update locale strings without confirmation", function() {
      var contextualizer = new Contextualizer();
      expect(contextualizer.alwaysConfirmOkay).toBeTruthy();
    });

    it("should let callers specify that users must confirm each update locale strings", function() {
      var contextualizer = new Contextualizer({
        alwaysConfirmOkay: false
      });
      expect(contextualizer.alwaysConfirmOkay).toBeFalsy();
    });

    it("should load the default locales ", function() {
      var contextualizer = new Contextualizer();
      expect(contextualizer).toBeDefined();
      contextualizer.loadDefaults();
      expect(contextualizer.data).toBeDefined();
      expect(contextualizer.data.en).toBeDefined();
      expect(contextualizer.data.es).toBeDefined();
      expect(contextualizer.contextualize("locale_Username")).toEqual("Username:");
    });

    it("should use the default locale if none are specified", function() {
      var defaultApp = new Contextualizer();
      expect(defaultApp.currentLocale).toEqual({
        iso: "en"
      });
    });

    it("should use the user specified locale", function() {
      var appWithFrenchPrefered = new Contextualizer();
      appWithFrenchPrefered.addMessagesToContextualizedStrings("ka", {
        "locale_practice": {
          "message": "პრაკთიკა"
        }
      });
      expect(appWithFrenchPrefered.data.length).toEqual();
      appWithFrenchPrefered.currentLocale = {
        iso: "fr",
        name: "French"
      };
      expect(appWithFrenchPrefered.currentLocale).toEqual({
        iso: "fr",
        name: "French"
      });
    });

    it("should remember the user specified locale", function() {
      var userChoseFrenchLocale = new Contextualizer();
      userChoseFrenchLocale.currentLocale = {
        iso: "fr",
        name: "French"
      };
      userChoseFrenchLocale.userOverridenLocalePreference = userChoseFrenchLocale.currentLocale;
      expect(userChoseFrenchLocale.currentLocale).toEqual({
        iso: "fr",
        name: "French"
      });

      // var nextLoadOfLocale = new Contextualizer();
      // expect(nextLoadOfLocale.currentLocale).toEqual({
      //   iso: "en"
      // });
      // nextLoadOfLocale.currentLocale = nextLoadOfLocale.userOverridenLocalePreference;
      expect(userChoseFrenchLocale.currentLocale).toEqual({
        iso: "fr",
        name: "French"
      });

    });
  });



  describe("localizing", function() {
    var contextualizer;
    beforeEach(function() {
      contextualizer = new Contextualizer({});
      contextualizer.addMessagesToContextualizedStrings("ka", {
        "locale_practice": {
          "message": "პრაკთიკა"
        }
      });
      contextualizer.addMessagesToContextualizedStrings("en", {
        "locale_practice": {
          "message": "Practice"
        }
      });
    });

    it("should localize strings using the current locale", function() {
      expect(contextualizer.localize("locale_practice")).toEqual("Practice");
    });
    it("should contextualize strings using the current locale", function() {
      expect(contextualizer.contextualize("locale_practice")).toEqual("Practice");
    });
    it("should localize strings using a specific local", function() {
      expect(contextualizer.localize("locale_practice", "ka")).toEqual("პრაკთიკა");
    });
    it("should contextualize strings using a specific local", function() {
      expect(contextualizer.contextualize("locale_practice", "ka")).toEqual("პრაკთიკა");
    });
    it("should localize strings using a specific local", function() {
      expect(contextualizer.localize("locale_practice", {
        iso: "ka"
      })).toEqual("პრაკთიკა");
    });
    it("should contextualize strings using a specific local", function() {
      expect(contextualizer.contextualize("locale_practice", {
        iso: "ka"
      })).toEqual("პრაკთიკა");
    });
  });


  describe("elanguages", function() {
    it("should have a list of elanguages with their details", function() {
      var contextualizer = new Contextualizer({
        // debugMode: true
      });
      expect(contextualizer.elanguages).toBeDefined();
      expect(contextualizer.elanguages["fr"].iso).toEqual("fr");
      expect(contextualizer.elanguages["fr"].name).toEqual("French");
      expect(contextualizer.elanguages["fr"].nativeName).toEqual("français");
    });

    it("should be possible to set the locale with just a iso", function() {
      var oldAppOrBasicAppWithIsoCodesOnly = new Contextualizer();
      oldAppOrBasicAppWithIsoCodesOnly.currentLocale = "fr-QC";
      expect(oldAppOrBasicAppWithIsoCodesOnly.currentLocale).toEqual({
        iso: "fr-qc"
      });
      oldAppOrBasicAppWithIsoCodesOnly.currentLocale = "KA";
      expect(oldAppOrBasicAppWithIsoCodesOnly.currentLocale.iso).toEqual("ka");
      expect(oldAppOrBasicAppWithIsoCodesOnly.currentLocale.name).toEqual("Georgian");
      expect(oldAppOrBasicAppWithIsoCodesOnly.currentLocale.nativeName).toEqual("ქართული");
    });
  });

  describe("accept user contributions", function() {
    it("should be able to save the messages.json to a corpus if they were modified", function(done) {
      var contextualizer = new Contextualizer({
        dbname: "teammatiger-psycholingdash"
      });
      FieldDBObject.application = new FieldDBObject();
      FieldDBObject.application.corpus = {
        set: mockDatabase.set,
        dbname: "teammatiger-psycholingdash"
      };
      expect(contextualizer.application).toBeDefined();
      expect(contextualizer.application.corpus.dbname).toEqual("teammatiger-psycholingdash");
      expect(contextualizer.application.corpus.set).toEqual(mockDatabase.set);

      contextualizer.addMessagesToContextualizedStrings("en", {
        "locale_practice": {
          "message": "Practice"
        }
      });

      contextualizer.updateContextualization("locale_practice", "Practic-ification");

      expect(contextualizer.save).toBeDefined();
      // contextualizer.debugMode = true;
      contextualizer.save().then(function(results) {
          expect(results).not.toBe(contextualizer);
          contextualizer.debug(" save user contribution results", results);
          // expect(results[0]).toEqual(" ");
          // expect(results[0].stack).toEqual(" ");


          // expect(results[0]).toEqual(" ");
          expect(results[0].state).toEqual("fulfilled");
          expect(results[0].value.warnMessage).toBeUndefined();
          // expect(results[0].value.warnMessage).toContain("Item hasn't really changed, no need to save");
          expect(results[0].value.rev).toBeDefined();
          expect(results[0].value.rev.length).toBeGreaterThan(10);
        })
        .fail(function(error) {
          console.error(error.stack);
        })
        .then(done, done);
    }, specIsRunningTooLong);

    it("should be able to save the messages.json to a git repository", function(done) {
      var contextualizer = new Contextualizer();
      contextualizer.addMessagesToContextualizedStrings("en", {
        "locale_practice": {
          "message": "Practice"
        }
      });
      contextualizer.email = "lingllama@lingsync.org";
      contextualizer.save().then(function(results) {
          contextualizer.debug(results);
          expect(results[0].state).toEqual("fulfilled");
        })
        .fail(function(error) {
          console.error(error.stack);
        })
        .then(done, done);
    }, specIsRunningTooLong);
  });

  describe("adapt to the user's terminology", function() {
    var contextualizer;

    beforeEach(function() {
      contextualizer = new Contextualizer({
        alwaysConfirmOkay: true
      });
      contextualizer.addMessagesToContextualizedStrings("en", {
        "locale_practice": {
          "message": "Practice"
        },
        "locale_practice_description_for_child": {
          "message": "In this game, you will help the mouse eat all the cheese!"
        },
        "locale_practice_description_for_teacher": {
          "message": "This is a screening test for reading difficulties before children learn to read."
        },
        "locale_practice_instructions_for_child": {
          "message": "Choose the right picture to help the mouse eat the cheese."
        },
        "locale_practice_instructions_for_teacher": {
          "message": "The child should touch or point to the image corresponding to what they hear."
        }
      });
      contextualizer.addMessagesToContextualizedStrings("fr", {
        "locale_practice": {
          "message": "Practique"
        },
        "locale_gamified_practice": {
          "message": "On prepare!"
        },
        "locale_practice_description_for_child": {
          "message": "Pour ce jeu, tu devras écouter des sons pour aider la souris à manger tous les morceaux de fromage!"
        },
        "locale_practice_description_for_teacher": {
          "message": "Ce-ci est un test de dépistage visant à détecter les difficultés d'orthographe chez les enfants avant qu'ils apprennent à écrire."
        },
        "locale_practice_instructions_for_child": {
          "message": "Choisi la bonne image pour aider la souris à manger tous les morceaux de fromage."
        },
        "locale_practice_instructions_for_teacher": {
          "message": "L'enfant appuie sur le image qui correspond au prononciation entendu."
        }
      });
    });

    it("should localize strings", function() {
      expect(contextualizer.contextualize("locale_practice")).toEqual("Practice");
      contextualizer.currentLocale.iso = "fr";
      expect(contextualizer.contextualize("locale_practice")).toEqual("Practique");
    });


    it("should let caller specify locale per localize call", function() {
      expect(contextualizer.contextualize("locale_practice", "en")).toEqual("Practice");
      expect(contextualizer.contextualize("locale_practice", "fr")).toEqual("Practique");
    });

    it("should use the most available locale if none are specified", function() {
      var georgianApp = new Contextualizer();
      georgianApp.data = {};
      georgianApp.addMessagesToContextualizedStrings("ka", {
        "locale_practice": {
          "message": "პრაკთიკა"
        }
      });
      expect(georgianApp.data).toEqual({
        ka: {
          length: 1,
          locale_practice: {
            message: "პრაკთიკა"
          }
        }
      });
      expect(georgianApp.availableLanguages.length).toEqual(1);
      expect(georgianApp.currentLocale.nativeName).toEqual("ქართული");
    });

    it("should provide a list of available/supported locales ranked by their level of support", function() {
      var availableLanguages = contextualizer.availableLanguages;
      expect(availableLanguages.en.iso).toEqual("en");
      expect(availableLanguages.en.length).toEqual(5);
      expect(availableLanguages.en.percentageOfAvailability).toEqual(83);
      expect(availableLanguages.fr.iso).toEqual("fr");
      expect(availableLanguages.fr.length).toEqual(6);
      expect(availableLanguages.en.percentageOfAvailability).toEqual(Math.round(availableLanguages.en.length / availableLanguages.fr.length * 100));

      expect(availableLanguages._collection[0].length > availableLanguages._collection[1].length);
      expect(availableLanguages._collection[0].percentageOfAvailability < availableLanguages._collection[1].percentageOfAvailability);
    });

    it("should contextualize complex objects", function() {

      var datalist = {
        "label": "practice",
        "title": {
          "default": "locale_practice",
          "gamified_title": "locale_gamified_practice"
        },
        "description": {
          "default": "locale_practice_description_for_teacher",
          "for_child": "locale_practice_description_for_child",
          "for_parent": "locale_practice_description_for_parent",
          "for_experimentAdministrator": "locale_practice_description_for_teacher",
          "for_school_records": "locale_practice_description_for_school_record",
          "for_experimentAdministratorSpecialist": "locale_practice_description_for_slp"
        },
        "instructions": {
          "default": "locale_practice_instructions_for_teacher",
          "for_child": "locale_practice_instructions_for_child",
          "for_parent": "locale_practice_instructions_for_parent",
          "for_experimentAdministrator": "locale_practice_instructions_for_teacher",
          "for_school_records": "locale_practice_instructions_for_school_record",
          "for_experimentAdministratorSpecialist": "locale_practice_instructions_for_slp"
        }
      };

      expect(contextualizer.contextualize(datalist.title)).toEqual("Practice");
      expect(contextualizer.contextualize(datalist.description)).toEqual("This is a screening test for reading difficulties before children learn to read.");
      expect(contextualizer.contextualize(datalist.instructions)).toEqual("The child should touch or point to the image corresponding to what they hear.");

      contextualizer.currentContext = "child";
      expect(contextualizer.contextualize(datalist.title)).toEqual("Practice");
      expect(contextualizer.contextualize(datalist.description)).toEqual("In this game, you will help the mouse eat all the cheese!");
      expect(contextualizer.contextualize(datalist.instructions)).toEqual("Choose the right picture to help the mouse eat the cheese.");

      contextualizer.currentLocale.iso = "fr";
      // contextualizer.debugMode = true;
      expect(contextualizer.contextualize(datalist.title)).toEqual("On prepare!");
      expect(contextualizer.contextualize(datalist.description)).toEqual("Pour ce jeu, tu devras écouter des sons pour aider la souris à manger tous les morceaux de fromage!");
      expect(contextualizer.contextualize(datalist.instructions)).toEqual("Choisi la bonne image pour aider la souris à manger tous les morceaux de fromage.");

    });


    describe("transparent contextualizable objects", function() {
      var obj;
      beforeEach(function() {
        // contextualizer.debugMode = true;
        FieldDBObject.application = {
          contextualizer: contextualizer
        };
        obj = new ContextualizableObject({
          // contextualizer: contextualizer,
          "default": "locale_practice_description_for_teacher",
          "for_child": "locale_practice_description_for_child",
          "for_parent": "locale_practice_description_for_parent",
          "for_experimentAdministrator": "locale_practice_description_for_teacher",
          "for_school_records": "locale_practice_description_for_school_record",
          "for_experimentAdministratorSpecialist": "locale_practice_description_for_slp"
        });
      });

      it("should be able to turn objects in to contextualied objects where the strings are not strings but keys to the locales", function() {
        expect(obj).toBeDefined();
        expect(FieldDBObject.application.contextualizer).toBeDefined();
        expect(obj.contextualizer).toBeDefined();
        expect(obj.contextualizer).toBe(FieldDBObject.application.contextualizer);

        expect(obj._for_child).toEqual("locale_practice_description_for_child");
        expect(obj.contextualizer.contextualize("locale_practice_description_for_child")).toEqual("In this game, you will help the mouse eat all the cheese!");
      });

      it("should be able to use dot notation to get contextualization", function() {
        expect(obj.for_child).toEqual("In this game, you will help the mouse eat all the cheese!");
      });

      it("should be able to serialize back into the same object as it was when created", function() {
        expect(obj.toJSON().contextualizer).toBeUndefined();
        expect(obj.toJSON()._for_child).toBeUndefined();
        expect(obj.toJSON().default).toEqual("locale_practice_description_for_teacher");
        expect(obj.toJSON().for_child).toEqual("locale_practice_description_for_child");
        expect(obj.toJSON().for_parent).toEqual("locale_practice_description_for_parent");
        expect(obj.toJSON().for_experimentAdministrator).toEqual("locale_practice_description_for_teacher");
        expect(obj.toJSON().for_school_records).toEqual("locale_practice_description_for_school_record");
        expect(obj.toJSON().for_experimentAdministratorSpecialist).toEqual("locale_practice_description_for_slp");
      });

      it("should be able to modify localization using dot notation", function(done) {
        expect(obj.for_child).toEqual("In this game, you will help the mouse eat all the cheese!");
        obj.for_child = "In this game the mouse will eat all the cheese with your help.";
        setTimeout(function() {
          expect(obj.for_child).toEqual("In this game the mouse will eat all the cheese with your help.");
          expect(obj.contextualizer.contextualize("locale_practice_description_for_child")).toEqual("In this game the mouse will eat all the cheese with your help.");
          expect(obj.toJSON().for_child).toEqual("locale_practice_description_for_child");
          done();
        }, 10);
      }, specIsRunningTooLong);

      it("should be able to modify localization using dot notation asynchonously true case", function(done) {
        expect(obj.for_child).toEqual("In this game, you will help the mouse eat all the cheese!");
        expect(contextualizer.alwaysConfirmOkay).toBeTruthy();
        contextualizer.testingAsyncConfirm = true;
        obj.for_child = "In this game the mouse will eat all the cheese with your help.";

        setTimeout(function() {
          expect(obj.for_child).toEqual("In this game the mouse will eat all the cheese with your help.");
          expect(obj.contextualizer.contextualize("locale_practice_description_for_child")).toEqual("In this game the mouse will eat all the cheese with your help.");
          expect(obj.toJSON().for_child).toEqual("locale_practice_description_for_child");
          done();
        }, 100);

        expect(obj.for_child).toEqual("In this game, you will help the mouse eat all the cheese!");
      }, specIsRunningTooLong);

      xit("should be able to modify localization using dot notation asynchonously false case", function(done) {
        expect(obj.for_child).toEqual("In this game, you will help the mouse eat all the cheese!");
        contextualizer.alwaysConfirmOkay = undefined;
        expect(contextualizer.alwaysConfirmOkay).toBeFalsy();
        obj.for_child = "In this game the mouse will eat all the cheese with your help.";

        setTimeout(function() {
          expect(obj.for_child).toEqual("In this game the mouse will eat all the cheese with your help.");
          expect(obj.contextualizer.contextualize("locale_practice_description_for_child")).toEqual("In this game the mouse will eat all the cheese with your help.");
          expect(obj.toJSON().for_child).toEqual("locale_practice_description_for_child");
          done();
        }, 10);

        expect(obj.for_child).toEqual("In this game, you will help the mouse eat all the cheese!");
      }, specIsRunningTooLong);


      it("should not break if its only 1 string", function() {
        ContextualizableObject.compatibleWithSimpleStrings = true;

        expect("preventing this in FieldDBObject's initialization").toEqual("preventing this in FieldDBObject's initialization");
        // console.log("ContextualizableObject.constructor",  ContextualizableObject.constructor);
        // console.log("ContextualizableObject.constructor.fieldDBtype",  ContextualizableObject.constructor.fieldDBtype);
        var DataListMock = function DataListMock(options) {
          this.debug("In DataListMock ", options);
          FieldDBObject.apply(this, arguments);
        };

        DataListMock.prototype = Object.create(FieldDBObject.prototype, /** @lends Child.prototype */ {
          constructor: {
            value: DataListMock
          },
          INTERNAL_MODELS: {
            value: {
              title: ContextualizableObject,
              description: ContextualizableObject
            }
          }
        });

        // no INTERNAL_MODELS set as ContextualizableObject
        var containingObject = new FieldDBObject({
          title: "Import data",
          // debugMode: true
        });
        expect(containingObject.title).toEqual("Import data");
        expect(containingObject.toJSON().title).toEqual("Import data");
        expect(containingObject.title.toString()).toEqual("Import data");
        expect(containingObject.title.data).toBeUndefined();
        expect(containingObject.title.toJSON).toBeUndefined();

        // with INTERNAL_MODELS set as ContextualizableObject
        containingObject = new DataListMock({
          title: "Import data",
          // debugMode: true
        });
        expect(containingObject.title).toEqual("Import data");
        expect(containingObject.toJSON().title).toEqual("Import data");
        expect(containingObject.title.toString()).toEqual("Import data");
        expect(containingObject.title.data).toBeUndefined();
        expect(containingObject.title.toJSON).toBeUndefined();
      });

      it("should update a string to the default of a contextualizable object if compatibleWithSimpleStrings is true", function(done) {
        ContextualizableObject.compatibleWithSimpleStrings = false;
        var onlyAString = new ContextualizableObject("Import datalist");
        expect(onlyAString.data).toEqual({
          locale_Import_datalist: {
            message: "Import datalist"
          },
          default: {
            message: "locale_Import_datalist"
          }
        });
        expect(contextualizer.alwaysConfirmOkay).toBeTruthy();

        setTimeout(function() {
          expect(contextualizer.data.en.locale_Import_datalist).toBeDefined();
          expect(contextualizer.data.en.locale_Import_datalist.message).toEqual("Import datalist");
          expect(onlyAString.originalString).toEqual("Import datalist");
          expect(onlyAString.default).toEqual("Import datalist");
          onlyAString.default = "Imported datalist";

          setTimeout(function() {
            expect(onlyAString.default).toEqual("Imported datalist");
            expect(contextualizer.contextualize("locale_Import_datalist")).toEqual("Imported datalist");
            expect(contextualizer.data.en.locale_Import_datalist.message).toEqual("Imported datalist");

            expect(ContextualizableObject.compatibleWithSimpleStrings).toEqual(false);
            expect(onlyAString.toJSON()).toEqual("Imported datalist");
            ContextualizableObject.compatibleWithSimpleStrings = true;
            expect(onlyAString.toJSON()).toEqual({
              default: "locale_Import_datalist",
              locale_Import_datalist: "Imported datalist"
            });

            var contextualizedObjectFromASerializedContextualizedObjectWhichWasAString = new ContextualizableObject(onlyAString.toJSON());
            expect(contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.originalString).toBeUndefined();
            expect(contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.default).toEqual("Imported datalist");
            contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.default = "Imported again datalist";

            setTimeout(function() {
              expect(contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.default).toEqual("Imported again datalist");
              expect(contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.toJSON()).toEqual({
                default: "locale_Import_datalist",
                locale_Import_datalist: "Imported again datalist"
              });
              done();
            }, 100);

          }, 100);
        }, 100);



      }, specIsRunningTooLong);

    });

  });

  describe("backward compatability", function() {

    it("should accept an object", function() {
      ContextualizableObject.compatibleWithSimpleStrings = true;
      var obj = new ContextualizableObject({
        default: "An old data list"
      });

      expect(obj.default).toEqual("An old data list");
      expect(obj.warnMessage).toBeUndefined();
    });

    /**
     * Use this to undo/detect the new String() constructor

     // http://stackoverflow.com/questions/1978049/what-values-can-a-constructor-return-to-avoid-returning-this
     if (!(value instanceof this.INTERNAL_MODELS[propertyname])) {
       this.warn(" This item was supposed to be " + this.INTERNAL_MODELS[propertyname] + "  but was returned by the constructor as a string.");
       value = value.toString();
     }

     *
     */
    it("should return a String", function() {
      ContextualizableObject.compatibleWithSimpleStrings = true;
      expect(ContextualizableObject.compatibleWithSimpleStrings).toBeTruthy();
      var obj = {
        title: new ContextualizableObject("An old data list")
      };

      // It will pass == tests
      expect(obj.title).toEqual("An old data list");
      /* jshint ignore:start  */
      expect(obj.title == "An old data list").toEqual(true);
      /* jshint ignore:end  */

      // It wont pass === tests
      expect("An old data list" === "An old data list").toEqual(true);
      expect("An old data list").toBe("An old data list");
      expect(obj.title).not.toBe("An old data list");

      // It will actually be an object array of characters
      expect(obj.title).toEqual({
        0: "A",
        1: "n",
        2: " ",
        3: "o",
        4: "l",
        5: "d",
        6: " ",
        7: "d",
        8: "a",
        9: "t",
        10: "a",
        11: " ",
        12: "l",
        13: "i",
        14: "s",
        15: "t"
      });

      // They are equivalent if concatinated.
      expect(obj.title.toString()).toBe("An old data list");
      expect(obj.title + "").toBe("An old data list");

      // They are equivalent if stringified.
      expect(JSON.stringify({
        title: "An old data list"
      })).toBe("{\"title\":\"An old data list\"}");

      expect(JSON.stringify(obj)).toBe("{\"title\":\"An old data list\"}");
    });

    /**
     *
     * if using the throw strategie use this in the FieldDBObject ensureSetViaAppropriateType method

      try {
          value = new this.INTERNAL_MODELS[propertyname](value);
        } catch (constructorRejectedValue) {
          if (value === constructorRejectedValue) {
            value = constructorRejectedValue;
          } else {
            this.warn("There was an error setting the " + propertyname + " on this object " + this._id, constructorRejectedValue);
          }
        }

     *
     */
    xit("should thow a string", function() {
      ContextualizableObject.compatibleWithSimpleStrings = true;
      expect(ContextualizableObject.compatibleWithSimpleStrings).toBeTruthy();
      var obj;
      try {
        obj = new ContextualizableObject("An old data list");
      } catch (constructorRejectedValue) {
        obj = constructorRejectedValue;
      }
      expect(obj.toString()).toEqual("An old data list");
      expect(obj).toEqual("An old data list");
    });
  });
});
