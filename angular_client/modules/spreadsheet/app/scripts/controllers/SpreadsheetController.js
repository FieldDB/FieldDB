/* globals  FieldDB, Q, sjcl, SpreadsheetDatum, _, confirm, alert, prompt */
'use strict';
console.log("Declaring Loading the SpreadsheetStyleDataEntryController.");

/**
 * @ngdoc function
 * @name spreadsheetApp.controller:SpreadsheetStyleDataEntryController
 * @description
 * # SpreadsheetStyleDataEntryController
 * Controller of the spreadsheetApp
 */

var SpreadsheetStyleDataEntryController = function($scope, $rootScope, $resource, $filter, $document, Data, Servers, md5, $timeout, $modal, $log, $http) {
  console.log(" Loading the SpreadsheetStyleDataEntryController.");
  var debugging = false;
  if (debugging) {
    console.log($scope, $rootScope, $resource, $filter, $document, Data, Servers, md5, $timeout, $modal, $log, $http);
  }

  var reRouteUser = function(nextRoute) {
    if (window.location.hash.indexOf(nextRoute) === window.location.hash.length - nextRoute.length) {
      return;
    }
    window.location.assign("#/" + nextRoute);

    // try {
    //   if (!$scope.$$phase) {
    //     $scope.$apply(function() {
    //       console.log("  Re-routing the user to the " + nextRoute + " page");
    //       //http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
    //       $location.path("/" + nextRoute, false);
    //     });
    //   }
    // } catch (e) {
    //   console.warn("reRouteUser generated an erorr", e);
    // }

  };

  $rootScope.fullTemplateDefaultNumberOfFieldsPerColumn = null;

  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && $rootScope.contextualize) {
    if ($rootScope.contextualize("locale_faq") === "FAQ") {
      console.log("Locales already loaded.");
    } else {
      FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("ka", {
        "locale_settings": {
          "message": "პარამეტრები"
        }
      });

      $http.get("locales/en/messages.json").then(function(result) {
        var locales = result.data;
        console.log("Retrieving english localization", locales);
        FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("en", locales);
        /* jshint camelcase: false */
        // $rootScope.locales.locale_settings = $rootScope.contextualize("locale_settings");
      });
      $http.get("locales/es/messages.json").then(function(result) {
        var locales = result.data;
        console.log("Retrieving spanish localization", locales);
        FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("es", locales);
        /* jshint camelcase: false */
        // $rootScope.locales.locale_settings = $rootScope.contextualize("locale_settings");
      });
      $http.get("locales/fr/messages.json").then(function(result) {
        var locales = result.data;
        console.log("Retrieving french localization", locales);
        FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("fr", locales);
        /* jshint camelcase: false */
        // $rootScope.locales.locale_settings = $rootScope.contextualize("locale_settings");
      });
    }
  }

  if (FieldDB && FieldDB.FieldDBObject) {
    FieldDB.FieldDBObject.bug = function(message) {
      if ($rootScope.openNotification) {
        $rootScope.notificationMessage = message;
        $rootScope.openNotification();
      } else {
        alert(message);
      }
    };
  }

  $rootScope.appVersion = "2.47.19.18.21ss";

  // Functions to open/close generic notification modal
  $rootScope.openNotification = function(size, showForgotPasswordInstructions) {
    if (showForgotPasswordInstructions) {
      $rootScope.showForgotPasswordInstructions = showForgotPasswordInstructions;
    } else {
      $rootScope.showForgotPasswordInstructions = false;
    }
    var modalInstance = $modal.open({
      templateUrl: 'views/notification-modal.html',
      controller: 'SpreadsheetNotificationController',
      size: size,
      resolve: {
        details: function() {
          return {};
        }
      }
    });

    modalInstance.result.then(function(any, stuff) {
      if (any || stuff) {
        console.warn("Some parameters were passed by the modal closing, ", any, stuff);
      }
    }, function() {
      $log.info('Export Modal dismissed at: ' + new Date());
    });
  };

  // Functions to open/close welcome notification modal
  $rootScope.openWelcomeNotificationDeprecated = function() {
    // $scope.welcomeNotificationShouldBeOpen = false; //never show this damn modal.
    reRouteUser("corpora_list");
  };

  document.addEventListener("notauthenticated", function() {
    $scope.application.warn("user isn't able to see anything, show them the welcome page");
    $rootScope.authenticated = false;
    $rootScope.openWelcomeNotificationDeprecated();
  }, false);

  // TEST FOR CHROME BROWSER
  var isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if (!isChrome) {
    $scope.notChrome = window.navigator.userAgent;
  }

  $scope.useAutoGlosser = true;
  try {
    var previousValue = localStorage.getItem("useAutoGlosser");
    if (previousValue === "false") {
      $scope.useAutoGlosser = false;
    }
  } catch (e) {
    console.log("Use autoglosser was not previously set.");
  }


  $scope.$watch('useAutoGlosser', function(newValue, oldValue) {
    console.log("useAutoGlosser", oldValue);
    localStorage.setItem("useAutoGlosser", newValue);
  });

  /*
   * Create an array of servers which the user may use
   */
  $rootScope.servers = Servers.getAvailable();
  $rootScope.selectedServer = $rootScope.servers[0];
  $rootScope.serverCode = $rootScope.selectedServer.serverCode;


  // Set/get/update user preferences
  var defaultPreferences = {
    "userChosenTemplateId": "fulltemplate",
    "resultSize": 10,
    "version": $rootScope.appVersion,
    "savedState": {
      "server": "",
      "username": "",
      "password": "",
      "DB": "",
      "sessionID": ""
    },
    "availableFields": {
      "judgement": {
        "label": "judgement",
        "title": "Grammaticality Judgement",
        "hint": "Grammaticality/acceptability judgement (*,#,?,1-3 etc). Leaving it blank usually means grammatical/acceptable, or your team can choose any symbol for this meaning."
      },
      "utterance": {
        "label": "utterance",
        "title": "Utterance",
        "hint": "Unparsed utterance in the language, in orthography or transcription. Line 1 in your LaTeXed examples for handouts. Sample entry: amigas"
      },
      "morphemes": {
        "label": "morphemes",
        "title": "Morphemes",
        "hint": "Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s"
      },
      "gloss": {
        "label": "gloss",
        "title": "Gloss",
        "hint": "Metalanguage glosses of each individual morpheme (above). Used by the system to help gloss, in combination with morphemes (above). It is Line 2 in your LaTeXed examples. We recommend Leipzig conventions (. for fusional morphemes, - for morpheme boundaries etc)  Sample entry: friend-fem-pl"
      },
      "translation": {
        "label": "translation",
        "title": "Translation",
        "hint": "The team's primary translation. It might not be English, just a language the team is comfortable with (in which case you should change the lable to the language you are using). There may also be additional translations in the other fields."
      },
      // "comments": {
      //   "label": "comments",
      //   "title": "Comments"
      // },
      "refs": {
        "label": "refs",
        "title": "References"
      },
      "goal": {
        "label": "goal",
        "title": "Goal"
      },
      "consultants": {
        "label": "consultants",
        "title": "Consultants"
      },
      "dialect": {
        "label": "dialect",
        "title": "Dialect"
      },
      "language": {
        "label": "language",
        "title": "language"
      },
      // "dateElicited": {
      //   "label": "dateElicited",
      //   "title": "Date Elicited"
      // },
      // "user": {
      //   "label": "user",
      //   "title": "User"
      // },
      // "dateSEntered": {
      //   "label": "dateSEntered",
      //   "title": "Date entered"
      // },
      "tags": {
        "label": "tags",
        "title": "Tags"
      },
      "validationStatus": {
        "label": "validationStatus",
        "title": "validationStatus"
      },
      "syntacticCategory": {
        "label": "syntacticCategory",
        "title": "syntacticCategory",
        "hint": "This optional field is used by the machine to help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of syntactic category tagging you wish. It could be very theoretical like Distributed Morphology (Sample entry: √-GEN-NUM), or very a-theroretical like the Penn Tree Bank Tag Set. (Sample entry: NNS) http://www.ims.uni-stuttgart.de/projekte/CorpusWorkbench/CQP-HTMLDemo/PennTreebankTS.html"
      },
      "allomorphs": {
        "label": "allomorphs",
        "title": "Allomorphs"
      },
      "phonetic": {
        "label": "phonetic",
        "title": "Phonetic"
      },
      "housekeeping": {
        "label": "housekeeping",
        "title": "Housekeeping"
      },
      "spanish": {
        "label": "spanish",
        "title": "Spanish"
      },
      "orthography": {
        "label": "orthography",
        "title": "Orthography",
        "hint": "Many teams will only use the utterance line. However if your team needs to distinguish between utterance and orthography this is the unparsed word/sentence/dialog/paragraph/document in the language, in its native orthography which speakers can read. If there are more than one orthography an additional orthography field can be added to the corpus. This is Line 0 in your LaTeXed examples for handouts (if you distinguish the orthography from the utterance line and you choose to display the orthography for your language consultants and/or native speaker linguists). Sample entry: amigas"
      }
    },
    "compacttemplate": {
      "field1": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field2": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field3": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field4": {
        "label": "translation",
        "title": "Translation"
      }
    },
    "fulltemplate": {
      "field1": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field2": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field3": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field4": {
        "label": "translation",
        "title": "Translation"
      },
      "field5": {
        "label": "validationStatus",
        "title": "Status"
      },
      "field6": {
        "label": "tags",
        "title": "Tags"
      }
    },
    "mcgillfieldmethodsspring2014template": {
      "field1": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field2": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field3": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field4": {
        "label": "translation",
        "title": "Translation"
      },
      "field5": {
        "label": "judgement",
        "title": "Grammaticality Judgement"
      },
      "field6": {
        "label": "tags",
        "title": "Tags"
      }
    },
    "mcgillfieldmethodsfall2014template": {
      "field1": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field2": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field3": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field4": {
        "label": "translation",
        "title": "Translation"
      },
      "field5": {
        "label": "phonetic",
        "title": "IPA"
      },
      "field6": {
        "label": "notes",
        "title": "Notes"
      }
    },
    "yalefieldmethodsspring2014template": {
      "field1": {
        "label": "orthography",
        "title": "Orthography"
      },
      "field2": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field3": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field4": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field5": {
        "label": "translation",
        "title": "Translation"
      },
      "field6": {
        "label": "spanish",
        "title": "Spanish"
      },
      "field7": {
        "label": "housekeeping",
        "title": "Housekeeping"
      },
      "field8": {
        "label": "tags",
        "title": "Tags"
      }
    }
  };

  //TODO move the default preferences somewher the SettingsController can access them. for now here is a hack for #1290
  window.defaultPreferences = defaultPreferences;


  $rootScope.getAvailableFieldsInColumns = function() {
    if (!$rootScope.corpus || !$rootScope.corpus.datumFields || !$rootScope.corpus.datumFields._collection || $rootScope.corpus.datumFields._collection.length < 1) {
      console.warn("the corpus isnt ready, not configuring the available fields in columns.");
      return {};
    }
    var fields = $rootScope.corpus.datumFields._collection;
    var numberOfColumns;

    if (!numberOfColumns) {
      numberOfColumns = $rootScope.fullTemplateDefaultNumberOfColumns || 2;
    }
    numberOfColumns = parseInt(numberOfColumns, 10);


    try {
      $scope.judgementHelpText = $rootScope.corpus.datumFields.judgement.help;
    } catch (e) {
      console.warn("couldnt get the judgemetn help text for htis corpus for hte data entry hints");
    }
    var columnHeight = $rootScope.fullTemplateDefaultNumberOfFieldsPerColumn;
    if ($rootScope.corpus && $rootScope.corpus.prefs && $rootScope.corpus.prefs.fullTemplateDefaultNumberOfFieldsPerColumn) {
      columnHeight = $rootScope.corpus.prefs.fullTemplateDefaultNumberOfFieldsPerColumn;
    }
    if (columnHeight > fields.length - 1) {
      columnHeight = columnHeight || Math.ceil(fields.length / numberOfColumns);
    }
    if ($rootScope.corpus.datumFields.indexOf("syntacticTreeLatex") < 6) {
      $rootScope.corpus.upgradeCorpusFieldsToMatchDatumTemplate("fulltemplate");
    }

    var columns = {};

    if (numberOfColumns === 1) {
      columns.first = fields.slice(1, columnHeight + 1);
      columns.second = [];
      columns.third = [];
      $scope.fieldSpanWidthClassName = "span10";
      $scope.columnWidthClass = "span10";
    } else if (numberOfColumns === 2) {
      columns.first = fields.slice(1, columnHeight + 1);
      columns.second = fields.slice(columnHeight + 1, columnHeight * 2 + 1);
      columns.third = [];
      $scope.fieldSpanWidthClassName = "span5";
      $scope.columnWidthClass = "span5";
    } else if (numberOfColumns === 3) {
      columns.first = fields.slice(1, columnHeight + 1);
      columns.second = fields.slice(columnHeight + 1, columnHeight * 2 + 1);
      columns.third = fields.slice(columnHeight * 2 + 1, columnHeight * 3 + 1);
      $scope.fieldSpanWidthClassName = "span3";
      $scope.columnWidthClass = "span3";
    }
    return columns;
  };

  $rootScope.overrideTemplateSetting = function(templateId, newFieldPreferences, notUserInitited) {
    $rootScope.templateId = "fulltemplate"; // templateId;
    if ($rootScope.templateId !== templateId) {
      console.warn("Not using users prefered template " + templateId);
    }
    // $rootScope.fields = newFieldPreferences; //TODO doesnt seem right...
    $rootScope.fieldsInColumns = $rootScope.getAvailableFieldsInColumns();

    console.log("notUserInitited", notUserInitited);
    try {
      if (!$scope.$$phase) {
        $scope.$digest(); //$digest or $apply
      }
    } catch (e) {
      console.warn(e);
    }
  };

  $rootScope.setAsDefaultCorpusTemplate = function(templateId) {
    console.log(templateId);
    if (!$rootScope.admin) {
      $scope.application.bug("You're not an admin on this corpus, please ask an admin to set this template as default for you.");
      return;
    }
    if ($rootScope.corpus.description) {
      $rootScope.corpus.preferredTemplate = templateId;
      Data.saveCouchDoc($rootScope.corpus.pouchname, $rootScope.corpus)
        .then(function(result) {
          console.log("Saved corpus template preferences ", result);
        }, function(reason) {
          console.log("Error saving corpus template.", reason);
          $scope.application.bug("Error saving corpus template.");
        });
    } else {
      $scope.application.bug("The corpus doc was never fetched. So I cant save the preferences... Please report this if you think you should be able to save the preferences.");
    }
  };

  $rootScope.mcgillOnly = false;
  if (window.location.origin.indexOf("mcgill") > -1) {
    $rootScope.mcgillOnly = true;
  }
  var overwiteAndUpdatePreferencesToCurrentVersion = function() {

    var existingPreferences = localStorage.getItem('SpreadsheetPreferences');
    if (!existingPreferences) {
      console.log("No preferences. Setting default preferences in localStorage.");
      // localStorage.clear(); //why?? left over from debugging?
      localStorage.setItem('SpreadsheetPreferences', JSON.stringify(defaultPreferences));
      existingPreferences = JSON.stringify(defaultPreferences);
      // return defaultPreferences;
    }

    // console.log("Loaded Preferences from localStorage. TODO test this",JSON.stringify(existingPreferences));
    try {
      existingPreferences = JSON.parse(existingPreferences);
    } catch (e) {
      console.warn("cant set existingPreferences, might have already been an object", e);
    }

    /** Prior to 1.37 wipe personalization and use current defaults */
    if (!existingPreferences.version) {
      $scope.application.bug("Welcome to the Spring Field Methods session!\n\n We have introduced a new data entry template in this version. \nYou might want to review your settings to change the order and number of fields in the data entry template. Current defaults are set to 2 columns, with 3 rows each.");
      // localStorage.clear(); //why?? left over from debugging?
      localStorage.setItem('SpreadsheetPreferences', JSON.stringify(defaultPreferences));
      // return defaultPreferences;
    }

    var updatedPreferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
    /* Always get the most recent fields for field methods groups */
    updatedPreferences.mcgillfieldmethodsspring2014template = defaultPreferences.mcgillfieldmethodsspring2014template;
    updatedPreferences.mcgillfieldmethodsfall2014template = defaultPreferences.mcgillfieldmethodsfall2014template;
    updatedPreferences.yalefieldmethodsspring2014template = defaultPreferences.yalefieldmethodsspring2014template;

    /* Always get the most recent available fields */
    updatedPreferences.availableFields = defaultPreferences.availableFields;

    /* update the variable for user choosen template to 2.23+ */
    if (!updatedPreferences.userChosenTemplateId && updatedPreferences.userTemplate) {
      updatedPreferences.userChosenTemplateId = updatedPreferences.userTemplate;
      delete updatedPreferences.userTemplate;
    }

    /* upgrade fulltemplate to v1.923ss instead update to 2.22+ */
    if (existingPreferences.fulltemplate && existingPreferences.fulltemplate.field7) {
      updatedPreferences.fulltemplate = defaultPreferences.fulltemplate;
    }
    if (existingPreferences.fulltemplate && existingPreferences.fulltemplate.field6.label === 'judgement') {
      updatedPreferences.fulltemplate = defaultPreferences.fulltemplate;
    }

    /* set the number of columns to use  to 2.23+ */
    if (!existingPreferences.fullTemplateDefaultNumberOfColumns) {
      updatedPreferences.fullTemplateDefaultNumberOfColumns = $rootScope.fullTemplateDefaultNumberOfColumns || 2;
    }
    $rootScope.fullTemplateDefaultNumberOfColumns = updatedPreferences.fullTemplateDefaultNumberOfColumns;
    if (!existingPreferences.fullTemplateDefaultNumberOfFieldsPerColumn) {
      updatedPreferences.fullTemplateDefaultNumberOfFieldsPerColumn = $rootScope.fullTemplateDefaultNumberOfFieldsPerColumn || 3;
    }
    $rootScope.fullTemplateDefaultNumberOfFieldsPerColumn = updatedPreferences.fullTemplateDefaultNumberOfFieldsPerColumn;
    // If this is the mcgillOnly deploy, overwrite the user's data entry view
    if ($rootScope.mcgillOnly) {
      updatedPreferences.fulltemplate = defaultPreferences.fulltemplate;
      updatedPreferences.userChosenTemplateId = 'mcgillfieldmethodsfall2014template';
      defaultPreferences.userChosenTemplateId = 'mcgillfieldmethodsfall2014template';
      $rootScope.overrideTemplateSetting('mcgillfieldmethodsfall2014template', defaultPreferences.mcgillfieldmethodsfall2014template, true);
    }

    localStorage.setItem('SpreadsheetPreferences', JSON.stringify(updatedPreferences));
    return updatedPreferences;
  };
  $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();


  // Set scope variables
  $scope.documentReady = false;
  $rootScope.templateId = $scope.scopePreferences.userChosenTemplateId;
  $rootScope.fields = []; //$scope.scopePreferences[$scope.scopePreferences.userChosenTemplateId];
  $rootScope.fieldsInColumns = {}; //$rootScope.getAvailableFieldsInColumns();
  $scope.orderProp = "dateEntered";
  $rootScope.currentPage = 0;
  $scope.reverse = true;
  // $scope.activeDatumIndex = 'newEntry';
  $rootScope.authenticated = false;
  $rootScope.developer = false;
  $scope.dataentry = false;
  $scope.searching = false;
  $rootScope.activeSubMenu = 'none';
  $scope.activeSessionID = undefined;
  $scope.currentSessionName = "All Sessions";
  $scope.showCreateNewSessionDropdown = false;
  $scope.showEditSessionDetailsDropdown = false;
  $scope.currentDate = JSON.parse(JSON.stringify(new Date()));
  $scope.activities = [];
  $rootScope.corpusSelected = false;
  $scope.newFieldData = {};
  $rootScope.newRecordHasBeenEdited = false;

  $rootScope.serverLabels = Servers.getHumanFriendlyLabels();

  // Set data size for pagination
  $rootScope.resultSize = $scope.scopePreferences.resultSize;


  $scope.changeActiveSubMenu = function(subMenu) {
    if ($rootScope.activeSubMenu === subMenu) {
      $rootScope.activeSubMenu = 'none';
    } else if (subMenu === 'none' && $scope.searching === true) {
      return;
    } else {
      $rootScope.activeSubMenu = subMenu;
    }
  };

  $scope.showDataEntry = function() {
    reRouteUser("spreadsheet/" + $rootScope.templateId);
  };

  $scope.navigateVerifySaved = function(itemToDisplay) {
    if ($scope.saved === 'no') {
      $rootScope.notificationMessage = "Please save changes before continuing.";
      $rootScope.openNotification();
    } else if ($scope.saved === "saving") {
      $rootScope.notificationMessage = "Changes are currently being saved.\nPlease wait until this operation is done.";
      $rootScope.openNotification();
    } else if ($rootScope.newRecordHasBeenEdited === true) {
      $rootScope.notificationMessage = "Please click \'Create New\' and then save your changes before continuing.";
      $rootScope.openNotification();
    } else {

      $scope.appReloaded = true;

      if ($rootScope.corpus) {
        $rootScope.corpusSelected = true;
      }

      $rootScope.loading = false;

      $scope.activeMenu = itemToDisplay;

      switch (itemToDisplay) {
        case "settings":
          $scope.dataentry = false;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          reRouteUser("settings");
          break;
        case "corpusSettings":
          $scope.dataentry = false;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          reRouteUser("corpussettings");
          break;
        case "home":
          $scope.dataentry = false;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          reRouteUser("corpora_list");
          break;
        case "searchMenu":
          $scope.changeActiveSubMenu(itemToDisplay);
          $scope.searching = true;
          $scope.activeDatumIndex = null;
          reRouteUser("spreadsheet/" + $rootScope.templateId);
          break;
        case "faq":
          $scope.dataentry = false;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          reRouteUser("faq");
          break;
        case "none":
          $scope.dataentry = true;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          reRouteUser("spreadsheet/" + $rootScope.templateId);
          break;
        case "register":
          reRouteUser("register");
          break;
        default:
          reRouteUser("spreadsheet/" + $rootScope.templateId);
          $scope.changeActiveSubMenu(itemToDisplay);
      }
    }
  };


  // Get sessions for pouchname; select specific session on saved state load
  $scope.loadSessions = function() {
    /* reset the sessions list if the corpus has changed */
    if ($rootScope.corpus && $rootScope.corpus.dbname && $scope.application.sessionsList && $scope.application.sessionsList.docs && $scope.application.sessionsList.docs.length > 0 && $scope.application.sessionsList.dbname !== $rootScope.corpus.dbname) {
      $scope.application.previousSessionsList = $scope.application.sessionsList;
      $scope.application.sessionsList = new FieldDB.DataList({
        title: {
          default: "locale_All_Elicitation_Sessions"
        },
        description: {
          default: "This list was automatically generated by looking in the corpus."
        },
        api: "sessions"
      });
    }

    /* avoid reloading sessions if they have already been loaded for this corpus */
    if ($scope.application.sessionsList && $scope.application.sessionsList.docs && $scope.application.sessionsList.docs.length > 0 && $scope.application.sessionsList.dbname === $rootScope.corpus.dbname) {
      console.log("sessions are already loaded", $scope.application.sessionsList);
      if (!$rootScope.corpus.currentSession && $scope.application.sessionsList.docs && $scope.application.sessionsList.docs._collection && $scope.application.sessionsList.docs._collection.length > 0) {
        console.log("   but corpus.currentSession wasnt defined, this should never happen.");
        $rootScope.corpus.currentSession = $scope.application.sessionsList.docs._collection[$scope.application.sessionsList.docs.length - 1];
      }
      return;
    }

    $scope.appReloaded = true;
    $rootScope.loading = true;

    $scope.application.sessionsList.dbname = $rootScope.corpus.dbname;
    $rootScope.corpus.fetchCollection($scope.application.sessionsList.api).then(function(results) {
      if ($scope.application.sessionsList.dbname !== $rootScope.corpus.dbname) {
        console.log("  the session list and corpus dont match they arent from the same databse, not adding these results to the list");
        return;
      }
      if (results.length <= $scope.application.sessionsList.length) {
        console.log("  sessions are already loaded", results, $scope.application.sessionsList);
        return;
      }

      $scope.application.sessionsList.confidential = $rootScope.corpus.confidential;
      $scope.application.sessionsList.populate(results.map(function(doc) {
        doc.url = $rootScope.corpus.url;
        return doc;
      }));

      // $scope.application.sessionsList.push({
      //   title: $rootScope.contextualize('locale_view_all_sessions_dropdown') || "All",
      //   _id: "none"
      // });

      /* Set the current session either form the user's last page load or to be the most recent session */
      if (!$rootScope.corpus.currentSession && $scope.application.sessionsList.docs && $scope.application.sessionsList.docs._collection && $scope.application.sessionsList.docs._collection.length > 0) {
        if ($scope.scopePreferences && $scope.scopePreferences.savedState && $scope.scopePreferences.savedState.sessionID && $scope.application.sessionsList.docs[$scope.scopePreferences.savedState.sessionID]) {
          $rootScope.corpus.currentSession = $scope.application.sessionsList.docs[$scope.scopePreferences.savedState.sessionID];
        } else {
          $rootScope.corpus.currentSession = $scope.application.sessionsList.docs._collection[$scope.application.sessionsList.docs.length - 1];
        }
        $scope.currentSessionWasNotSetByAHuman = true;
      }
      $scope.newSession = $rootScope.corpus.newSession();
      $scope.documentReady = true;
      $rootScope.loading = false;
      $rootScope.saved = "yes";
    }, function(error) {
      $scope.documentReady = true;
      console.log("Error loading sessions.", error);
      $scope.application.bug("Error loading your list of elicitation sessions, please try loading page again.");
      $rootScope.loading = false;
    });
  };

  // Fetch data from server and put into template scope
  $scope.loadData = function(sessionID) {

    console.log("loadData is deprecated.");
    if (true) {
      return;
    }
    console.warn("Clearing search terms");
    $scope.searchHistory = "";

    $scope.appReloaded = true;
    $rootScope.loading = true;
    Data.getDataBySession($rootScope.corpus.pouchname, sessionID)
      .then(function(dataInThisSessionWhichWasConvertedIntoSpreadsheetDatum) {

        // TODO dont sort the data here, its being sorted by the templates too...?
        // scopeData.sort(function(a, b) {
        //   // return a[$scope.orderProp] - b[$scope.orderProp];

        //   if (a[$scope.orderProp] > b[$scope.orderProp])
        //     return -1;
        //   if (a[$scope.orderProp] < b[$scope.orderProp])
        //     return 1;
        //   return 0;
        // });

        $scope.allData = dataInThisSessionWhichWasConvertedIntoSpreadsheetDatum;
        var resultSize = $rootScope.resultSize;
        if (resultSize === "all") {
          resultSize = $scope.allData.length;
        }
        $scope.data = dataInThisSessionWhichWasConvertedIntoSpreadsheetDatum.slice(0, resultSize);
        $rootScope.currentPage = 0;

        $scope.loadAutoGlosserRules();
        $scope.loadUsersAndRoles();

        $scope.saved = "yes";
        $rootScope.loading = false;

        $scope.activeDatumIndex = "newEntry";


      }, function(error) {
        console.log("error loading the data", error);
        // On error loading data, reset saved state
        // Update saved state in Preferences
        $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
        $scope.scopePreferences.savedState = {};
        localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
        $scope.documentReady = true;
        $rootScope.notificationMessage = "There was an error loading the data. Please reload and log in.";
        $rootScope.openNotification();
        $rootScope.loading = false;
      });
  };

  $scope.loadAutoGlosserRules = function() {
    // Get precedence rules for Glosser
    Data.glosser($rootScope.corpus.pouchname)
      .then(function(rules) {
        localStorage.setItem($rootScope.corpus.pouchname + "precedenceRules", JSON.stringify(rules));

        // Reduce the rules such that rules which are found in multiple
        // source words are only used/included once.
        var reducedRules = _.chain(rules).groupBy(function(rule) {
          return rule.key.x + "-" + rule.key.y;
        }).value();

        // Save the reduced precedence rules in localStorage
        localStorage.setItem($rootScope.corpus.pouchname + "reducedRules",
          JSON.stringify(reducedRules));
      }, function(error) {
        console.log("Error retrieving precedence rules.", error);
      });

    // Get lexicon for Glosser and organize based on frequency
    Data.lexicon($rootScope.corpus.pouchname).then(function(lexicon) {
      var sortedLexicon = {};
      for (var i in lexicon) {
        if (lexicon[i].key.gloss) {
          if (sortedLexicon[lexicon[i].key.morpheme]) {
            sortedLexicon[lexicon[i].key.morpheme].push({
              gloss: lexicon[i].key.gloss,
              value: lexicon[i].value
            });
          } else {
            sortedLexicon[lexicon[i].key.morpheme] = [{
              gloss: lexicon[i].key.gloss,
              value: lexicon[i].value
            }];
          }
        }
      }
      var sorter = function(a, b) {
        return b.value - a.value;
      };
      // Sort each morpheme array by descending value
      for (var key in sortedLexicon) {
        sortedLexicon[key].sort(sorter);
      }
      localStorage.setItem(
        $rootScope.corpus.pouchname + "lexiconResults", JSON.stringify(sortedLexicon));
    }, function(error) {
      console.log("Error retrieving lexicon.", error);
    });
  };


  $scope.loginUser = function(loginDetails, chosenServer) {
    if (chosenServer) {
      loginDetails.server = chosenServer;
    }

    if (!loginDetails || !loginDetails.server) {
      $rootScope.notificationMessage = "Please choose a server.";
      $rootScope.openNotification();
      return;
    }
    $rootScope.clickSuccess = true;
    $rootScope.loginInfo = {
      "username": loginDetails.user.trim().toLowerCase().replace(/[^0-9a-z]/g, ""),
      "password": loginDetails.password
    };
    // if (auth.user === "senhorzinho") {
    //   var r = confirm("Hello, developer! Would you like to enter developer mode?");
    //   if (r === true) {
    //     $rootScope.developer = true;
    //   }
    // }
    $rootScope.loading = true;

    $rootScope.serverCode = loginDetails.server;
    $rootScope.server = Servers.getServiceUrl(loginDetails.server, "corpus");

    $scope.application.authentication.resumingSessionPromise.then(function(user) {

      if (!user.rev && !$scope.loginUserFromScratchIsRunning) {
        console.warn("this user doesnt have any details on this device, forcing them to login completely.");
        $scope.loginUserFromScratch(loginDetails, chosenServer);
        return;
      }

    }, /* login failure */ function(reason) {
      $rootScope.notificationMessage = "Error logging in.\n" + reason;
      $rootScope.openNotification(null, true);
      $rootScope.loading = false;
    });
  };


  document.addEventListener("authenticated", function() {
    if (!$scope.application.authentication.user || !$scope.application.authentication.user.rev) {
      $rootScope.openWelcomeNotificationDeprecated();
      return;
    }
    $rootScope.user = $scope.application.authentication.user;
    $rootScope.authenticated = true;
    $scope.corpora = $scope.corpora || new FieldDB.Collection();

    // Update saved state in Preferences
    $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
    $scope.scopePreferences.savedState.server = $rootScope.serverCode;
    $scope.scopePreferences.savedState.username = $rootScope.user.username;
    $scope.scopePreferences.savedState.password = sjcl.encrypt("password", $rootScope.loginInfo.password);
    localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));

    // if ($scope.application.authentication.user.mostRecentIds && $scope.application.authentication.user.mostRecentIds.couchConnection && $scope.application.authentication.user.mostRecentIds.couchConnection.dbname) {
    //   $scope.selectCorpus($scope.application.authentication.user.mostRecentIds.couchConnection);
    // } else {
    // }
    $scope.documentReady = true;
    $rootScope.loading = false;
    try {
      if (!$scope.$$phase) {
        $scope.$apply(); //$digest or $apply
      }
    } catch (e) {
      console.warn("Rendering generated an erorr", e);
    }

  }, false);

  $scope.loginUserFromScratch = function(loginDetails, chosenServer) {
    if ($scope.loginUserFromScratchIsRunning) {
      console.warn("loginUserFromScratch is already running");
      return;
    }
    if (chosenServer) {
      loginDetails.server = chosenServer;
    }
    $scope.loginUserFromScratchIsRunning = true;

    if (!loginDetails || !loginDetails.server) {
      $rootScope.notificationMessage = "Please choose a server.";
      $rootScope.openNotification();
      return;
    }
    $rootScope.clickSuccess = true;
    $rootScope.loginInfo = {
      "username": loginDetails.user.trim().toLowerCase().replace(/[^0-9a-z]/g, ""),
      "password": loginDetails.password
    };
    if (!$rootScope.serverCode) {
      console.log("Sever code is undefined");
      reRouteUser("corpora_list");
      return;
    }
    $rootScope.loginInfo.serverCode = $rootScope.serverCode;
    $scope.application.authentication.login($rootScope.loginInfo).then(function() {
      // $rootScope.user = user;
      $scope.loginUserFromScratchIsRunning = false;
      $scope.addActivity([{
        verb: "logged in",
        verbicon: "icon-check",
        directobjecticon: "icon-user",
        directobject: "",
        indirectobject: "",
        teamOrPersonal: "personal"
      }], "uploadnow");

    }, function(error) {
      $scope.application.bug(error.userFriendlyErrors.join(" "));
    });
  };

  $scope.logout = function() {
    $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
    $scope.scopePreferences.savedState = {};
    localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
    $scope.application.authentication.logout();
    // $scope.reloadPage();
  };

  $rootScope.setTemplateUsingCorpusPreferedTemplate = function(corpus) {
    if (true) {
      console.log("setting templates is deprecated.");
      return;
    }
    // If the currently choosen corpus has a default template, overwrite the user's preferences
    if ($rootScope.mcgillOnly) {
      console.warn("not using the databases' preferredTemplate, this is the mcgill dashboard");
      //$rootScope.overrideTemplateSetting(corpus.preferredTemplate, fieldsForTemplate, true);

    } else if (corpus.preferredTemplate) {
      var fieldsForTemplate = $rootScope.corpus.datumFields;
      if (corpus.preferredTemplate !== "fulltemplate" && window.defaultPreferences[corpus.preferredTemplate]) {
        fieldsForTemplate = window.defaultPreferences[corpus.preferredTemplate];
      }
      $rootScope.overrideTemplateSetting(corpus.preferredTemplate, fieldsForTemplate, true);
    }
  };

  $scope.loadCorpusFieldsAndPreferences = function() {
    // Update saved state in Preferences
    $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
    $scope.scopePreferences.savedState.mostRecentCorpusPouchname = $rootScope.corpus.dbname;
    localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
    $rootScope.fieldsInColumns = $rootScope.getAvailableFieldsInColumns();
    $rootScope.overrideTemplateSetting();

    $scope.loadSessions();
    $scope.loadUsersAndRoles();
  };

  $scope.selectCorpus = function(selectedCorpusConnection) {
    if (!selectedCorpusConnection) {
      $rootScope.notificationMessage = "Please select a database.";
      $rootScope.openNotification();
      return;
    }
    if (typeof selectedCorpusConnection === "string") {
      selectedCorpusConnection = {
        dbname: selectedCorpusConnection
      };
    }
    selectedCorpusConnection.dbname = selectedCorpusConnection.dbname || selectedCorpusConnection.pouchname;
    if (!selectedCorpusConnection.dbname) {
      console.warn("Somethign went wrong, the user selected a corpus connection that had no db info", selectedCorpusConnection);
      return;
    }
    if ($rootScope.corpus && $rootScope.corpus.dbname !== selectedCorpusConnection.dbname) {
      console.warn("The corpus already existed, and it was not the same as this one, removing it to use this one " + selectedCorpusConnection.dbname);
    }
    if ($scope.corpora && $scope.corpora[selectedCorpusConnection.pouchname]) {
      $rootScope.corpus = FieldDB.FieldDBObject.application.corpus = $scope.corpora[selectedCorpusConnection.pouchname];
      return;
    }

    $rootScope.corpus = FieldDB.FieldDBObject.application.corpus = new FieldDB.Corpus();
    $rootScope.corpus.loadOrCreateCorpusByPouchName(selectedCorpusConnection.pouchname).then(function(results) {
      console.log("loaded the corpus", results);
      $scope.corpora.add($rootScope.corpus);
      selectedCorpusConnection.parent = $rootScope.corpus;

      $scope.addActivity([{
        verb: "opened ",
        verbicon: "icon-eye",
        directobjecticon: "icon-cloud",
        directobject: $rootScope.corpus.title,
        indirectobject: "",
        teamOrPersonal: "personal"
      }], "uploadnow");

      $scope.addActivity([{
        verb: "opened ",
        verbicon: "icon-eye",
        directobjecticon: "icon-cloud",
        directobject: $rootScope.corpus.title,
        indirectobject: "",
        teamOrPersonal: "team"
      }], "uploadnow");
      $scope.loadCorpusFieldsAndPreferences();

    });
  };

  try {
    $rootScope.$watch('corpus.dbname', function(newValue, oldValue) {
      if (!$rootScope.corpus || !$rootScope.corpus.datumFields || !$rootScope.corpus._rev) {
        console.log("the corpus changed but it wasn't ready yet");
        return;
      }
      if (newValue === oldValue && newValue === $rootScope.corpus.dbname) {
        console.log("the corpus changed but it was the same corpus, not doing anything.");
        return;
      }
      $scope.loadCorpusFieldsAndPreferences();
    });

    $rootScope.$watch('corpus.currentSession', function(newValue, oldValue) {
      if (!$rootScope.corpus || !$rootScope.corpus.currentSession || !$rootScope.corpus.currentSession.goal) {
        return;
      }
      console.log("corpus.currentSession changed", oldValue);
      $scope.scopePreferences.savedState.sessionID = $rootScope.corpus.currentSession.id;
      $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
      localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));

      if ($scope.currentSessionWasNotSetByAHuman) {
        $scope.currentSessionWasNotSetByAHuman = false;
      } else {
        reRouteUser("spreadsheet/" + $rootScope.templateId);
      }
      $scope.dataentry = true;
    });

  } catch (e) {
    console.warn(e);
  }


  $scope.selectSession = function() {
    console.log("selectSession is deprecated, dont need it anymore.");
  };

  $scope.changeActiveSessionID = function() {
    console.log("changeActiveSessionID is deprecated, dont need it anymore.");
  };

  $scope.getCurrentSessionName = function() {
    console.log("getCurrentSessionName is deprecated, dont need it anymore.");
  };

  $scope.changeViewToNewSession = function() {
    $scope.showCreateNewSessionDropdown = true;
    $scope.showEditSessionDetailsDropdown = false;
    $scope.changeActiveSubMenu("none");
    reRouteUser("corpora_list");
  };

  $scope.editSession = function() {
    var r = confirm("Are you sure you want to edit the session information?\nThis could take a while.");
    if (!r) {
      return;
    }
    // Save session record to all its datum
    $rootScope.corpus.currentSession.save().then(function() {
      var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a>";
      $scope.addActivity([{
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-calendar",
        directobject: "<a href='#session/" + $rootScope.corpus.currentSession.id + "'>" + $rootScope.corpus.currentSession.goal + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-calendar",
        directobject: "<a href='#session/" + $rootScope.corpus.currentSession.id + "'>" + $rootScope.corpus.currentSession.goal + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }], "uploadnow");

      // $rootScope.corpus.currentSession.docs.map(function(datum) {
      //   datum.session = $rootScope.corpus.currentSession;
      //   datum.save().then(function() {
      //       $rootScope.loading = false;
      //     },
      //     function() {
      //       $scope.application.bug("There was an error accessing the record.\nTry refreshing the page");
      //     });
      // });
    });
  };

  $scope.deleteEmptySession = function() {
    $scope.deleteSession();
  };

  $scope.deleteSession = function() {
    if (!$rootScope.corpus.currentSession || $rootScope.corpus.currentSession.id === "none") {
      $rootScope.notificationMessage = "You must select a session to delete.";
      $rootScope.openNotification();
    } else {
      var r = confirm("Are you sure you want to put this session in the trash?");
      if (!r) {
        return;
      }
      $rootScope.corpus.currentSession.trashed = "deleted";
      $rootScope.corpus.currentSession.save().then(function(response) {
        if (debugging) {
          console.log(response);
        }
        var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a>";
        $scope.addActivity([{
          verb: "deleted",
          verbicon: "icon-trash",
          directobjecticon: "icon-calendar",
          directobject: "<a href='#session/" + $rootScope.corpus.currentSession.id + "'>an elicitation session</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "personal"
        }, {
          verb: "deleted",
          verbicon: "icon-trash",
          directobjecticon: "icon-calendar",
          directobject: "<a href='#session/" + $rootScope.corpus.currentSession.id + "'>an elicitation session</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "team"
        }], "uploadnow");

        // Remove session from scope
        $scope.application.sessionsList.docs.remove($rootScope.corpus.currentSession);
        if ($scope.application.sessionsList.docs._collection.length > 0) {
          $rootScope.corpus.currentSession = $scope.application.sessionsList.docs._collection[$scope.application.sessionsList.docs._collection.length - 1];
        } else {
          $scope.application.bug("Please create an elicitation session before continuing.");
          reRouteUser("corpora_list");
        }

      }, function(error) {
        console.warn("there was an error deleting a session", error);
        $scope.application.bug("Error deleting session.\nTry refreshing the page.");
      });
    }
  };


  $scope.createNewSession = function(newSession) {
    $rootScope.loading = true;
    newSession.user = $scope.application.authentication.user.userMask;
    newSession.save().then(function() {

      var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a>";
      $scope.addActivity([{
        verb: "added",
        verbicon: "icon-pencil",
        directobjecticon: "icon-calendar",
        directobject: "<a href='#session/" + newSession.id + "'>" + newSession.goal + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "added",
        verbicon: "icon-pencil",
        directobjecticon: "icon-calendar",
        directobject: "<a href='#session/" + newSession.id + "'>" + newSession.goal + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }], "uploadnow");

      $rootScope.corpus.currentSession = $scope.application.sessionsList.add(newSession);
      $scope.dataentry = true;
      $rootScope.loading = false;
      reRouteUser("spreadsheet/" + $rootScope.templateId);
    });
  };


  $scope.reloadPage = function() {
    if ($scope.saved === "no") {
      $rootScope.notificationMessage = "Please save changes before continuing.";
      $rootScope.openNotification();
    } else if ($scope.saved === "saving") {
      $rootScope.notificationMessage = "Changes are currently being saved.\nYou may refresh the data once this operation is done.";
      $rootScope.openNotification();
    } else {
      reRouteUser("");
      window.location.reload();
    }
  };


  $scope.deleteRecord = function(datum) {
    if (!datum.id) {
      $rootScope.notificationMessage = "Please save changes before continuing.";
      $rootScope.openNotification();
      $scope.activeDatumIndex = datum;
      // } else if (datum.audioVideo && datum.audioVideo[0]) {
      //   $rootScope.notificationMessage = "You must delete all recordings from this record first.";
      //   $rootScope.openNotification();
      //   $scope.activeDatumIndex = datum;
    } else {
      var r = confirm("Are you sure you want to put this datum in the trash?");
      if (r === true) {

        Data.async($rootScope.corpus.pouchname, datum.id)
          .then(function(recordToMarkAsDeleted) {
            recordToMarkAsDeleted.trashed = "deleted";
            var rev = recordToMarkAsDeleted._rev;
            console.log(rev);
            //Upgrade to v1.90
            if (recordToMarkAsDeleted.attachmentInfo) {
              delete recordToMarkAsDeleted.attachmentInfo;
            }
            Data.saveCouchDoc($rootScope.corpus.pouchname, recordToMarkAsDeleted)
              .then(function(response) {
                // Remove record from scope
                if (debugging) {
                  console.log(response);
                }
                var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a>";
                $scope.addActivity([{
                  verb: "deleted",
                  verbicon: "icon-trash",
                  directobjecticon: "icon-list",
                  directobject: "<a href='#data/" + datum.id + "'>a datum</a> ",
                  indirectobject: indirectObjectString,
                  teamOrPersonal: "personal"
                }, {
                  verb: "deleted",
                  verbicon: "icon-trash",
                  directobjecticon: "icon-list",
                  directobject: "<a href='#data/" + datum.id + "'>a datum</a> ",
                  indirectobject: indirectObjectString,
                  teamOrPersonal: "team"
                }], "uploadnow");

                // Remove record from all scope data and update
                var index = $scope.allData.indexOf(datum);
                $scope.allData.splice(index, 1);
                $scope.loadPaginatedData();

                $scope.saved = "yes";
                $scope.activeDatumIndex = null;
              }, function(error) {
                console.warn(error);
                $scope.application.bug("Error deleting record.\nTry refreshing the data first by clicking ↻.");
              });
          });
      }
    }
  };


  //TODO what does this do? can any of this be done in the SpreadsheetDatum file instead?
  // Here is what fieldData looks like:
  // {
  //   "field2": "",
  //   "field3": "",
  //   "field1": "hi does this call createRecord"
  // }

  $scope.createRecord = function(onlyContentfulFields, $event) {
    if ($event && $event.type && $event.type === "submit" && $event.target) {
      $scope.setDataEntryFocusOn($event.target);
    }

    // // Reset new datum form data and enable upload button; only reset audio field if present
    // if ($rootScope.templateId === "fulltemplate" || $rootScope.templateId === "mcgillfieldmethodsspring2014template" || $rootScope.templateId === "yalefieldmethodsspring2014template") {
    //   document.getElementById("form_new_datum_audio-file").reset();
    //   $scope.newDatumHasAudioToUpload = false;
    // }
    $rootScope.newRecordHasBeenEdited = false;
    $scope.newFieldData = {};

    var newSpreadsheetDatum = SpreadsheetDatum.convertFieldDBDatumIntoSpreadSheetDatum({}, Data.blankDatumTemplate(), null, $scope);

    // Edit record fields with labels from prefs
    for (var dataKey in onlyContentfulFields) {
      newSpreadsheetDatum[dataKey] = onlyContentfulFields[dataKey];
      delete onlyContentfulFields[dataKey];
    }

    newSpreadsheetDatum.enteredByUser = {
      "username": $rootScope.user.username,
      "gravatar": $rootScope.user.gravatar,
      "appVersion": $rootScope.appVersion
    };

    newSpreadsheetDatum.timestamp = Date.now();
    newSpreadsheetDatum.dateEntered = JSON.parse(JSON.stringify(new Date(newSpreadsheetDatum.timestamp)));
    newSpreadsheetDatum.dateModified = newSpreadsheetDatum.dateEntered;
    // newSpreadsheetDatum.lastModifiedBy = $rootScope.user.username;
    if (!$rootScope.corpus.currentSession && $scope.application.sessionsList && $scope.application.sessionsList.length > 0) {

      if ($scope.scopePreferences && $scope.scopePreferences.savedState && $scope.scopePreferences.savedState.sessionID && $scope.scopePreferences.savedState.sessionID.docs[$rootScope.corpus.currentSession]) {
        $rootScope.corpus.currentSession = $scope.scopePreferences.savedState.sessionID.docs[$rootScope.corpus.currentSession];
      } else {
        $rootScope.corpus.currentSession = $scope.application.sessionsList.docs._collection[0];
      }

    }
    newSpreadsheetDatum.session = $rootScope.corpus.currentSession;
    // newSpreadsheetDatum.sessionID = $scope.activeSessionID;
    newSpreadsheetDatum.saved = "no";

    // Add record to all scope data and update
    $scope.allData.push(newSpreadsheetDatum); //inserts new data at the bottom for future pagination.
    $scope.data.push(newSpreadsheetDatum);
    // $scope.loadPaginatedData("newDatum"); //dont change pagination, just show it on this screen.
    $scope.activeDatumIndex = "newEntry";

    $scope.newFieldDatahasAudio = false;
    $scope.saved = "no";

    try {
      if (!$scope.$$phase) {
        $scope.$digest(); //$digest or $apply
      }
    } catch (e) {
      console.warn("Digest errored", e);
    }
  };

  $rootScope.markNewAsEdited = function() {
    $rootScope.newRecordHasBeenEdited = true;
  };

  $rootScope.markAsNotSaved = function(datum) {
    datum.saved = "no";
    $scope.saved = "no";
  };

  // TODO why does this do somethign with datum tags, can any of this be done in the spreadsheet datum ?
  $rootScope.markAsEdited = function(fieldData, datum, $event) {
    if (FieldDB && FieldDB.FieldDBObject) {
      var previous = new FieldDB.Datum(datum.fossil);
      var current = new FieldDB.Datum(datum);
      delete current.fossil;
      delete current.$$hashKey;
      delete current.modifiedByUser;
      delete previous.modifiedByUser;

      delete current._dateModified;
      delete previous._dateModified;

      if (previous.equals(current)) {
        console.log("The datum didnt actually change. Not marking as editied");
        return;
      } else {
        console.warn("+++++++++++++++++++++++++++++++++++++++++++++++++");
        console.warn("@hisakonog turning on debugmode for equality look below here.");
        console.warn("+++++++++++++++++++++++++++++++++++++++++++++++++");
        current.debugMode = true;
        current.debugMode = true;
        previous.equals(current);
        console.warn("+++++++++++++++++++++++++++++++++++++++++++++++++");
        console.warn("@hisakonog look in the above text for what attribute is not equal on the unchanged datum, we can add it to the list of attributes to ignore.");
        console.warn("+++++++++++++++++++++++++++++++++++++++++++++++++");
        // datum.saved = "no";
      }
    }

    var utterance = "Datum";
    for (var key in fieldData) {
      if (key === "datumTags" && typeof fieldData.datumTags === 'string') {
        var newDatumFields = fieldData.datumTags.split(",");
        var newDatumFieldsArray = [];
        for (var i in newDatumFields) {
          var newDatumTagObject = {};
          // Trim spaces
          var trimmedTag = newDatumFields[i].trim();
          newDatumTagObject.tag = trimmedTag;
          newDatumFieldsArray.push(newDatumTagObject);
        }
        datum.datumTags = newDatumFieldsArray;
      } else {
        // console.log("$scope.fields",$scope.fields);
        datum[$scope.fields[key].label] = fieldData[key];
      }

      if ($scope.fields[key].label === "utterance") {
        utterance = fieldData[key];
      }
    }
    datum.dateModified = JSON.parse(JSON.stringify(new Date()));
    datum.timestamp = Date.now();

    // Limit activity to one instance in the case of multiple edits to the same datum before 'save'
    if (!datum.saved || datum.saved === "fresh" || datum.saved === "yes") {

      // Dont Limit users array to unique usernames
      // datum.modifiedByUser.users = _.map(_.groupBy(datum.modifiedByUser.users, function(x) {
      //   return x.username;
      // }), function(grouped) {
      //   return grouped[0];
      // });
      var modifiedByUser = {
        "username": $rootScope.user.username,
        "gravatar": $rootScope.user.gravatar,
        "appVersion": $rootScope.appVersion,
        "timestamp": datum.timestamp
      };

      if (!datum.modifiedByUser || !datum.modifiedByUser.users) {
        datum.modifiedByUser = {
          "users": []
        };
      }
      datum.modifiedByUser.users.push(modifiedByUser);

      // Update activity feed
      var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a>";
      $scope.addActivity([{
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-list",
        directobject: "<a href='#corpus/" + $rootScope.corpus.pouchname + "/datum/" + datum.id + "'>" + utterance + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-list",
        directobject: "<a href='#corpus/" + $rootScope.corpus.pouchname + "/datum/" + datum.id + "'>" + utterance + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }]);
    }
    datum.saved = "no";
    $scope.saved = "no";

    if ($event && $event.type && $event.type === "submit") {
      $scope.selectRow($scope.activeDatumIndex + 1);
    }
  };

  $scope.addComment = function(datum) {
    var newComment = prompt("Enter new comment.");
    if (newComment === "" || newComment === null) {
      return;
    }
    var comment = {};
    comment.text = newComment;
    comment.username = $rootScope.user.username;
    comment.timestamp = Date.now();
    comment.gravatar = $rootScope.user.gravatar || "0df69960706112e38332395a4f2e7542";
    comment.timestampModified = Date.now();
    if (!datum.comments) {
      datum.comments = [];
    }
    datum.comments.push(comment);
    datum.saved = "no";
    $scope.saved = "no";
    datum.dateModified = JSON.parse(JSON.stringify(new Date()));
    datum.timestamp = Date.now();
    datum.lastModifiedBy = $rootScope.user.username;
    // $rootScope.currentPage = 0;
    // $rootScope.editsHaveBeenMade = true;

    var indirectObjectString = "on <a href='#data/" + datum.id + "'><i class='icon-pushpin'></i> " + $rootScope.corpus.title + "</a>";
    // Update activity feed
    $scope.addActivity([{
      verb: "commented",
      verbicon: "icon-comment",
      directobjecticon: "icon-list",
      directobject: comment.text,
      indirectobject: indirectObjectString,
      teamOrPersonal: "personal"
    }, {
      verb: "commented",
      verbicon: "icon-comment",
      directobjecticon: "icon-list",
      directobject: comment.text,
      indirectobject: indirectObjectString,
      teamOrPersonal: "team"
    }]);

  };

  $scope.deleteComment = function(comment, datum) {
    if ($rootScope.commentPermissions === false) {
      $rootScope.notificationMessage = "You do not have permission to delete comments.";
      $rootScope.openNotification();
      return;
    }
    if (comment.username !== $rootScope.user.username) {
      $rootScope.notificationMessage = "You may only delete comments created by you.";
      $rootScope.openNotification();
      return;
    }
    var verifyCommentDelete = confirm("Are you sure you want to remove the comment '" + comment.text + "'?");
    if (verifyCommentDelete === true) {
      for (var i in datum.comments) {
        if (datum.comments[i] === comment) {
          datum.comments.splice(i, 1);
        }
      }
    }
  };

  $scope.saveChanges = function() {
    var saveDatumPromises = [];

    var doSomethingElse = function(recordToBeSaved) {
      if (!recordToBeSaved || recordToBeSaved.saved !== "no") {
        //not saving this record
        return;
      }

      var promiseToSaveThisDatum;

      var utteranceForActivityFeed = "Datum";
      if (recordToBeSaved.utterance && recordToBeSaved.utterance !== "") {
        utteranceForActivityFeed = recordToBeSaved.utterance;
      }

      var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a>";
      var activities = [{
        verb: "added",
        verbicon: "icon-plus",
        directobjecticon: "icon-list",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "added",
        verbicon: "icon-plus",
        directobjecticon: "icon-list",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }];

      if (recordToBeSaved.id) {
        activities[0].verb = "modified";
        activities[0].verbicon = "icon-pencil";
        activities[1].verb = "modified";
        activities[1].verbicon = "icon-pencil";
      } else {
        if ($rootScope.corpus.currentSession) {
          recordToBeSaved.session = $rootScope.corpus.currentSession; //TODO check this, should work since the users only open data by elicitation session.
        } else {
          $scope.application.bug("This appears to be a new record, but there isnt a current data entry session to associate it with. Please report this to support@lingsync.org");
        }
      }

      $scope.saved = "saving";
      recordToBeSaved.pouchname = $rootScope.corpus.pouchname;
      // spreadsheetDatum.dateModified =
      // recordToBeSaved.timestamp = Date.now(); // these come from the edit function, and from the create function because the save can happen minutes or hours after the user actually modifies/creates the datum.
      promiseToSaveThisDatum = Data.saveSpreadsheetDatum(recordToBeSaved);
      saveDatumPromises.push(promiseToSaveThisDatum);

      promiseToSaveThisDatum
        .then(function(spreadSheetDatum) {
          spreadSheetDatum.saved = "yes";
          activities[0].directobject = activities[1].directobject = "<a href='#corpus/" + $rootScope.corpus.pouchname + "/datum/" + spreadSheetDatum.id + "'>" + utteranceForActivityFeed + "</a> ";
          $scope.addActivity(activities, "uploadnow");
        }, function(reason) {
          console.log(reason);
          $scope.saved = "no";
          $scope.application.bug("There was an error saving a record. " + reason);
          // wish this would work:
          // $rootScope.notificationMessage = "There was an error saving a record. " + reason;
          // $rootScope.openNotification();
          // return;
        });

    };
    for (var index in $scope.allData) {
      console.log(index);
      if ($scope.allData.hasOwnProperty(index)) {
        doSomethingElse($scope.allData[index]);
      }
    }
    Q.all(saveDatumPromises).done(function(success, reason) {
      if (reason) {
        console.log(reason);
        $scope.saved = "no";
        $scope.application.bug("There was an error saving one or more records. Please try again.");
      } else {
        if ($scope.saved === "saving") {
          $scope.saved = "yes";
        }
      }
    });
  };


  // Set auto-save interval for 5 minutes
  var autoSave = window.setInterval(function() {
    if ($scope.saved === "no") {
      $scope.saveChanges();
    } else {
      // TODO Dont need to FIND BETTER WAY TO KEEP SESSION ALIVE;
      // if ($rootScope.loginInfo) {
      //   Data.login($rootScope.user.username,
      //     $rootScope.loginInfo.password);
      // }
    }
  }, 300000);
  if (debugging) {
    console.log("autoSave was defined but not used", autoSave);
  }


  $scope.selectRow = function(scopeIndex, targetDatumEntryDomElement) {
    // Do nothing if clicked row is currently selected
    if ($scope.activeDatumIndex === scopeIndex) {
      return;
    }
    if ($scope.searching !== true) {
      if ($rootScope.newRecordHasBeenEdited !== true) {
        $scope.activeDatumIndex = scopeIndex;
      } else {
        $scope.activeDatumIndex = scopeIndex + 1;
        $scope.createRecord($scope.newFieldData);
      }
      if (targetDatumEntryDomElement) {
        $scope.setDataEntryFocusOn(targetDatumEntryDomElement);
      }
    }
  };

  $scope.editSearchResults = function(scopeIndex) {
    $scope.activeDatumIndex = scopeIndex;
  };

  $scope.selectNone = function() {
    $scope.activeDatumIndex = undefined;
  };

  $scope.loadDataEntryScreen = function() {
    $scope.dataentry = true;
    $scope.navigateVerifySaved('none');
    $scope.loadData($scope.activeSessionID);
  };

  $scope.clearSearch = function() {
    $scope.searchTerm = '';
    $scope.searchHistory = null;
    $scope.loadData($scope.activeSessionID);
  };
  if (FieldDB && FieldDB.DatumField) {
    $scope.addedDatumField = new FieldDB.DatumField({
      id: Date.now(),
      label: "New Field " + Date.now()
    });
  } else {
    $scope.addedDatumField = {
      id: Date.now(),
      label: "New Field " + Date.now()
    };
  }

  $scope.updateCorpusDetails = function(corpus) {
    console.log("Saving corpus details, corpus passed in", corpus);
    $rootScope.corpus.url = $rootScope.corpus.url || FieldDB.Database.prototype.BASE_DB_URL + "/" + $rootScope.corpus.pouchname;
    $rootScope.corpus.save($rootScope.user).then(function(result) {
      console.log("Saved corpus details ", result);
      $scope.overrideTemplateSetting();
      var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a>";
      $scope.addActivity([{
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-cloud",
        directobject: "<a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-cloud",
        directobject: "<a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }], "uploadnow");
    }, function(reason) {
      console.log("Error saving corpus details.", reason);
      $scope.application.bug("Error saving corpus details.");
    });
  };

  $scope.runSearch = function(searchTerm) {
    // Create object from fields displayed in scope to later be able to
    // notify user if search result is from a hidden field
    var fieldsInScope = {};
    var mapFieldsToTrue = function(datumField) {
      fieldsInScope[datumField.id] = true;
    };
    for (var column in $scope.fieldsInColumns) {
      if ($scope.fieldsInColumns.hasOwnProperty(column)) {
        $scope.fieldsInColumns[column].map(mapFieldsToTrue);
      }
    }
    fieldsInScope.judgement = true;


    /* make the datumtags and comments always true since its only the compact view that doesnt show them? */
    // if ($rootScope.templateId === "fulltemplate" || $rootScope.templateId === "mcgillfieldmethodsspring2014template" || $rootScope.templateId === "yalefieldmethodsspring2014template") {
    // fieldsInScope.datumTags = true;
    fieldsInScope.comments = true;
    // }

    fieldsInScope.dateModified = true;
    // fieldsInScope.lastModifiedBy = true;

    if ($scope.searchHistory) {
      $scope.searchHistory = $scope.searchHistory + " > " + searchTerm;
    } else {
      $scope.searchHistory = searchTerm;
    }
    // Converting searchTerm to string to allow for integer searching
    searchTerm = searchTerm.toString().toLowerCase();
    var newScopeData = [];

    var thisDatumIsIN = function(spreadsheetDatum) {
      var dataString;

      for (var fieldkey in spreadsheetDatum) {
        // Limit search to visible data
        if (spreadsheetDatum[fieldkey] && fieldsInScope[fieldkey] === true) {
          if (fieldkey === "datumTags") {
            dataString = JSON.stringify(spreadsheetDatum.datumTags);
            dataString = dataString.toString().toLowerCase();
            if (dataString.indexOf(searchTerm) > -1) {
              return true;
            }
          } else if (fieldkey === "comments") {
            for (var j in spreadsheetDatum.comments) {
              for (var commentKey in spreadsheetDatum.comments[j]) {
                dataString = spreadsheetDatum.comments[j][commentKey].toString();
                if (dataString.indexOf(searchTerm) > -1) {
                  return true;
                }
              }
            }
          } else if (fieldkey === "dateModified") {
            //remove alpha characters from the date so users can search dates too, but not show everysearch result if the user is looking for "t" #1657
            dataString = spreadsheetDatum[fieldkey].toString().toLowerCase().replace(/[a-z]/g, " ");
            if (dataString.indexOf(searchTerm) > -1) {
              return true;
            }
          } else {
            dataString = spreadsheetDatum[fieldkey].toString().toLowerCase();
            if (dataString.indexOf(searchTerm) > -1) {
              return true;
            }
          }
        }
      }
      return false;
    };

    // if (!$scope.activeSessionID) {
    // Search allData in scope
    for (var i in $scope.allData) {
      // Determine if record should be included in session search
      var searchTarget = false;
      if (!$scope.activeSessionID) {
        searchTarget = true;
      } else if ($scope.allData[i].session._id === $scope.activeSessionID) {
        searchTarget = true;
      }
      if (searchTarget === true) {
        if (thisDatumIsIN($scope.allData[i])) {
          newScopeData.push($scope.allData[i]);
        }
      }
    }

    if (newScopeData.length > 0) {
      $scope.allData = newScopeData;
      var resultSize = $rootScope.resultSize;
      if (resultSize === "all") {
        resultSize = $scope.allData.length;
      }
      $scope.data = $scope.allData.slice(0, resultSize);
    } else {
      $rootScope.notificationMessage = "No records matched your search.";
      $rootScope.openNotification();
    }
  };

  $scope.selectAll = function() {
    for (var i in $scope.allData) {
      if (!$scope.activeSessionID) {
        $scope.allData[i].checked = true;
      } else if ($scope.allData[i].session._id === $scope.activeSessionID) {
        $scope.allData[i].checked = true;
      }
    }
  };

  $scope.exportResults = function(size) {

    var results = $filter('filter')($scope.allData, {
      checked: true
    });
    if (results.length > 0) {
      $scope.resultsMessage = results.length + " Record(s):";
      $scope.results = results;
    } else {
      $scope.resultsMessage = "Please select records to export.";
    }
    console.log(results);

    var modalInstance = $modal.open({
      templateUrl: 'views/export-modal.html',
      controller: 'SpreadsheetExportController',
      size: size,
      resolve: {
        details: function() {
          return {
            resultsMessageFromExternalController: $scope.resultsMessage,
            resultsFromExternalController: $scope.results,
          };
        }
      }
    });

    modalInstance.result.then(function(any, stuff) {
      if (any || stuff) {
        console.warn("Some parameters were passed by the modal closing, ", any, stuff);
      }
    }, function() {
      $log.info('Export Modal dismissed at: ' + new Date());
    });
  };


  // Add activities to scope object, to be uploaded when 'SAVE' is clicked
  $scope.addActivity = function(activityArray, uploadnow) {
    Data.blankActivityTemplate()
      .then(function(activitySampleJSON) {

        for (var index = 0; index < activityArray.length; index++) {
          var newActivityObject = JSON.parse(JSON.stringify(activitySampleJSON));
          var bareActivityObject = activityArray[index];

          bareActivityObject.verb = bareActivityObject.verb.replace("href=", "target='_blank' href=");
          bareActivityObject.directobject = bareActivityObject.directobject.replace("href=", "target='_blank' href=");
          bareActivityObject.indirectobject = bareActivityObject.indirectobject.replace("href=", "target='_blank' href=");

          newActivityObject.appVersion = $rootScope.appVersion;
          newActivityObject.verb = bareActivityObject.verb;
          newActivityObject.verbicon = bareActivityObject.verbicon;
          newActivityObject.directobjecticon = bareActivityObject.directobjecticon;
          newActivityObject.directobject = bareActivityObject.directobject;
          newActivityObject.indirectobject = bareActivityObject.indirectobject;
          newActivityObject.teamOrPersonal = bareActivityObject.teamOrPersonal;
          newActivityObject.user.username = $rootScope.user.username;
          newActivityObject.user.gravatar = $rootScope.user.gravatar || "0df69960706112e38332395a4f2e7542";
          newActivityObject.user.id = $rootScope.user.username;
          newActivityObject.user._id = $rootScope.user.username; //TODO remove this too eventually...
          newActivityObject.dateModified = JSON.parse(JSON.stringify(new Date())); //TODO #1109 eventually remove date modified?
          newActivityObject.timestamp = Date.now();

          $scope.activities.push(newActivityObject);

        }
        if (uploadnow) {
          $scope.uploadActivities();
        }
      });
  };

  $scope.uploadActivities = function() {
    // Save activities
    if ($scope.activities.length > 0) {
      var doSomethingDifferent = function(index) {
        if ($scope.activities[index]) {
          var activitydb;
          if ($scope.activities[index].teamOrPersonal === "team") {
            activitydb = $rootScope.corpus.pouchname + "-activity_feed";
          } else {
            activitydb = $rootScope.user.username + "-activity_feed";
          }

          Data.saveCouchDoc(activitydb, $scope.activities[index])
            .then(function(response) {
                if (debugging) {
                  console.log("Saved new activity", response);
                }
                // Deleting so that indices in scope are unchanged
                delete $scope.activities[index];
              },
              function(reason) {
                console.warn("There was an error saving the activity. ", $scope.activities[index], reason);
                $scope.application.bug("There was an error saving the activity. ");
                $scope.saved = "no";
              });
        }
      };
      for (var i = 0; i < $scope.activities.length; i++) {
        doSomethingDifferent(i);
      }
    }
  };


  $scope.registerNewUser = function(newLoginInfo, serverCode) {
    if (!newLoginInfo.serverCode) {
      newLoginInfo.serverCode = serverCode;
    }
    if (!newLoginInfo || !newLoginInfo.serverCode) {
      $rootScope.notificationMessage = "Please select a server.";
      $rootScope.openNotification();
      return;
    }
    if (!newLoginInfo.password || !newLoginInfo.confirmPassword) {
      $rootScope.notificationMessage = "Please enter a password.";
      $rootScope.openNotification();
      return;
    }
    if (!newLoginInfo.username) {
      $rootScope.notificationMessage = "Please enter a username.";
      $rootScope.openNotification();
      return;
    }

    $rootScope.loading = true;

    // Clean username and tell user about it
    var safeUsernameForCouchDB = newLoginInfo.username.trim().toLowerCase().replace(/[^0-9a-z]/g, "");
    if (safeUsernameForCouchDB !== newLoginInfo.username) {
      $rootScope.loading = false;
      newLoginInfo.username = safeUsernameForCouchDB;
      $rootScope.notificationMessage = "We have automatically changed your requested username to '" + safeUsernameForCouchDB + "' instead. \n\n(The username you have chosen isn't very safe for urls, which means your corpora would be potentially inaccessible in old browsers)";
      $rootScope.openNotification();
      return;
    }
    var dataToPost = {};
    dataToPost.email = newLoginInfo.email ? newLoginInfo.email.trim().split(" ")[0] : "";
    dataToPost.username = newLoginInfo.username.trim().toLowerCase();
    dataToPost.password = newLoginInfo.password.trim();
    dataToPost.authUrl = Servers.getServiceUrl(newLoginInfo.serverCode, "auth");
    dataToPost.appVersionWhenCreated = $rootScope.appVersion;

    dataToPost.serverCode = newLoginInfo.serverCode;

    if (dataToPost.username !== "" && (dataToPost.password === newLoginInfo.confirmPassword.trim())) {
      // Create user
      Data.register(dataToPost)
        .then(function(response) {
          if (debugging) {
            console.log(response);
          }
          $rootScope.loading = false;
        }, function(error) {
          console.warn(error);
          $rootScope.loading = false;
        });
    } else {
      $rootScope.loading = false;
      $rootScope.notificationMessage = "Please verify user information.";
      $rootScope.openNotification();
    }
  };


  $scope.createNewCorpus = function(newCorpusInfo) {
    if (!newCorpusInfo) {
      $rootScope.notificationMessage = "Please enter a corpus name.";
      $rootScope.openNotification();
      return;
    }

    $rootScope.loading = true;
    var dataToPost = {};
    dataToPost.username = $rootScope.user.username.trim();
    dataToPost.password = $rootScope.loginInfo.password.trim();
    dataToPost.serverCode = $rootScope.serverCode;
    dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");

    dataToPost.newCorpusName = newCorpusInfo.newCorpusName;

    if (dataToPost.newCorpusName !== "") {
      // Create new corpus
      Data.createcorpus(dataToPost)
        .then(function(response) {

          // Add new corpus to scope
          var newCorpusConnection = {};
          newCorpusConnection.pouchname = response.corpus.pouchname;
          newCorpusConnection.title = response.corpus.title;
          var directObjectString = "<a href='#corpus/" + response.corpus.pouchname + "'>" + response.corpus.title + "</a>";
          $scope.addActivity([{
            verb: "added",
            verbicon: "icon-plus",
            directobjecticon: "icon-cloud",
            directobject: directObjectString,
            indirectobject: "",
            teamOrPersonal: "personal"
          }], "uploadnow");

          alert("todo test this");
          $rootScope.user.corpora.unshift(newCorpusConnection);
          $scope.selectCorpus(newCorpusConnection);
          $rootScope.loading = false;
          reRouteUser("");
        });
    } else {
      $rootScope.notificationMessage = "Please verify corpus name.";
      $rootScope.openNotification();
      $rootScope.loading = false;
    }
  };

  $scope.loadUsersAndRoles = function() {
    if (!$rootScope.user || !$rootScope.user.roles) {
      console.warn("strangely the user isnt defined, or ready right now.");
      return;
    }
    if ($scope.loadedPermissionsForTeam === $rootScope.corpus.pouchname) {
      console.log("already loaded permissions for this team");
      return;
    }
    // Get all users and roles (for this corpus) from server

    var dataToPost = {};

    dataToPost.username = $rootScope.loginInfo.username;
    dataToPost.password = $rootScope.loginInfo.password;
    dataToPost.serverCode = $rootScope.serverCode;
    dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");
    dataToPost.pouchname = $rootScope.corpus.pouchname;


    Data.getallusers(dataToPost)
      .then(function(users) {
        if (!users) {
          console.log("User doesn't have access to roles.");
          users = {
            allusers: []
          };
        }
        // for (var i in users.allusers) {
        //   if (users.allusers[i].username === $rootScope.loginInfo.username) {
        //     $rootScope.user.gravatar = users.allusers[i].gravatar;
        //   }
        // }

        $scope.users = users;

        // Get privileges for logged in user
        if (!$rootScope.user || !$rootScope.user.roles) {
          console.warn("strangely the user isnt defined, or ready right now.");
          return;
        }
        $rootScope.admin = false;
        $rootScope.readPermissions = false;
        $rootScope.writePermissions = false;
        $rootScope.commentPermissions = false;
        $scope.loadedPermissionsForTeam = $rootScope.corpus.pouchname;
        if ($rootScope.user.roles.indexOf($rootScope.corpus.pouchname + "_admin") > -1) {
          $rootScope.admin = true;
        }
        if ($rootScope.user.roles.indexOf($rootScope.corpus.pouchname + "_reader") > -1) {
          $rootScope.readPermissions = true;
        }
        if ($rootScope.user.roles.indexOf($rootScope.corpus.pouchname + "_writer") > -1) {
          $rootScope.writePermissions = true;
        }
        if ($rootScope.user.roles.indexOf($rootScope.corpus.pouchname + "_commenter") > -1) {
          $rootScope.commentPermissions = true;
        }
        if (!$rootScope.commentPermissions && $rootScope.readPermissions && $rootScope.writePermissions) {
          $rootScope.commentPermissions = true;
        }
      });
  };

  $scope.updateUserRoles = function(newUserRoles) {
    if (!newUserRoles || !newUserRoles.usernameToModify) {
      $rootScope.notificationMessage = "Please select a username.";
      $rootScope.openNotification();
      return;
    }

    if (!newUserRoles.role) {
      $rootScope.notificationMessage = "You haven't selected any roles to add to " + newUserRoles.usernameToModify + "!\nPlease select at least one role..";
      $rootScope.openNotification();
      return;
    }

    $rootScope.loading = true;
    var rolesString = "";
    switch (newUserRoles.role) {
      /*
            NOTE THESE ROLES are not accurate reflections of the db roles,
            they are a simplification which assumes the
            admin -> writer -> commenter -> reader type of system.

            Infact some users (technical support or project coordinators) might be only admin,
            and some experiment participants might be only writers and
            cant see each others data.

            Probably the clients wanted the spreadsheet roles to appear implicative since its more common.
            see https://github.com/OpenSourceFieldlinguistics/FieldDB/issues/1113
          */
      case "admin":
        newUserRoles.admin = true;
        newUserRoles.reader = true;
        newUserRoles.commenter = true;
        newUserRoles.writer = true;
        rolesString += " Admin";
        break;
      case "read_write":
        newUserRoles.admin = false;
        newUserRoles.reader = true;
        newUserRoles.commenter = true;
        newUserRoles.writer = true;
        rolesString += " Writer Reader";
        break;
      case "read_only":
        newUserRoles.admin = false;
        newUserRoles.reader = true;
        newUserRoles.commenter = false;
        newUserRoles.writer = false;
        rolesString += " Reader";
        break;
      case "read_comment_only":
        newUserRoles.admin = false;
        newUserRoles.reader = true;
        newUserRoles.commenter = true;
        newUserRoles.writer = false;
        rolesString += " Reader Commenter";
        break;
      case "write_only":
        newUserRoles.admin = false;
        newUserRoles.reader = false;
        newUserRoles.commenter = true;
        newUserRoles.writer = true;
        rolesString += " Writer";
        break;
    }

    newUserRoles.pouchname = $rootScope.corpus.pouchname;

    var dataToPost = {};
    dataToPost.username = $rootScope.user.username.trim();
    dataToPost.password = $rootScope.loginInfo.password.trim();
    dataToPost.serverCode = $rootScope.serverCode;
    dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");

    dataToPost.userRoleInfo = newUserRoles;

    Data.updateroles(dataToPost)
      .then(function(response) {
        if (debugging) {
          console.log(response);
        }
        var indirectObjectString = "on <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a> as " + rolesString;

        $scope.loadedPermissionsForTeam = "";
        $scope.loadUsersAndRoles();

        $scope.addActivity([{
          verb: "modified",
          verbicon: "icon-pencil",
          directobjecticon: "icon-user",
          directobject: "<a href='http://lingsync.org/" + newUserRoles.usernameToModify + "'>" + newUserRoles.usernameToModify + "</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "personal"
        }, {
          verb: "modified",
          verbicon: "icon-pencil",
          directobjecticon: "icon-user",
          directobject: "<a href='http://lingsync.org/" + newUserRoles.usernameToModify + "'>" + newUserRoles.usernameToModify + "</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "team"
        }], "uploadnow");

        document.getElementById("userToModifyInput").value = "";
        $rootScope.loading = false;
        $scope.loadUsersAndRoles();
      }, function(error) {
        console.warn(error);
        $rootScope.loading = false;
      });
  };

  $scope.removeAccessFromUser = function(userid, roles) {
    if (!roles || roles.length === 0) {
      console.warn("no roles were requested to be removed. cant do anything");
      $scope.application.bug("There was a problem performing this operation. Please report this.");
    }
    // Prevent an admin from removing him/herself from a corpus if there are no other admins; This
    // helps to avoid a situation in which there is no admin for a
    // corpus
    if (roles === ["admin"] && $scope.users.admins.length < 2) {
      if ($scope.users.admins[0].username.indexOf(userid) > -1) {
        $scope.application.bug("You cannot remove the final admin from a corpus.\nPlease add someone else as corpus admin before removing the final admin.");
        return;
      }
    }
    var referingNoun = userid;
    if (referingNoun === $rootScope.user.username) {
      referingNoun = "yourself";
    }

    var r = confirm("Are you sure you want to remove " + roles.join(" ") + " access from " + referingNoun + " on " + $rootScope.corpus.title);
    if (r === true) {

      var dataToPost = {};
      dataToPost.username = $rootScope.user.username.trim();
      dataToPost.password = $rootScope.loginInfo.password.trim();
      dataToPost.serverCode = $rootScope.serverCode;
      dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");
      dataToPost.pouchname = $rootScope.corpus.pouchname;

      dataToPost.users = [{
        username: userid,
        remove: roles,
        add: []
      }];

      Data.removeroles(dataToPost)
        .then(function(response) {
          if (debugging) {
            console.log(response);
          }
          $scope.loadedPermissionsForTeam = "";
          $scope.loadUsersAndRoles();
          var indirectObjectString = roles.join(" ") + "access from <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a>";
          $scope.addActivity([{
            verb: "removed",
            verbicon: "icon-remove-sign",
            directobjecticon: "icon-user",
            directobject: userid,
            indirectobject: indirectObjectString,
            teamOrPersonal: "personal"
          }, {
            verb: "removed",
            verbicon: "icon-remove-sign",
            directobjecticon: "icon-user",
            directobject: userid,
            indirectobject: indirectObjectString,
            teamOrPersonal: "team"
          }], "uploadnow");

        });
    }
  };


  // $scope.commaList = function(tags) {
  //   var dataString = "";
  //   for (var i = 0; i < tags.length; i++) {
  //     if (i < (tags.length - 1)) {
  //       if (tags[i].tag) {
  //         dataString = dataString + tags[i].tag + ", ";
  //       }
  //     } else {
  //       if (tags[i].tag) {
  //         dataString = dataString + tags[i].tag;
  //       }
  //     }
  //   }
  //   if (dataString === "") {
  //     return "Tags";
  //   }
  //   return dataString;
  // };

  // Paginate data tables

  $scope.numberOfResultPages = function(numberOfRecords) {
    if (!numberOfRecords) {
      return 0;
    }
    var resultSize = $rootScope.resultSize;
    if (resultSize === "all") {
      resultSize = $scope.allData.length;
    }
    var numberOfPages = Math.ceil(numberOfRecords / resultSize);
    // console.log("requesting numberOfResultPages" + numberOfPages);
    return numberOfPages;
  };

  $scope.loadPaginatedData = function(why) {

    console.log("dont need loadPaginatedData anymore  ");
    if (true) {
      return;
    }
    console.log("Loading paginated data ", why);
    var resultSize = $rootScope.resultSize;
    if (resultSize === "all") {
      resultSize = $scope.allData.length;
    }
    var lastRecordOnPage = (($rootScope.currentPage + 1) * resultSize);
    var firstRecordOnPage = lastRecordOnPage - resultSize;

    if ($scope.allData) {
      $scope.data = $scope.allData.slice(firstRecordOnPage, lastRecordOnPage);
    }
  };

  //TODO whats wrong with ng-cloak? woudlnt that solve this?
  $timeout(function() {
    if (document.getElementById("hideOnLoad")) {
      document.getElementById("hideOnLoad").style.visibility = "visible";
    }
  }, 100);



  // $scope.testFunction = function() {
  //   console.log($rootScope.currentPage);
  // };

  /**
   *  changes the current page, which is watched in a directive, which in turn calls loadPaginatedData above
   * @return {[type]} [description]
   */
  $scope.pageForward = function() {
    $scope.activeDatumIndex = null;
    $rootScope.currentPage = $rootScope.currentPage + 1;
  };

  /**
   *  changes the current page, which is watched in a directive, which in turn calls loadPaginatedData above
   * @return {[type]} [description]
   */
  $scope.pageBackward = function() {
    $scope.activeDatumIndex = null;
    $rootScope.currentPage = $rootScope.currentPage - 1;
  };


  $rootScope.$watch('currentPage', function(newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.loadPaginatedData();
    } else {
      console.warn("currentPage changed, but is the same as before, not paginating data.", newValue, oldValue);
    }
  });

  $scope.flagAsDeleted = function(json, datum) {
    json.trashed = "deleted";
    if (datum) {
      $rootScope.markAsNotSaved(datum);
    }
  };

  $scope.deleteAttachmentFromCorpus = function(datum, filename, description) {
    if ($rootScope.writePermissions === false) {
      $rootScope.notificationMessage = "You do not have permission to delete attachments.";
      $rootScope.openNotification();
      return;
    }
    var r = confirm("Are you sure you want to put the file " + description + " (" + filename + ") in the trash?");
    if (r === true) {
      var record = datum.id + "/" + filename;
      console.log(record);
      Data.async($rootScope.corpus.pouchname, datum.id)
        .then(function(originalRecord) {
          // mark as trashed in scope
          var inDatumAudioFiles = false;
          for (var i in datum.audioVideo) {
            if (datum.audioVideo[i].filename === filename) {
              datum.audioVideo[i].description = datum.audioVideo[i].description + ":::Trashed " + Date.now() + " by " + $rootScope.user.username;
              datum.audioVideo[i].trashed = "deleted";
              inDatumAudioFiles = true;
              // mark as trashed in database record
              for (var k in originalRecord.audioVideo) {
                if (originalRecord.audioVideo[k].filename === filename) {
                  originalRecord.audioVideo[k] = datum.audioVideo[i];
                }
              }
            }
          }
          if (datum.audioVideo.length === 0) {
            datum.hasAudio = false;
          }
          originalRecord.audioVideo = datum.audioVideo;
          //Upgrade to v1.90
          if (originalRecord.attachmentInfo) {
            delete originalRecord.attachmentInfo;
          }
          // console.log(originalRecord);
          Data.saveCouchDoc($rootScope.corpus.pouchname, originalRecord)
            .then(function(response) {
              console.log("Saved attachment as trashed.");
              if (debugging) {
                console.log(response);
              }
              var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.pouchname + "'>" + $rootScope.corpus.title + "</a>";
              $scope.addActivity([{
                verb: "deleted",
                verbicon: "icon-trash",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + filename + "'>the audio file " + description + " (" + filename + ") on " + datum.utterance + "</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "personal"
              }, {
                verb: "deleted",
                verbicon: "icon-trash",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + filename + "'>an audio file on " + datum.utterance + "</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "team"
              }], "uploadnow");

              // Dont actually let users delete data...
              // Data.async($rootScope.corpus.pouchname, datum.id)
              // .then(function(record) {
              //   // Delete attachment info for deleted record
              //   for (var key in record.attachmentInfo) {
              //     if (key === filename) {
              //       delete record.attachmentInfo[key];
              //     }
              //   }
              //   Data.saveCouchDoc($rootScope.corpus.pouchname, datum.id, record, record._rev)
              // .then(function(response) {
              //     if (datum.audioVideo.length === 0) {
              //       datum.hasAudio = false;
              //     }
              //     console.log("File successfully deleted.");
              //   });
              // });
            });
        });
    }
  };

  $scope.triggerExpandCollapse = function() {
    if ($scope.expandCollapse === true) {
      $scope.expandCollapse = false;
    } else {
      $scope.expandCollapse = true;
    }
  };

  $scope.getSavedState = function() {
    if ($scope.saved === "yes") {
      return {
        state: "Saved",
        class: "btn btn-success",
        icon: "fa whiteicon fa-folder",
        text: $rootScope.contextualize("locale_Saved")
      };
    } else if ($scope.saved === "no") {
      return {
        state: "Save",
        class: "btn btn-danger",
        icon: "fa whiteicon fa-save",
        text: $rootScope.contextualize("locale_Save")
      };
    } else {
      return {
        state: "Saving",
        class: "pulsing",
        icon: "fa whiteicon fa-folder-open",
        text: $rootScope.contextualize("locale_Saving")
      };
    }
  };

  $scope.contactUs = function() {
    window.open("https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform");
  };

  $scope.setDataEntryFocusOn = function(targetDatumEntryDomElement) {
    $timeout(function() {
      if (targetDatumEntryDomElement && targetDatumEntryDomElement[1]) {
        console.log("old focus", document.activeElement);
        targetDatumEntryDomElement[1].focus();
        console.log("new focus", document.activeElement);
      } else {
        console.warn("requesting focus on an element that doesnt exist.");
      }
    }, 500);
  };

  // Use this function to show objects on loading without displacing other elements
  $scope.hiddenOnLoading = function() {
    if ($rootScope.loading !== true) {
      return {
        'visibility': 'hidden'
      };
    } else {
      return {};
    }
  };

  // Hide loader when all content is ready
  $rootScope.$on('$viewContentLoaded', function() {
    // Return user to saved state, if it exists; only recover saved state on reload, not menu navigate
    if ($scope.appReloaded !== true) {
      $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
      // Update users to new saved state preferences if they were absent
      if (!$scope.scopePreferences.savedState) {
        $scope.scopePreferences.savedState = {};
        localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
        $scope.documentReady = true;
      } else if ($scope.scopePreferences.savedState && $scope.scopePreferences.savedState.server && $scope.scopePreferences.savedState.username && $scope.scopePreferences.savedState.password) {
        $rootScope.serverCode = $scope.scopePreferences.savedState.server;
        var auth = {};
        auth.server = $scope.scopePreferences.savedState.server;
        auth.user = $scope.scopePreferences.savedState.username;
        try {
          auth.password = sjcl.decrypt("password", $scope.scopePreferences.savedState.password);
        } catch (err) {
          // User's password has not yet been encrypted; encryption will be updated on login.
          auth.password = $scope.scopePreferences.savedState.password;
        }
        $scope.loginUser(auth);

      } else {
        $rootScope.openWelcomeNotificationDeprecated();
        $scope.documentReady = true;
      }
    }
  });

  $scope.forgotPasswordInfo = {};
  $scope.forgotPasswordSubmit = function() {
    if (!$scope.forgotPasswordInfo.email) {
      $rootScope.notificationMessage = "You must enter the email you used when you registered (email is optional, If you did not provde an email you will need to contact us for help).";
      $rootScope.openNotification();
      return;
    }

    Data.forgotPassword($scope.forgotPasswordInfo)
      .then(function(response) {
        if (debugging) {
          console.log(response);
        }

        $scope.forgotPasswordInfo = {};
        $scope.showForgotPassword = false;
        $rootScope.notificationMessage = response.data.info.join(" ") || "Successfully emailed password.";
        $rootScope.openNotification();

      }, function(err) {
        console.warn(err);
        var message = "";
        if (err.status === 0) {
          message = "are you offline?";
          if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
            message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
          }
        }
        if (err && err.status >= 400 && err.data.userFriendlyErrors) {
          message = err.data.userFriendlyErrors.join(" ");
        } else {
          message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
        }

        $scope.showForgotPassword = false;
        $rootScope.notificationMessage = message;
        $rootScope.openNotification();

        // console.log(reason);
        // var message = "Please report this.";
        // if (reason.status === 0) {
        //   message = "Are you offline?";
        // } else {
        //   message = reason.data.userFriendlyErrors.join(" ");
        // }
        // $rootScope.notificationMessage = "Error updating password. " + message;
        // $rootScope.openNotification();
      });
  };

  $scope.resetPasswordInfo = {};
  $scope.changePasswordSubmit = function() {
    if ($scope.resetPasswordInfo.confirmpassword !== $scope.resetPasswordInfo.newpassword) {
      $rootScope.notificationMessage = "New passwords don't match.";
      $rootScope.openNotification();
      return;
    }

    $scope.resetPasswordInfo.username = $rootScope.user.username;
    Data.changePassword($scope.resetPasswordInfo)
      .then(function(response) {
        if (debugging) {
          console.log(response);
        }
        Data.login($scope.resetPasswordInfo.username, $scope.resetPasswordInfo.confirmpassword);


        $scope.scopePreferences.savedState.password = sjcl.encrypt("password", $scope.resetPasswordInfo.confirmpassword);
        localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));

        $scope.resetPasswordInfo = {};
        $scope.showResetPassword = false;
        $rootScope.notificationMessage = response.data.info.join(" ") || "Successfully updated password.";
        $rootScope.openNotification();


      }, function(err) {
        console.warn(err);
        var message = "";
        if (err.status === 0) {
          message = "are you offline?";
          if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
            message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
          }
        }
        if (err && err.status >= 400 && err.data.userFriendlyErrors) {
          message = err.data.userFriendlyErrors.join(" ");
        } else {
          message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
        }
        $scope.showResetPassword = false;

        $rootScope.notificationMessage = message;
        $rootScope.openNotification();

      });
  };


  $scope.newRecordHasBeenEditedButtonClass = function() {
    if ($rootScope.newRecordHasBeenEdited === true) {
      return "btn btn-danger";
    } else {
      return "btn btn-primary";
    }
  };


  $scope.mainBodyClass = function() {
    if ($rootScope.activeSubMenu === 'searchMenu') {
      return "mainBodySearching";
    } else {
      return "mainBody";
    }
  };

  window.onbeforeunload = function(e) {
    console.warn(e);
    if ($scope.application && $scope.application.authentication && $scope.application.authentication.user && typeof $scope.application.authentication.user.save === "function") {
      $scope.application.authentication.user.save();
    }
    if ($scope.saved === "no") {
      return "You currently have unsaved changes!\n\nIf you wish to save these changes, cancel and then save before reloading or closing this app.\n\nOtherwise, any unsaved changes will be abandoned.";
    } else {
      return;
    }
  };

};
SpreadsheetStyleDataEntryController.$inject = ["$scope", "$rootScope", "$resource", "$filter", "$document", "Data", "Servers", "md5", "$timeout", "$modal", "$log", "$http"];
angular.module("spreadsheetApp").controller("SpreadsheetStyleDataEntryController", SpreadsheetStyleDataEntryController);
