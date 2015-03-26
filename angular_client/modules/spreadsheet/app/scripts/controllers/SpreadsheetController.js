/* globals  FieldDB, sjcl, _, confirm, alert, prompt */
'use strict';
console.log("Declaring Loading the SpreadsheetStyleDataEntryController.");

/**
 * @ngdoc function
 * @name spreadsheetApp.controller:SpreadsheetStyleDataEntryController
 * @description
 * # SpreadsheetStyleDataEntryController
 * Controller of the spreadsheetApp
 */

var SpreadsheetStyleDataEntryController = function($scope, $rootScope, $resource, $filter, $document, Data, md5, $timeout, $modal, $log, $http) {
  console.log(" Loading the SpreadsheetStyleDataEntryController.");
  var debugging = false;
  if (debugging) {
    console.log($scope, $rootScope, $resource, $filter, $document, Data, md5, $timeout, $modal, $log, $http);
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


  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && $rootScope.contextualize) {
    $rootScope.application = $rootScope.application || FieldDB.FieldDBObject.application;
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
      });
      $http.get("locales/es/messages.json").then(function(result) {
        var locales = result.data;
        console.log("Retrieving spanish localization", locales);
        FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("es", locales);
      });
      $http.get("locales/fr/messages.json").then(function(result) {
        var locales = result.data;
        console.log("Retrieving french localization", locales);
        FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("fr", locales);
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

  $rootScope.appVersion = "2.48.24.12.36ss";

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
    // reRouteUser("welcome");
  };

  var processServerContactError = function(err) {
    $rootScope.loading = false;
    console.warn(err);

    var message = "";
    if (err.status === 0) {
      message = "are you offline?";
      if ($rootScope.application.brand === "mcgill" || $rootScope.application.brand === "concordia" || $rootScope.application.brand === "localhost") {
        message = "Cannot contact " + $rootScope.application.connection.userFriendlyServerName + " server, have you accepted the server's security certificate? (please refer to your registration email)";
      }
    }
    if (err && err.status >= 400 && err.data.userFriendlyErrors) {
      message = err.data.userFriendlyErrors.join(" ");
    } else {
      message = "Cannot contact " + $rootScope.application.connection.userFriendlyServerName + " server, please report this.";
    }
    $rootScope.application.bug(message);

    window.setTimeout(function() {
      window.open("https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform");
    }, 1500);

  };
  document.addEventListener("notauthenticated", function() {
    if ($rootScope.application) {
      $rootScope.application.warn("user isn't able to see anything, show them the welcome page");
    }
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

  // Set/get/update user preferences
  var defaultPreferences = {
    "version": $rootScope.appVersion,
    "savedState": {
      "connection": "",
      "username": "",
      "password": ""
    }
  };

  //TODO move the default preferences somewher the SettingsController can access them. for now here is a hack for #1290
  window.defaultPreferences = defaultPreferences;


  $rootScope.updateAvailableFieldsInColumns = function() {
    if (!$rootScope.application || !$rootScope.application.corpus || !$rootScope.application.corpus.datumFields || !$rootScope.application.corpus.datumFields._collection || $rootScope.application.corpus.datumFields._collection.length < 1) {
      console.warn("the corpus isnt ready, not configuring the available fields in columns.");
      return;
    }

    $rootScope.application.corpus.fieldsInColumns = $rootScope.application.corpus.fieldsInColumns || {
      first: [],
      second: [],
      third: [],
      fourth: []
    };

    try {
      $scope.judgementHelpText = $rootScope.application.corpus.datumFields.judgement.help;
    } catch (e) {
      console.warn("couldnt get the judgemetn help text for htis corpus for hte data entry hints");
    }

    var preferedSpreadsheetShape = $rootScope.application.corpus.prefs.preferedSpreadsheetShape;

    if (preferedSpreadsheetShape.rows > $rootScope.application.corpus.datumFields._collection.length - 1) {
      preferedSpreadsheetShape.rows = preferedSpreadsheetShape.rows || Math.ceil($rootScope.application.corpus.datumFields._collection.length / preferedSpreadsheetShape.columns);
    }
    if ($rootScope.application.corpus.datumFields.indexOf("syntacticTreeLatex") < 6) {
      $rootScope.application.corpus.upgradeCorpusFieldsToMatchDatumTemplate("fulltemplate");
    }

    if (preferedSpreadsheetShape.columns === 1) {
      $rootScope.application.corpus.fieldsInColumns.first = $rootScope.application.corpus.datumFields._collection.slice(
        1,
        preferedSpreadsheetShape.rows + 1
      );
      $rootScope.application.corpus.fieldsInColumns.second = [];
      $rootScope.application.corpus.fieldsInColumns.third = [];
      $rootScope.application.corpus.fieldsInColumns.columnWidthClass = "col-xs-12 col-sm-12 col-md-8 col-lg-8";
      $rootScope.application.corpus.fieldsInColumns.detailsWidthClass = "col-xs-12 col-sm-12 col-md-3 col-lg-3";
    } else if (preferedSpreadsheetShape.columns === 2) {
      $rootScope.application.corpus.fieldsInColumns.first = $rootScope.application.corpus.datumFields._collection.slice(
        1,
        preferedSpreadsheetShape.rows + 1
      );
      $rootScope.application.corpus.fieldsInColumns.second = $rootScope.application.corpus.datumFields._collection.slice(
        preferedSpreadsheetShape.rows + 1,
        preferedSpreadsheetShape.rows * 2 + 1
      );
      $rootScope.application.corpus.fieldsInColumns.third = [];
      $rootScope.application.corpus.fieldsInColumns.columnWidthClass = "col-xs-12 col-sm-6 col-md-5 col-lg-5";
      $rootScope.application.corpus.fieldsInColumns.detailsWidthClass = "col-xs-12 col-sm-12 col-md-2 col-lg-2";
    } else if (preferedSpreadsheetShape.columns === 3) {
      $rootScope.application.corpus.fieldsInColumns.first = $rootScope.application.corpus.datumFields._collection.slice(
        1,
        preferedSpreadsheetShape.rows + 1
      );
      $rootScope.application.corpus.fieldsInColumns.second = $rootScope.application.corpus.datumFields._collection.slice(
        preferedSpreadsheetShape.rows + 1,
        preferedSpreadsheetShape.rows * 2 + 1
      );
      $rootScope.application.corpus.fieldsInColumns.third = $rootScope.application.corpus.datumFields._collection.slice(
        preferedSpreadsheetShape.rows * 2 + 1,
        preferedSpreadsheetShape.rows * 3 + 1
      );
      $rootScope.application.corpus.fieldsInColumns.columnWidthClass = "col-xs-12 col-sm-12 col-md-4 col-lg-4";
      $rootScope.application.corpus.fieldsInColumns.detailsWidthClass = "col-xs-12 col-sm-12 col-md-12 col-lg-12";
    }
  };

  var updateAndOverwritePreferencesToCurrentVersion = function() {
    $scope.scopePreferences = $scope.scopePreferences || localStorage.getItem('SpreadsheetPreferences') || JSON.stringify(defaultPreferences);
    var prefsWereString;
    try {
      prefsWereString = JSON.parse($scope.scopePreferences);
    } catch (e) {
      console.warn("cant set $scope.scopePreferences, might have already been an object", e);
    }
    if (prefsWereString) {
      $scope.scopePreferences = prefsWereString;
    }

    /** Prior to 1.37 wipe personalization and use current defaults */
    if (!$scope.scopePreferences.version) {
      $rootScope.application.bug("Welcome to the Spring Field Method's session!\n\n We have introduced a new data entry template in this version. \nYou might want to review your settings to change the order and number of fields in the data entry template. Current defaults are set to 2 columns, with 3 rows each.");
      // localStorage.clear(); //why?? left over from debugging?
      // localStorage.setItem('SpreadsheetPreferences', JSON.stringify(defaultPreferences));
      $scope.scopePreferences = JSON.stringify(defaultPreferences);
      console.log("ignoring users preferences.");
    }

    var pieces = $scope.scopePreferences.version.split(".");
    var year = pieces[0],
      week = pieces[1];
    if (year < 2 || week < 47) {
      $scope.scopePreferences = JSON.stringify(defaultPreferences);
      console.log("ignoring users preferences.");
    }

    $scope.scopePreferences.savedState = $scope.scopePreferences.savedState || {};
    if ($rootScope.application.authentication.user &&
      $rootScope.application.authentication.user.username &&
      $rootScope.loginInfo &&
      $rootScope.loginInfo.password &&
      $rootScope.loginInfo.password.length > 2) {

      $scope.scopePreferences.savedState.username = $rootScope.application.authentication.user.username;
      $scope.scopePreferences.savedState.password = sjcl.encrypt("password", $rootScope.loginInfo.password);
    }

    localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
  };

  // Set scope variables
  $scope.documentReady = false;
  $scope.orderProp = "dateEntered";
  $rootScope.currentPage = $rootScope.currentPage || 0;
  $scope.reverse = true;
  // $scope.activeDatumIndex = 'newEntry';
  $scope.dataentry = false;
  $scope.searching = false;
  $rootScope.activeSubMenu = 'none';
  $scope.showCreateNewSessionDropdown = false;
  $scope.showEditSessionDetailsDropdown = false;
  $scope.currentDate = new Date();
  $scope.activities = [];

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
    reRouteUser("spreadsheet");
  };

  $scope.navigateVerifySaved = function(itemToDisplay) {
    if ($rootScope.application.corpus.currentSession.docs.unsaved) {
      $rootScope.notificationMessage = "Please save changes before continuing.";
      $rootScope.openNotification();
    } else if ($rootScope.application.corpus.currentSession.docs.saving) {
      $rootScope.notificationMessage = "Changes are currently being saved.\nPlease wait until this operation is done.";
      $rootScope.openNotification();
    } else if ($rootScope.application.corpus.currentSession.newDatum.unsaved) {
      $rootScope.notificationMessage = "Please click \'Create New\' and then save your changes before continuing.";
      $rootScope.openNotification();
    } else {

      // $scope.appReloaded = true;

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
          reRouteUser("spreadsheet");
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
          reRouteUser("spreadsheet");
          break;
        case "register":
          reRouteUser("register");
          break;
        default:
          reRouteUser("spreadsheet");
          $scope.changeActiveSubMenu(itemToDisplay);
      }
    }
  };


  // Get sessions for dbname; select specific session on saved state load
  $scope.loadSessions = function() {
    /* reset the sessions list if the corpus has changed */
    if ($rootScope.application.corpus && $rootScope.application.corpus.dbname && $rootScope.application.sessionsList && $rootScope.application.sessionsList.docs && $rootScope.application.sessionsList.docs.length > 0 && $rootScope.application.sessionsList.dbname !== $rootScope.application.corpus.dbname) {
      $rootScope.application.previousSessionsList = $rootScope.application.sessionsList;
      $rootScope.application.sessionsList = new FieldDB.DataList({
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
    if ($rootScope.application.sessionsList && $rootScope.application.sessionsList.docs && $rootScope.application.sessionsList.docs.length > 0 && $rootScope.application.sessionsList.dbname === $rootScope.application.corpus.dbname) {
      console.log("sessions are already loaded", $rootScope.application.sessionsList);
      if (!$rootScope.application.corpus.currentSession && $rootScope.application.sessionsList.docs && $rootScope.application.sessionsList.docs._collection && $rootScope.application.sessionsList.docs._collection.length > 0) {
        console.log("   but corpus.currentSession wasnt defined, this should never happen.");
        $rootScope.application.corpus.currentSession = $rootScope.application.sessionsList.docs._collection[$rootScope.application.sessionsList.docs.length - 1];
      }
      return;
    }

    // $scope.appReloaded = true;
    // $rootScope.loading = true;
    if ($rootScope.application.sessionsList.length > 0) {
      console.log("  sessions are already loaded", $rootScope.application.sessionsList);
      return;
    }

    $rootScope.application.sessionsList.dbname = $rootScope.application.corpus.dbname;
    $rootScope.application.corpus.loading = true;
    $rootScope.application.corpus.fetchCollection($rootScope.application.sessionsList.api).then(function(results) {
      if ($rootScope.application.sessionsList.dbname !== $rootScope.application.corpus.dbname) {
        console.log("  the session list and corpus dont match they arent from the same databse, not adding these results to the list");
        return;
      }
      if (results.length <= $rootScope.application.sessionsList.length) {
        console.log("  sessions are already loaded", results, $rootScope.application.sessionsList);
        return;
      }

      if ($rootScope.application.sessionsList.confidential === $rootScope.application.corpus.confidential) {
        $rootScope.application.sessionsList.confidential = $rootScope.application.corpus.confidential;
      }
      results = results.map(function(doc) {
        doc.url = $rootScope.application.corpus.url;
        return doc;
      });
      $rootScope.application.sessionsList.populate(results);

      // $rootScope.application.sessionsList.push({
      //   title: $rootScope.contextualize('locale_view_all_sessions_dropdown') || "All",
      //   _id: "none"
      // });

      /* Set the current session either form the user's last page load or to be the most recent session */
      if (!$rootScope.application.corpus.currentSession && $rootScope.application.sessionsList.docs && $rootScope.application.sessionsList.docs._collection && $rootScope.application.sessionsList.docs._collection.length > 0) {
        $rootScope.application.corpus.currentSession = $rootScope.application.sessionsList.docs._collection[$rootScope.application.sessionsList.docs.length - 1];
        $scope.currentSessionWasNotSetByAHuman = true;
      }
      $scope.newSession = $rootScope.application.corpus.newSession();
      $scope.documentReady = true;
      $rootScope.application.corpus.loading = $rootScope.loading = false;
    }, function(error) {
      $rootScope.application.corpus.loading = $rootScope.loading = false;
      processServerContactError(error);
    });
  };

  // Fetch data from server and put into template scope
  $scope.loadData = function() {

    console.log("loadData is deprecated.");
    if (true) {
      return;
    }
    console.warn("Clearing search terms");
    $scope.searchHistory = "";
  };

  $scope.loadAutoGlosserRules = function() {
    // Get precedence rules for Glosser
    Data.glosser($rootScope.application.corpus.dbname)
      .then(function(rules) {
        localStorage.setItem($rootScope.application.corpus.dbname + "precedenceRules", JSON.stringify(rules));

        // Reduce the rules such that rules which are found in multiple
        // source words are only used/included once.
        var reducedRules = _.chain(rules).groupBy(function(rule) {
          return rule.key.x + "-" + rule.key.y;
        }).value();

        // Save the reduced precedence rules in localStorage
        localStorage.setItem($rootScope.application.corpus.dbname + "reducedRules",
          JSON.stringify(reducedRules));
      }, function(error) {
        console.log("Error retrieving precedence rules.", error);
      });

    // Get lexicon for Glosser and organize based on frequency
    Data.lexicon($rootScope.application.corpus.dbname).then(function(lexicon) {
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
        $rootScope.application.corpus.dbname + "lexiconResults", JSON.stringify(sortedLexicon));
    }, processServerContactError);
  };


  $scope.loginUser = function(loginDetails) {
    if (!loginDetails) {
      $rootScope.notificationMessage = "Please login.";
      $rootScope.openNotification();
      return;
    }
    $rootScope.clickSuccess = true;
    $rootScope.loginInfo = $rootScope.loginInfo || {};
    $rootScope.loginInfo.username = loginDetails.username.trim().toLowerCase().replace(/[^0-9a-z]/g, "");
    $rootScope.loginInfo.password = loginDetails.password;
    $rootScope.loginInfo.brand = $rootScope.application.brand;
    $rootScope.loginInfo.connection = $rootScope.application.connection;

    // if (auth.user === "senhorzinho") {
    //   var r = confirm("Hello, developer! Would you like to enter developer mode?");
    //   if (r === true) {
    //     $rootScope.developer = true;
    //   }
    // }
    $rootScope.loading = true;

    $rootScope.application.authentication.resumingSessionPromise.then(function(user) {
      if (!user.rev && !$scope.loginUserFromScratchIsRunning) {
        console.warn("this user doesnt have any details on this device, forcing them to login completely.");
        $scope.loginUserFromScratch(loginDetails);
        return;
      }

    }, /* login failure */ function(reason) {
      $rootScope.notificationMessage = "Error logging in.\n" + reason;
      $rootScope.openNotification(null, true);
      $rootScope.loading = false;
    });
  };

  document.addEventListener("authenticated", function() {
    if (!$rootScope.application.authentication.user || !$rootScope.application.authentication.user.rev) {
      $rootScope.openWelcomeNotificationDeprecated();
      return;
    }
    $scope.corpora = $scope.corpora || new FieldDB.Collection();

    // Update saved state in Preferences
    updateAndOverwritePreferencesToCurrentVersion();

    // if ($rootScope.application.authentication.user.mostRecentIds && $rootScope.application.authentication.user.mostRecentIds.connection && $rootScope.application.authentication.user.mostRecentIds.connection.dbname) {
    //   $scope.selectCorpus($rootScope.application.authentication.user.mostRecentIds.connection);
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

  $scope.loginUserFromScratch = function(loginDetails) {
    if ($scope.loginUserFromScratchIsRunning) {
      console.warn("loginUserFromScratch is already running");
      return;
    }
    if (!$rootScope.application || !$rootScope.application.connection || !$rootScope.application.connection.authUrl) {
      $rootScope.application.bug("Unable to log in, please select a server.");
      return;
    }

    $scope.loginUserFromScratchIsRunning = true;

    $rootScope.clickSuccess = true;

    $rootScope.loginInfo = $rootScope.loginInfo || {};
    $rootScope.loginInfo.username = loginDetails.username.trim().toLowerCase().replace(/[^0-9a-z]/g, "");
    $rootScope.loginInfo.password = loginDetails.password;
    $rootScope.loginInfo.authUrl = $rootScope.application.connection.authUrl;

    $rootScope.application.authentication.login($rootScope.loginInfo).then(function() {
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
      $scope.loginUserFromScratchIsRunning = false;
      processServerContactError(error);
    });
  };

  $scope.logout = function() {
    localStorage.removeItem('SpreadsheetPreferences');
    $rootScope.application.authentication.logout();
    // $scope.reloadPage();
  };

  $rootScope.setTemplateUsingCorpusPreferedTemplate = function() {
    if (true) {
      console.log("setting templates is deprecated.");
      return;
    }
  };

  $scope.loadCorpusFieldsAndPreferences = function() {
    $scope.updateAvailableFieldsInColumns();
    $scope.loadSessions();
    $scope.loadUsersAndRoles();
  };

  $scope.selectCorpus = function(selectedConnection) {
    if (!selectedConnection) {
      $rootScope.notificationMessage = "Please select a database.";
      $rootScope.openNotification();
      return;
    }
    if (typeof selectedConnection === "string") {
      selectedConnection = {
        dbname: selectedConnection
      };
    }
    selectedConnection.dbname = selectedConnection.dbname || selectedConnection.dbname;
    if (!selectedConnection.dbname) {
      console.warn("Somethign went wrong, the user selected a corpus connection that had no db info", selectedConnection);
      return;
    }
    if ($rootScope.application.corpus && $rootScope.application.corpus.dbname !== selectedConnection.dbname) {
      console.warn("The corpus already existed, and it was not the same as this one, removing it to use this one " + selectedConnection.dbname);
    }
    if ($scope.corpora && $scope.corpora[selectedConnection.dbname]) {
      $rootScope.application.corpus = $scope.corpora[selectedConnection.dbname];
      return;
    }

    $rootScope.application.corpus = new FieldDB.Corpus();
    $rootScope.application.corpus.loadCorpusByDBname(selectedConnection.dbname).then(function(results) {
      console.log("loaded the corpus", results);
      $scope.corpora.add($rootScope.application.corpus);
      selectedConnection.parent = $rootScope.application.corpus;

      $scope.addActivity([{
        verb: "opened ",
        verbicon: "icon-eye",
        directobjecticon: "icon-cloud",
        directobject: $rootScope.application.corpus.title,
        indirectobject: "",
        teamOrPersonal: "personal"
      }], "uploadnow");

      $scope.addActivity([{
        verb: "opened ",
        verbicon: "icon-eye",
        directobjecticon: "icon-cloud",
        directobject: $rootScope.application.corpus.title,
        indirectobject: "",
        teamOrPersonal: "team"
      }], "uploadnow");
      $scope.loadCorpusFieldsAndPreferences();

    });
  };

  $rootScope.$watch('corpus.dbname', function(newValue, oldValue) {
    if (!$rootScope.application.corpus || !$rootScope.application.corpus.datumFields || !$rootScope.application.corpus._rev) {
      console.log("the corpus changed but it wasn't ready yet");
      return;
    }
    if (newValue === oldValue && newValue === $rootScope.application.corpus.dbname) {
      console.log("the corpus changed but it was the same corpus, not doing anything.");
      return;
    }
    $scope.loadCorpusFieldsAndPreferences();
  });

  $rootScope.$watch('corpus.currentSession', function(newValue, oldValue) {
    if (!$rootScope.application.corpus || !$rootScope.application.corpus.currentSession || !$rootScope.application.corpus.currentSession.goal) {
      return;
    }

    console.log("corpus.currentSession changed", oldValue);

    if (!$rootScope.application.corpus.currentSession.newDatum) {
      $rootScope.application.corpus.currentSession.newDatum = $rootScope.application.corpus.newDatum();
      $rootScope.application.corpus.currentSession.newDatum.session = $rootScope.application.corpus.currentSession;
    }

    $rootScope.application.authentication.user.mostRecentIds.sessionid = $rootScope.application.corpus.currentSession.id;

    if ($scope.currentSessionWasNotSetByAHuman) {
      $scope.currentSessionWasNotSetByAHuman = false;
    } else {
      reRouteUser("spreadsheet");
    }
    $scope.dataentry = true;
  });

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
    $rootScope.application.corpus.currentSession.save().then(function() {
      var indirectObjectString = "in <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a>";
      $scope.addActivity([{
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-calendar",
        directobject: "<a href='#session/" + $rootScope.application.corpus.currentSession.id + "'>" + $rootScope.application.corpus.currentSession.goal + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-calendar",
        directobject: "<a href='#session/" + $rootScope.application.corpus.currentSession.id + "'>" + $rootScope.application.corpus.currentSession.goal + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }], "uploadnow");

      // $rootScope.application.corpus.currentSession.docs.map(function(datum) {
      //   datum.session = $rootScope.application.corpus.currentSession;
      //   datum.save().then(function() {
      //       $rootScope.loading = false;
      //     },
      //     function() {
      //       $rootScope.application.bug("There was an error accessing the record.\nTry refreshing the page");
      //     });
      // });
    });
  };

  $scope.deleteEmptySession = function() {
    $scope.deleteSession();
  };

  $scope.deleteSession = function() {
    if (!$rootScope.application.corpus.currentSession || $rootScope.application.corpus.currentSession.id === "none") {
      $rootScope.notificationMessage = "You must select a session to delete.";
      $rootScope.openNotification();
    } else {
      var r = confirm("Are you sure you want to put this session in the trash?");
      if (!r) {
        return;
      }
      $rootScope.application.corpus.currentSession.trashed = "deleted";
      $rootScope.application.corpus.currentSession.save().then(function(response) {
        if (debugging) {
          console.log(response);
        }
        var indirectObjectString = "in <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a>";
        $scope.addActivity([{
          verb: "deleted",
          verbicon: "icon-trash",
          directobjecticon: "icon-calendar",
          directobject: "<a href='#session/" + $rootScope.application.corpus.currentSession.id + "'>an elicitation session</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "personal"
        }, {
          verb: "deleted",
          verbicon: "icon-trash",
          directobjecticon: "icon-calendar",
          directobject: "<a href='#session/" + $rootScope.application.corpus.currentSession.id + "'>an elicitation session</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "team"
        }], "uploadnow");

        // Remove session from scope
        $rootScope.application.sessionsList.docs.remove($rootScope.application.corpus.currentSession);
        if ($rootScope.application.sessionsList.docs._collection.length > 0) {
          $rootScope.application.corpus.currentSession = $rootScope.application.sessionsList.docs._collection[$rootScope.application.sessionsList.docs._collection.length - 1];
        } else {
          $rootScope.application.bug("Please create an elicitation session before continuing.");
          reRouteUser("corpora_list");
        }

      }, function(error) {
        console.warn("there was an error deleting a session", error);
        $rootScope.application.bug("Error deleting session.\nTry refreshing the page.");
      });
    }
  };


  $scope.createNewSession = function(newSession) {
    $rootScope.loading = true;
    newSession.user = $rootScope.application.authentication.user.userMask;
    newSession.save().then(function() {

      var indirectObjectString = "in <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a>";
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

      $rootScope.application.corpus.currentSession = $rootScope.application.sessionsList.add(newSession);
      $scope.dataentry = true;
      $rootScope.loading = false;
      reRouteUser("spreadsheet");
    });
  };


  $scope.reloadPage = function() {
    if ($rootScope.application.corpus.currentSession.docs.unsaved) {
      $rootScope.notificationMessage = "Please save changes before continuing.";
      $rootScope.openNotification();
    } else if ($rootScope.application.corpus.currentSession.docs.saving) {
      $rootScope.notificationMessage = "Changes are currently being saved.\nYou may refresh the data once this operation is done.";
      $rootScope.openNotification();
    } else {
      reRouteUser("");
      window.location.reload();
    }
  };


  $scope.deleteRecord = function(datum) {
    var r;
    if (!datum.id) {
      r = confirm("This datum has never been saved, If you delete it you wont be able to recover it. Are you sure you want to delete it?");
      if (!r) {
        return;
      }
      $rootScope.application.corpus.currentSession.docs.remove(datum);
      return;
    }

    r = confirm("Are you sure you want to put this datum in the trash?");
    if (!r) {
      return;
    }
    var reason;
    while (!reason) {
      reason = prompt("Why are you putting this in the trash?");
    }

    var indirectObjectString = "in <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a>";
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


    datum.trash(reason).then(function() {
      $rootScope.application.corpus.currentSession.docs.remove(datum);
      $scope.activeDatumIndex = null;
    }, function(error) {
      console.warn(error);
      $rootScope.application.bug("Error deleting record.");
    });
  };


  $scope.createRecord = function(fieldDBDatum, $event) {
    if ($event && $event.type && $event.type === "submit" && $event.target) {
      $scope.setDataEntryFocusOn($event.target);
    }
    alert("TODO test this");

    fieldDBDatum.save().done(function(error) {
      if (!fieldDBDatum.id) {
        fieldDBDatum.warn("Couldnt contact the database to save this datum, giving a random id and putting it in the session list for saving again later", error);
        fieldDBDatum.id = FieldDB.FieldDBObject.uuidGenerator();
      }
      if (fieldDBDatum.session !== $rootScope.application.currentSession) {
        fieldDBDatum.session = $rootScope.application.currentSession;
      }
    });
    // $rootScope.application.corpus.currentSession.docs.unsaved = true;

    $rootScope.application.currentSession.add(fieldDBDatum);
    $rootScope.application.corpus.currentSession.newDatum = $rootScope.application.corpus.newDatum();


    $scope.activeDatumIndex = "newEntry";

    $rootScope.application.currentSession.render();
  };


  $rootScope.markAsNotSaved = function(datum) {
    datum.unsaved = true;
    $rootScope.application.corpus.currentSession.docs.unsaved = true;
  };

  $rootScope.markAsEdited = function(utterance, datum, $event) {

    // Update activity feed
    var indirectObjectString = "in <a href='#corpus/" +
      $rootScope.application.corpus.dbname + "'>" +
      $rootScope.application.corpus.title +
      "</a>";
    $scope.addActivity([{
      verb: "modified",
      verbicon: "icon-pencil",
      directobjecticon: "icon-list",
      directobject: "<a href='#corpus/" +
        $rootScope.application.corpus.dbname +
        "/datum/" + datum.id + "'>" +
        utterance +
        "</a> ",
      indirectobject: indirectObjectString,
      teamOrPersonal: "personal"
    }, {
      verb: "modified",
      verbicon: "icon-pencil",
      directobjecticon: "icon-list",
      directobject: "<a href='#corpus/" +
        $rootScope.application.corpus.dbname +
        "/datum/" + datum.id + "'>" +
        utterance +
        "</a> ",
      indirectobject: indirectObjectString,
      teamOrPersonal: "team"
    }]);
    datum.unsaved = true;
    $rootScope.application.corpus.currentSession.docs.unsaved = true;

    if ($event && $event.type && $event.type === "submit") {
      datum.save();
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
    comment.username = $rootScope.application.authentication.user.username;
    comment.timestamp = Date.now();
    comment.gravatar = $rootScope.application.authentication.user.gravatar || "0df69960706112e38332395a4f2e7542";
    comment.timestampModified = Date.now();
    if (!datum.comments) {
      datum.comments = [];
    }
    datum.comments.push(comment);
    datum.unsaved = true;
    $rootScope.application.corpus.currentSession.docs.unsaved = true;
    datum.dateModified = JSON.parse(JSON.stringify(new Date()));
    datum.timestamp = Date.now();
    datum.lastModifiedBy = $rootScope.application.authentication.user.username;
    // $rootScope.currentPage = 0;
    // $rootScope.editsHaveBeenMade = true;

    var indirectObjectString = "on <a href='#data/" + datum.id + "'><i class='icon-pushpin'></i> " + $rootScope.application.corpus.title + "</a>";
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
    if (comment.username !== $rootScope.application.authentication.user.username) {
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

    var indirectObjectString = "in <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a>";

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

    alert("TODO pass acitivites to save.", activities);
    $rootScope.application.corpus.currentSession.docs.save()
      .then(function(result) {
        if (result) {
          console.log(result);
        }
        // $rootScope.application.corpus.currentSession.docs.unsaved = true;
        // // $rootScope.application.bug("There was an error saving one or more records. Please try again.");
        // $rootScope.application.corpus.currentSession.docs.unsaved = false;
      });

    $rootScope.application.corpus.activityConnection.docs.save()
      .then(function(result) {
        if (result) {
          console.log(result);
        }
        // $rootScope.application.corpus.currentSession.docs.unsaved = true;
        // // $rootScope.application.bug("There was an error saving one or more records. Please try again.");
        // $rootScope.application.corpus.currentSession.docs.unsaved = false;
      });


    $rootScope.application.authentication.activityConnection.docs.save()
      .then(function(result) {
        if (result) {
          console.log(result);
        }
        // $rootScope.application.corpus.currentSession.docs.unsaved = true;
        // // $rootScope.application.bug("There was an error saving one or more records. Please try again.");
        // $rootScope.application.corpus.currentSession.docs.unsaved = false;
      });
  };

  // Set auto-save interval for 5 minutes
  var autoSave = window.setInterval(function() {
    // if ($rootScope.application.corpus.currentSession.docs.unsaved) {
      $scope.saveChanges();
    // } else {
      // TODO Dont need to FIND BETTER WAY TO KEEP SESSION ALIVE;
      // if ($rootScope.loginInfo) {
      //   Data.login($rootScope.application.authentication.user.username,
      //     $rootScope.loginInfo.password);
      // }
    // }
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
      if (!$rootScope.application.corpus.currentSession.newDatum.unsaved) {
        $scope.activeDatumIndex = scopeIndex;
      } else {
        $scope.activeDatumIndex = scopeIndex + 1;
        // $scope.createRecord($rootScope.application.corpus.currentSession.newDatum);
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
    $scope.loadData($rootScope.application.corpus.currentSession.id);
  };

  $scope.clearSearch = function() {
    $scope.searchTerm = '';
    $scope.searchHistory = null;
    $scope.loadData($rootScope.application.corpus.currentSession.id);
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

    $rootScope.application.corpus.save($rootScope.application.authentication.user).then(function(result) {
      console.log("Saved corpus details ", result);
      $scope.updateAvailableFieldsInColumns();
      var indirectObjectString = "in <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a>";
      $scope.addActivity([{
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-cloud",
        directobject: "<a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-cloud",
        directobject: "<a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }], "uploadnow");
    }, function(reason) {
      console.log("Error saving corpus details.", reason);
      $rootScope.application.bug("Error saving corpus details.");
    });
  };

  $scope.runSearch = function(searchTerm) {
    // Create object from fields displayed in scope to later be able to
    // notify user if search result is from a hidden field
    var fieldsInScope = {};
    var mapFieldsToTrue = function(datumField) {
      fieldsInScope[datumField.id] = true;
    };
    for (var column in $rootScope.application.corpus.fieldsInColumns) {
      if ($rootScope.application.corpus.fieldsInColumns.hasOwnProperty(column)) {
        $rootScope.application.corpus.fieldsInColumns[column].map(mapFieldsToTrue);
      }
    }
    fieldsInScope.judgement = true;


    /* make the datumtags and comments always true since its only the compact view that doesnt show them? */

    fieldsInScope.comments = true;

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

    // if (!$rootScope.application.corpus.currentSession.id) {
    // Search allData in scope
    for (var i in $scope.allData) {
      // Determine if record should be included in session search
      var searchTarget = false;
      if (!$rootScope.application.corpus.currentSession.id) {
        searchTarget = true;
      } else if ($scope.allData[i].session._id === $rootScope.application.corpus.currentSession.id) {
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
      if (!$rootScope.application.authentication.user || $rootScope.application.authentication.user.prefs || $rootScope.application.authentication.user.prefs.numVisibleDatum) {
        console.warn("the user isnt loaded, shouldnt be loading any data.");
        return;
      }
      var resultSize = $rootScope.application.authentication.user.prefs.numVisibleDatum;
      if (resultSize === "all") {
        resultSize = $scope.allData.length;
      }
      $scope.data = $scope.allData.slice(
        0, resultSize);
    } else {
      $rootScope.notificationMessage = "No records matched your search.";
      $rootScope.openNotification();
    }
  };

  $scope.selectAll = function() {
    $rootScope.application.corpus.currentSession.docs.map(function(datum) {
      datum.selected = true;
    });
  };

  $scope.exportResults = function(size) {
    var results = [];
    $rootScope.application.corpus.currentSession.docs.map(function(datum) {
      if (datum.selected) {
        results.push(datum);
      }
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
          newActivityObject.user.username = $rootScope.application.authentication.user.username;
          newActivityObject.user.gravatar = $rootScope.application.authentication.user.gravatar || "0df69960706112e38332395a4f2e7542";
          newActivityObject.user.id = $rootScope.application.authentication.user.username;
          newActivityObject.user._id = $rootScope.application.authentication.user.username; //TODO remove this too eventually...
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
            activitydb = $rootScope.application.corpus.dbname + "-activity_feed";
          } else {
            activitydb = $rootScope.application.authentication.user.username + "-activity_feed";
          }
          $scope.activities[index].dbname = activitydb;
          $scope.activities[index].url = FieldDB.Database.prototype.BASE_DB_URL + "/" + activitydb;
          new FieldDB.Activity($scope.activities[index])
            .save()
            .then(function(response) {
                if (debugging) {
                  console.log("Saved new activity", response);
                }
                // Deleting so that indices in scope are unchanged
                delete $scope.activities[index];
              },
              function(reason) {
                console.warn("There was an error saving the activity. ", $scope.activities[index], reason);
                $rootScope.application.bug("There was an error saving the activity. ");
                $rootScope.application.corpus.currentSession.docs.unsaved = true;
              });
        }
      };
      for (var i = 0; i < $scope.activities.length; i++) {
        doSomethingDifferent(i);
      }
    }
  };


  $scope.registerNewUser = function(newLoginInfo) {
    $rootScope.loading = true;
    $rootScope.application.authentication.register(newLoginInfo)
      .then(function(newUser) {
        $rootScope.loading = false;

        var preferences = window.defaultPreferences;
        console.warn("TODO test registerNewUser", newUser);
        preferences.savedState.connection = newUser.corpora[0];
        preferences.savedState.username = newUser.username;
        preferences.savedState.password = sjcl.encrypt("password", newLoginInfo.password);
        localStorage.setItem('SpreadsheetPreferences', JSON.stringify(preferences));

      }, function(err) {
        $rootScope.loading = false;
        console.warn(err);

        var message = "";
        if (err.status === 0) {
          message = "are you offline?";
          if ($rootScope.application.brand === "mcgill" || $rootScope.application.brand === "concordia" || $rootScope.application.brand === "localhost") {
            message = "Cannot contact " + $rootScope.application.connection.userFriendlyServerName + " server, have you accepted the server's security certificate? (please refer to your registration email)";
          }
        }
        if (err && err.status >= 400 && err.data.userFriendlyErrors) {
          message = err.data.userFriendlyErrors.join(" ");
        } else {
          message = "Cannot contact " + $rootScope.application.connection.userFriendlyServerName + " server, please report this.";
        }
        $rootScope.application.bug(message);

        window.setTimeout(function() {
          window.open("https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform");
        }, 1500);

      });
  };


  $scope.createNewCorpus = function(newCorpusInfo) {
    if (!newCorpusInfo) {
      $rootScope.notificationMessage = "Please enter a corpus name.";
      $rootScope.openNotification();
      return;
    }

    $rootScope.loading = true;
    var dataToPost = {};
    dataToPost.username = $rootScope.application.authentication.user.username.trim();
    dataToPost.password = $rootScope.loginInfo.password.trim();
    dataToPost.title = newCorpusInfo.title;

    $rootScope.application.authentication.newCorpus(dataToPost)
      .then(function(response) {

        // Add new corpus to scope
        var newConnection = {};
        newConnection.dbname = response.corpus.dbname;
        newConnection.title = response.corpus.title;
        var directObjectString = "<a href='#corpus/" + response.corpus.dbname + "'>" + response.corpus.title + "</a>";
        $scope.addActivity([{
          verb: "added",
          verbicon: "icon-plus",
          directobjecticon: "icon-cloud",
          directobject: directObjectString,
          indirectobject: "",
          teamOrPersonal: "personal"
        }], "uploadnow");

        alert("todo test this");
        $rootScope.application.authentication.user.corpora.unshift(newConnection);
        $scope.selectCorpus(newConnection);
        $rootScope.loading = false;
        reRouteUser("");
      }, processServerContactError);

  };

  $scope.loadUsersAndRoles = function() {
    if (!$rootScope.application.authentication.user || !$rootScope.application.authentication.user.roles) {
      console.warn("strangely the user isnt defined, or ready right now.");
      return;
    }
    if ($scope.loadedPermissionsForTeam === $rootScope.application.corpus.dbname) {
      console.log("already loaded permissions for this team");
      return;
    }
    // Get all users and roles (for this corpus) from server

    var dataToPost = {};
    dataToPost.username = $rootScope.loginInfo.username;
    dataToPost.password = $rootScope.loginInfo.password;

    $rootScope.application.corpus.permissions.fetch(dataToPost)
      .then(function(users) {
        if (!users) {
          console.log("User doesn't have access to roles.");
          users = {
            allusers: []
          };
        }
        // for (var i in users.allusers) {
        //   if (users.allusers[i].username === $rootScope.loginInfo.username) {
        //     $rootScope.application.authentication.user.gravatar = users.allusers[i].gravatar;
        //   }
        // }

        // Get privileges for logged in user
        if (!$rootScope.application.authentication.user || !$rootScope.application.authentication.user.roles) {
          console.warn("strangely the user isnt defined, or ready right now.");
          return;
        }
        $rootScope.adminPermissions = false;
        $rootScope.readPermissions = false;
        $rootScope.writePermissions = false;
        $rootScope.commentPermissions = false;
        $scope.loadedPermissionsForTeam = $rootScope.application.corpus.dbname;
        if ($rootScope.application.authentication.user.roles.indexOf($rootScope.application.corpus.dbname + "_admin") > -1) {
          $rootScope.adminPermissions = true;
        }
        if ($rootScope.application.authentication.user.roles.indexOf($rootScope.application.corpus.dbname + "_reader") > -1) {
          $rootScope.readPermissions = true;
        }
        if ($rootScope.application.authentication.user.roles.indexOf($rootScope.application.corpus.dbname + "_writer") > -1) {
          $rootScope.writePermissions = true;
        }
        if ($rootScope.application.authentication.user.roles.indexOf($rootScope.application.corpus.dbname + "_commenter") > -1) {
          $rootScope.commentPermissions = true;
        }
        if (!$rootScope.commentPermissions && $rootScope.readPermissions && $rootScope.writePermissions) {
          $rootScope.commentPermissions = true;
        }
      }, processServerContactError);
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

    newUserRoles.dbname = $rootScope.application.corpus.dbname;

    var dataToPost = {};
    dataToPost.username = $rootScope.application.authentication.user.username.trim();
    dataToPost.password = $rootScope.loginInfo.password.trim();

    dataToPost.userRoleInfo = newUserRoles;

    Data.updateroles(dataToPost)
      .then(function(response) {
        if (debugging) {
          console.log(response);
        }
        var indirectObjectString = "on <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a> as " + rolesString;

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
      }, processServerContactError);
  };

  $scope.removeAccessFromUser = function(userid, roles) {
    if (!roles || roles.length === 0) {
      console.warn("no roles were requested to be removed. cant do anything");
      $rootScope.application.bug("There was a problem performing this operation. Please report this.");
    }
    // Prevent an admin from removing him/herself from a corpus if there are no other admins; This
    // helps to avoid a situation in which there is no admin for a
    // corpus
    if (roles === ["admin"] && $rootScope.application.corpus.permissions.admins.length < 2) {
      if ($rootScope.application.corpus.permissions.admins._collection[0].username.indexOf(userid) > -1) {
        $rootScope.application.bug("You cannot remove the final admin from a corpus.\nPlease add someone else as corpus admin before removing the final admin.");
        return;
      }
    }
    var referingNoun = userid;
    if (referingNoun === $rootScope.application.authentication.user.username) {
      referingNoun = "yourself";
    }

    var r = confirm("Are you sure you want to remove " + roles.join(" ") + " access from " + referingNoun + " on " + $rootScope.application.corpus.title);
    if (r === true) {

      var dataToPost = {};
      dataToPost.username = $rootScope.application.authentication.user.username.trim();
      dataToPost.password = $rootScope.loginInfo.password.trim();
      dataToPost.serverCode = $rootScope.application.brand;
      dataToPost.dbname = $rootScope.application.corpus.dbname;

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
          var indirectObjectString = roles.join(" ") + "access from <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a>";
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

        }, processServerContactError);
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
  };

  $scope.loadPaginatedData = function(why) {

    console.log("dont need loadPaginatedData anymore  ", why);
    if (true) {
      return;
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
    datum.unsaved = true;
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
      Data.async($rootScope.application.corpus.dbname, datum.id)
        .then(function(originalRecord) {
          // mark as trashed in scope
          var inDatumAudioFiles = false;
          for (var i in datum.audioVideo) {
            if (datum.audioVideo[i].filename === filename) {
              datum.audioVideo[i].description = datum.audioVideo[i].description + ":::Trashed " + Date.now() + " by " + $rootScope.application.authentication.user.username;
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
          Data.saveCouchDoc($rootScope.application.corpus.dbname, originalRecord)
            .then(function(response) {
              console.log("Saved attachment as trashed.");
              if (debugging) {
                console.log(response);
              }
              var indirectObjectString = "in <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a>";
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
              // Data.async($rootScope.application.corpus.dbname, datum.id)
              // .then(function(record) {
              //   // Delete attachment info for deleted record
              //   for (var key in record.attachmentInfo) {
              //     if (key === filename) {
              //       delete record.attachmentInfo[key];
              //     }
              //   }
              //   Data.saveCouchDoc($rootScope.application.corpus.dbname, datum.id, record, record._rev)
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
    if ($rootScope.application.corpus.currentSession.docs.unsaved === false &&
      $rootScope.application.corpus.activityConnection.docs.unsaved === false &&
      $rootScope.application.authentication.user.activityConnection.currentSession.docs.unsaved === false) {

      return {
        state: "Saved",
        class: "btn btn-success",
        icon: "fa whiteicon fa-folder",
        text: $rootScope.contextualize("locale_Saved")
      };
    } else if ($rootScope.application.corpus.currentSession.docs.unsaved ||
      $rootScope.application.corpus.activityConnection.docs.unsaved ||
      $rootScope.application.authentication.user.activityConnection.currentSession.docs.unsaved) {

      return {
        state: "Save",
        class: "btn btn-danger",
        icon: "fa whiteicon fa-save",
        text: $rootScope.contextualize("locale_Save")
      };
    } else if ($rootScope.application.corpus.currentSession.docs.saving ||
      $rootScope.application.corpus.activityConnection.docs.saving ||
      $rootScope.application.authentication.user.activityConnection.currentSession.docs.saving) {

      return {
        state: "Saving",
        class: "pulsing",
        icon: "fa whiteicon fa-folder-open",
        text: $rootScope.contextualize("locale_Saving")
      };
    } else {
      return {
        state: "Saved",
        class: "btn",
        icon: "fa whiteicon fa-folder",
        text: $rootScope.contextualize("locale_Saved")
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

  // Hide loader when all content is ready
  $rootScope.$on('$viewContentLoaded', function() {
    // Return user to saved state, if it exists; only recover saved state on reload, not menu navigate
    if ($scope.appReloaded !== true) {
      updateAndOverwritePreferencesToCurrentVersion();
      // Update users to new saved state preferences if they were absent

      if ($scope.scopePreferences.savedState && $scope.scopePreferences.savedState.username && $scope.scopePreferences.savedState.password) {
        var autoBuiltLoginInfo = {};
        autoBuiltLoginInfo.username = $scope.scopePreferences.savedState.username;
        try {
          autoBuiltLoginInfo.password = sjcl.decrypt("password", $scope.scopePreferences.savedState.password);
        } catch (err) {
          // User's password has not yet been encrypted; encryption will be updated on login.
          autoBuiltLoginInfo.password = $scope.scopePreferences.savedState.password;
        }
        $scope.loginUser(autoBuiltLoginInfo);
      } else {
        $rootScope.openWelcomeNotificationDeprecated();
        $scope.documentReady = true;
      }
    } else {
      alert("waht does app reloaded do?");
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
          if ($rootScope.application.brand === "mcgill" || $rootScope.application.brand === "concordia") {
            message = "Cannot contact " + $rootScope.application.connection.userFriendlyServerName + " server, have you accepted the server's security certificate? (please refer to your registration email)";
          }
        }
        if (err && err.status >= 400 && err.data.userFriendlyErrors) {
          message = err.data.userFriendlyErrors.join(" ");
        } else {
          message = "Cannot contact " + $rootScope.application.connection.userFriendlyServerName + " server, please report this.";
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

    $scope.resetPasswordInfo.username = $rootScope.application.authentication.user.username;
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
          if ($rootScope.application.brand === "mcgill" || $rootScope.application.brand === "concordia") {
            message = "Cannot contact " + $rootScope.application.connection.userFriendlyServerName + " server, have you accepted the server's security certificate? (please refer to your registration email)";
          }
        }
        if (err && err.status >= 400 && err.data.userFriendlyErrors) {
          message = err.data.userFriendlyErrors.join(" ");
        } else {
          message = "Cannot contact " + $rootScope.application.connection.userFriendlyServerName + " server, please report this.";
        }
        $scope.showResetPassword = false;

        $rootScope.notificationMessage = message;
        $rootScope.openNotification();

      });
  };


  window.onbeforeunload = function(e) {
    console.warn(e);
    if ($rootScope.application && $rootScope.application.authentication && $rootScope.application.authentication.user && typeof $rootScope.application.authentication.user.save === "function") {
      $rootScope.application.authentication.user.save();
    }
    if ($rootScope.application.corpus.currentSession.docs.unsaved || $rootScope.application.corpus.currentSession.newDatum.unsaved) {
      return "You currently have unsaved changes!\n\nIf you wish to save these changes, cancel and then save before reloading or closing this app.\n\nOtherwise, any unsaved changes will be abandoned.";
    } else {
      return;
    }
  };

};
SpreadsheetStyleDataEntryController.$inject = ["$scope", "$rootScope", "$resource", "$filter", "$document", "Data", "md5", "$timeout", "$modal", "$log", "$http"];
angular.module("spreadsheetApp").controller("SpreadsheetStyleDataEntryController", SpreadsheetStyleDataEntryController);
