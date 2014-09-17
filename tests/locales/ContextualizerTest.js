var Contextualizer = require('./../../api/locales/Contextualizer').Contextualizer;
var ContextualizableObject = require('./../../api/locales/ContextualizableObject').ContextualizableObject;
var specIsRunningTooLong = 5000;

describe("Contextualizer", function() {
  describe("construction", function() {

    it("should load the Contextualizer", function() {
      expect(Contextualizer).toBeDefined();
    });

    it("should load the Contextualizer", function() {
      var contextualizer = new Contextualizer();
      expect(contextualizer).toBeDefined();
      expect(contextualizer.defaultLocale).toEqual("en");
      expect(contextualizer.currentLocale).toEqual("en");
      expect(contextualizer.currentContext).toEqual("default");
    });

    it("should load the default locales ", function() {
      var contextualizer = new Contextualizer();
      expect(contextualizer).toBeDefined();
      contextualizer.loadDefaults();
      expect(contextualizer.contextualize("locale_Username")).toEqual("Username:");
    });
  });

  describe("accept user contributions", function() {
    it("should be able to save the messages.json to a corpus", function(done) {
      var contextualizer = new Contextualizer();
      contextualizer.addMessagesToContextualizedStrings("en", {
        "localized_practice": {
          "message": "Practice"
        }
      });
      expect(contextualizer.save).toBeDefined();
      contextualizer.save().then(function(results) {
        contextualizer.debug(results);
        expect(results[0].state).toEqual("rejected");
        expect(results[1].state).toEqual("rejected");
      })
        .then(done, done);
    }, specIsRunningTooLong);

    it("should be able to save the messages.json to a git repository", function(done) {
      var contextualizer = new Contextualizer();
      contextualizer.email = "lingllama@lingsync.org";
      contextualizer.save().then(function(results) {
        contextualizer.debug(results);
        expect(results[0].state).toEqual("fulfilled");
        expect(results[1].state).toEqual("fulfilled");
      })
        .then(done, done);
    }, specIsRunningTooLong);
  });

  describe("adapt to the user's terminology", function() {
    var contextualizer;

    beforeEach(function() {
      contextualizer = new Contextualizer();
      contextualizer.addMessagesToContextualizedStrings("en", {
        "localized_practice": {
          "message": "Practice"
        },
        "localized_practice_description_for_child": {
          "message": "In this game, you will help the mouse eat all the cheese!"
        },
        "localized_practice_description_for_teacher": {
          "message": "This is a screening test for reading difficulties before children learn to read."
        },
        "localized_practice_instructions_for_child": {
          "message": "Choose the right picture to help the mouse eat the cheese."
        },
        "localized_practice_instructions_for_teacher": {
          "message": "The child should touch or point to the image corresponding to what they hear."
        }
      });
      contextualizer.addMessagesToContextualizedStrings("fr", {
        "localized_practice": {
          "message": "Practique"
        },
        "localized_gamified_practice": {
          "message": "On prepare!"
        },
        "localized_practice_description_for_child": {
          "message": "Pour ce jeu, tu devras écouter des sons pour aider la souris à manger tous les morceaux de fromage!"
        },
        "localized_practice_description_for_teacher": {
          "message": "Ce-ci est un test de dépistage visant à détecter les difficultés d'orthographe chez les enfants avant qu'ils apprennent à écrire."
        },
        "localized_practice_instructions_for_child": {
          "message": "Choisi la bonne image pour aider la souris à manger tous les morceaux de fromage."
        },
        "localized_practice_instructions_for_teacher": {
          "message": "L'enfant appuie sur le image qui correspond au prononciation entendu."
        }
      });
    });

    it("should localize strings", function() {

      expect(contextualizer.contextualize("localized_practice")).toEqual("Practice");
      contextualizer.currentLocale = "fr";
      expect(contextualizer.contextualize("localized_practice")).toEqual("Practique");
    });

    it("should contextualize complex objects", function() {

      var datalist = {
        "label": "practice",
        "title": {
          "default": "localized_practice",
          "gamified_title": "localized_gamified_practice"
        },
        "description": {
          "default": "localized_practice_description_for_teacher",
          "for_child": "localized_practice_description_for_child",
          "for_parent": "localized_practice_description_for_parent",
          "for_experimentAdministrator": "localized_practice_description_for_teacher",
          "for_school_records": "localized_practice_description_for_school_record",
          "for_experimentAdministratorSpecialist": "localized_practice_description_for_slp"
        },
        "instructions": {
          "default": "localized_practice_instructions_for_teacher",
          "for_child": "localized_practice_instructions_for_child",
          "for_parent": "localized_practice_instructions_for_parent",
          "for_experimentAdministrator": "localized_practice_instructions_for_teacher",
          "for_school_records": "localized_practice_instructions_for_school_record",
          "for_experimentAdministratorSpecialist": "localized_practice_instructions_for_slp"
        }
      };

      expect(contextualizer.contextualize(datalist.title)).toEqual("Practice");
      expect(contextualizer.contextualize(datalist.description)).toEqual("This is a screening test for reading difficulties before children learn to read.");
      expect(contextualizer.contextualize(datalist.instructions)).toEqual("The child should touch or point to the image corresponding to what they hear.");

      contextualizer.currentContext = "child";
      expect(contextualizer.contextualize(datalist.title)).toEqual("Practice");
      expect(contextualizer.contextualize(datalist.description)).toEqual("In this game, you will help the mouse eat all the cheese!");
      expect(contextualizer.contextualize(datalist.instructions)).toEqual("Choose the right picture to help the mouse eat the cheese.");

      contextualizer.currentLocale = "fr";
      // contextualizer.debugMode = true;
      expect(contextualizer.contextualize(datalist.title)).toEqual("On prepare!");
      expect(contextualizer.contextualize(datalist.description)).toEqual("Pour ce jeu, tu devras écouter des sons pour aider la souris à manger tous les morceaux de fromage!");
      expect(contextualizer.contextualize(datalist.instructions)).toEqual("Choisi la bonne image pour aider la souris à manger tous les morceaux de fromage.");

    });


    describe("transparent contextualizable objects", function() {
      var obj;
      beforeEach(function() {
        // contextualizer.debugMode = true;
        obj = new ContextualizableObject({
          contextualizer: contextualizer,
          "default": "localized_practice_description_for_teacher",
          "for_child": "localized_practice_description_for_child",
          "for_parent": "localized_practice_description_for_parent",
          "for_experimentAdministrator": "localized_practice_description_for_teacher",
          "for_school_records": "localized_practice_description_for_school_record",
          "for_experimentAdministratorSpecialist": "localized_practice_description_for_slp"
        });
      });

      it("should be able to turn objects in to contextualied objects where the strings are not strings but keys to the locales", function() {
        expect(obj).toBeDefined();
        expect(obj._for_child).toEqual('localized_practice_description_for_child');
        expect(obj.contextualizer.contextualize('localized_practice_description_for_child')).toEqual('In this game, you will help the mouse eat all the cheese!');
      });

      it("should be able to use dot notation to get contextualization", function() {
        expect(obj.for_child).toEqual('In this game, you will help the mouse eat all the cheese!');
      });

      it("should be able to serialize back into the same object as it was when created", function() {
        expect(obj.toJSON().contextualizer).toBeUndefined();
        expect(obj.toJSON()._for_child).toBeUndefined();
        expect(obj.toJSON().default).toEqual("localized_practice_description_for_teacher");
        expect(obj.toJSON().for_child).toEqual("localized_practice_description_for_child");
        expect(obj.toJSON().for_parent).toEqual("localized_practice_description_for_parent");
        expect(obj.toJSON().for_experimentAdministrator).toEqual("localized_practice_description_for_teacher");
        expect(obj.toJSON().for_school_records).toEqual("localized_practice_description_for_school_record");
        expect(obj.toJSON().for_experimentAdministratorSpecialist).toEqual("localized_practice_description_for_slp");
      });

      it("should be able to modify localization using dot notation", function() {
        expect(obj.for_child).toEqual('In this game, you will help the mouse eat all the cheese!');
        obj.for_child = "In this game the mouse will eat all the cheese with your help."
        expect(obj.for_child).toEqual("In this game the mouse will eat all the cheese with your help.");
        expect(obj.contextualizer.contextualize('localized_practice_description_for_child')).toEqual("In this game the mouse will eat all the cheese with your help.");
        expect(obj.toJSON().for_child).toEqual("localized_practice_description_for_child");
      });


      it("should not break if its only 1 string", function() {
        var onlyAString = new ContextualizableObject("Import data");
        expect("preventing this in FieldDBObject's initialization").toEqual("preventing this in FieldDBObject's initialization");
        // expect(onlyAString).toEqual("Import data");
        // expect(onlyAString.toString()).toEqual("Import data");
        // expect(onlyAString.data).toBeUndefined();
        // expect(onlyAString.toJSON()).toBeUndefined();
      });


      it("should update a string to the default of a contextualizable object if updateAllToContextualizableObjects is true", function() {
        ContextualizableObject.updateAllToContextualizableObjects = true;
        var onlyAString = new ContextualizableObject("Import data");
        expect(onlyAString.data).toEqual({
          locale_Import_data: {
            message: 'Import data'
          }
        });
        expect(onlyAString.originalString).toEqual("Import data");
        expect(onlyAString.default).toEqual("Import data");
        onlyAString.default = "Imported data";
        expect(onlyAString.default).toEqual("Imported data");
        expect(onlyAString.toJSON()).toEqual("Imported data");
        ContextualizableObject.updateAllToContextualizableObjects = false;
        expect(onlyAString.toJSON()).toEqual({
          default: 'locale_Import_data',
          locale_Import_data: 'Imported data'
        });

        var contextualizedObjectFromASerializedContextualizedObjectWhichWasAString = new ContextualizableObject(onlyAString.toJSON());
        expect(contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.originalString).toBeUndefined();
        expect(contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.default).toEqual("Imported data");
        contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.default = "Imported again data";
        expect(contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.default).toEqual("Imported again data");
        expect(contextualizedObjectFromASerializedContextualizedObjectWhichWasAString.toJSON()).toEqual({
          default: 'locale_Import_data',
          locale_Import_data: 'Imported again data'
        });

      });

    });

  });
});
