var Contextualizer = require('./../../api/locales/Contextualizer').Contextualizer;

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
  });

  describe("psycholinguistics", function() {
    var contextualizer;

    beforeEach(function() {
      contextualizer = new Contextualizer();
      contextualizer.addMessagesToContextualizedStrings({
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
      }, "en");
      contextualizer.addMessagesToContextualizedStrings({
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
      }, "fr");
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
  });
});
