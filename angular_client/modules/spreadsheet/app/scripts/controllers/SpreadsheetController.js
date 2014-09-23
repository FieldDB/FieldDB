/* globals  Q, sjcl, Recorder, AudioContext, stopRecording, SpreadsheetDatum, _, confirm, alert, prompt */
    'use strict';
console.log("Loading the SpreadsheetStyleDataEntryController.");

    var debugging = false;
    var SpreadsheetStyleDataEntryController =
      /**
       * @param $scope
       * @param $rootScope
       * @param $resource
       * @param Data
       * @param Servers provides utility functions which can let users choose a server
       * @returns {SpreadsheetStyleDataEntryController}
       */

      function($scope, $rootScope, $resource, $filter, $document, Data, Servers, md5, $timeout) {

        $rootScope.appVersion = "2.2.2ss";
        /* Modal controller TODO could move somewhere where the search is? */
        $scope.open = function() {
          $scope.shouldBeOpen = true;
        };

        $scope.close = function() {
          $scope.shouldBeOpen = false;
        };

        $scope.opts = {
          backdropFade: true,
          dialogFade: true
        };

        // Functions to open/close generic notification modal
        $rootScope.openNotification = function() {
          $scope.notificationShouldBeOpen = true;
        };

        $rootScope.closeNotification = function() {
          $scope.notificationShouldBeOpen = false;
        };

        // Functions to open/close welcome notification modal
        $rootScope.openWelcomeNotification = function() {
          $scope.welcomeNotificationShouldBeOpen = false; //never show this damn modal.
        };

        $rootScope.closeWelcomeNotification = function() {
          $scope.welcomeNotificationShouldBeOpen = false;
        };

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

        $scope.$watch('useAutoGlosser', function(newvalue, oldvalue) {
          console.log("useAutoGlosser", oldvalue);
          localStorage.setItem("useAutoGlosser", newvalue);
        });

        /*
        Create an array of servers which the user may use
         */
        $rootScope.servers = Servers.getAvailable();
        $rootScope.selectedServer = $rootScope.servers[0];

        // Set/get/update user preferences
        var defaultPreferences = {
          "userTemplate": "fulltemplate",
          "resultSize": 10,
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
              "title": "Grammaticality Judgement"
            },
            "utterance": {
              "label": "utterance",
              "title": "Utterance"
            },
            "morphemes": {
              "label": "morphemes",
              "title": "Morphemes"
            },
            "gloss": {
              "label": "gloss",
              "title": "Gloss"
            },
            "translation": {
              "label": "translation",
              "title": "Translation"
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
            "dateElicited": {
              "label": "dateElicited",
              "title": "Date Elicited"
            },
            "user": {
              "label": "user",
              "title": "User"
            },
            "dateSEntered": {
              "label": "dateSEntered",
              "title": "Date entered"
            },
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
              "title": "syntacticCategory"
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
              "title": "Orthography"
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
              "label": "comments",
              "title": "Comments"
            },
            "field6": {
              "label": "judgement",
              "title": "Grammaticality Judgement"
            },
            "field7": {
              "label": "tags",
              "title": "Tags"
            },
            "field8": {
              "label": "",
              "title": ""
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
            },
            "field8": {
              "label": "",
              "title": ""
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

        var Preferences = localStorage.getItem('SpreadsheetPreferences');

        if (Preferences === null) {
          Preferences = defaultPreferences;
          console
            .log("No preferences. Setting default preferences in localStorage.");
          // localStorage.clear(); //why?? left over from debugging?
          localStorage.setItem('SpreadsheetPreferences', JSON
            .stringify(defaultPreferences));
        } else {
          console.log("Loading Preferences from localStorage.");
          Preferences = JSON.parse(Preferences);
          Preferences.mcgillfieldmethodsspring2014template = defaultPreferences.mcgillfieldmethodsspring2014template;
          Preferences.yalefieldmethodsspring2014template = defaultPreferences.yalefieldmethodsspring2014template;
        }

        if ((Preferences.template1 !== undefined) || (Preferences.availableFields && Preferences.availableFields.notes)) {
          // Update to v1.3
          Preferences = defaultPreferences;
          console
            .log("Preferences need to be upgraded. Clearing and setting defaults.");
          // localStorage.clear(); //why?? left over from debugging?
          localStorage.setItem('SpreadsheetPreferences', JSON
            .stringify(defaultPreferences));
          Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
        }
        // Always get the most recent available fields
        Preferences.availableFields = defaultPreferences.availableFields;
        /* upgrade to v1.923ss */
        if (!Preferences.fulltemplate.field7.label) {
          Preferences.fulltemplate.field7 = {
            "label": "tags",
            "title": "Tags"
          };
        }
        if (Preferences.fulltemplate.field6.label === "judgement") {
          Preferences.fulltemplate.field6 = {
            "label": "judgement",
            "title": "Grammaticality Judgement"
          };
        }
        localStorage.setItem('SpreadsheetPreferences', JSON
          .stringify(Preferences));
        // console.log(Preferences.availableFields);
        // Set scope variables
        $scope.documentReady = false;
        $rootScope.template = Preferences.userTemplate;
        $rootScope.fields = Preferences[Preferences.userTemplate];
        $scope.scopePreferences = Preferences;
        $scope.availableFields = defaultPreferences.availableFields;
        $scope.orderProp = "dateEntered";
        $rootScope.currentPage = 0;
        $scope.reverse = true;
        // $scope.selected = 'newEntry';
        $rootScope.authenticated = false;
        $rootScope.developer = false;
        $scope.dataentry = false;
        $scope.searching = false;
        $rootScope.activeSubMenu = 'none';
        $scope.activeSession = undefined;
        $scope.currentSessionName = "All Sessions";
        $scope.showCreateSessionDiv = false;
        $scope.editSessionDetails = false;
        $scope.createNewSessionDropdown = false;
        $scope.currentDate = JSON.parse(JSON.stringify(new Date()));
        $scope.activities = [];
        $rootScope.DBselected = false;
        $scope.recordingStatus = "Record";
        $scope.recordingButtonClass = "btn btn-success";
        $scope.recordingIcon = "fa-microphone";
        $scope.showAudioFeatures = false;
        $scope.newFieldData = {};
        $rootScope.newRecordHasBeenEdited = false;

        $rootScope.serverLabels = Servers.getHumanFriendlyLabels();

        // Set data size for pagination
        $rootScope.resultSize = Preferences.resultSize;

        $scope.changeActiveSubMenu = function(subMenu) {
          if ($rootScope.activeSubMenu === subMenu) {
            $rootScope.activeSubMenu = 'none';
          } else if (subMenu === 'none' && $scope.searching === true) {
            return;
          } else {
            $rootScope.activeSubMenu = subMenu;
          }
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

            if ($rootScope.DB) {
              $rootScope.DBselected = true;
            }

            $rootScope.loading = false;

            $scope.activeMenu = itemToDisplay;

            switch (itemToDisplay) {
              case "settings":
                $scope.dataentry = false;
                $scope.searching = false;
                $scope.changeActiveSubMenu('none');
                window.location.assign("#/settings");
                break;
              case "corpusSettings":
                $scope.dataentry = false;
                $scope.searching = false;
                $scope.changeActiveSubMenu('none');
                window.location.assign("#/corpussettings");
                break;
              case "home":
                $scope.dataentry = false;
                $scope.searching = false;
                $scope.changeActiveSubMenu('none');
                window.location.assign("#/corpora_list");
                break;
              case "searchMenu":
                $scope.changeActiveSubMenu(itemToDisplay);
                $scope.searching = true;
                $scope.selected = null;
                window.location.assign("#/spreadsheet/" + $rootScope.template);
                break;
              case "faq":
                $scope.dataentry = false;
                $scope.searching = false;
                $scope.changeActiveSubMenu('none');
                window.location.assign("#/faq");
                break;
              case "none":
                $scope.dataentry = true;
                $scope.searching = false;
                $scope.changeActiveSubMenu('none');
                window.location.assign("#/spreadsheet/" + $rootScope.template);
                break;
              case "register":
                window.location.assign("#/register");
                break;
              default:
                window.location.assign("#/spreadsheet/" + $rootScope.template);
                $scope.changeActiveSubMenu(itemToDisplay);
            }
          }
        };

        // Get sessions for pouchname; select specific session on saved state load
        $scope.loadSessions = function(sessionID) {
          var scopeSessions = [];
          Data
            .sessions($rootScope.DB.pouchname)
            .then(
              function(response) {
                for (var k in response) {
                  scopeSessions.push(response[k].value);
                }

                for (var i in scopeSessions) {
                  for (var j in scopeSessions[i].sessionFields) {
                    if (scopeSessions[i].sessionFields[j].label === "goal") {
                      if (scopeSessions[i].sessionFields[j].mask) {
                        scopeSessions[i].title = scopeSessions[i].sessionFields[j].mask
                          .substr(0, 20);
                      }
                    }
                  }
                }
                $scope.sessions = scopeSessions;
                if (sessionID) {
                  $scope.selectSession(sessionID);
                }
                $scope.documentReady = true;
              }, function(error) {
                $scope.documentReady = true;
                console.log("Error loading sessions.", error);
                $rootScope.notificationMessage = "Error loading corpus, please try again.";
                $rootScope.notificationShouldBeOpen = true;
                $rootScope.loading = false;
              });
        };

        // Fetch data from server and put into template scope
        $scope.loadData = function(sessionID) {
          $scope.appReloaded = true;
          $rootScope.loading = true;
          Data
            .async($rootScope.DB.pouchname)
            .then(
              function(dataFromServer) {
                var scopeData = [];
                for (var i = 0; i < dataFromServer.length; i++) {
                  if (dataFromServer[i].value.datumFields) {
                    var newDatumFromServer = SpreadsheetDatum.convertFieldDBDatumIntoSpreadSheetDatum({}, dataFromServer[i].value, $rootScope.server + "/" + $rootScope.DB.pouchname + "/");

                    // Load data from current session into scope
                    if (!sessionID || sessionID === "none") {
                      scopeData.push(newDatumFromServer);
                    } else if (newDatumFromServer.sessionID === sessionID) {
                      scopeData.push(newDatumFromServer);
                    }
                  }
                }

                // TODO dont sort the data here, its being sorted by the templates too...?
                // scopeData.sort(function(a, b) {
                //   // return a[$scope.orderProp] - b[$scope.orderProp];

                //   if (a[$scope.orderProp] > b[$scope.orderProp])
                //     return -1;
                //   if (a[$scope.orderProp] < b[$scope.orderProp])
                //     return 1;
                //   return 0;
                // });

                $scope.allData = scopeData;
                $scope.data = scopeData.slice(0, $rootScope.resultSize);
                $rootScope.currentPage = 0;

                $scope.loadAutoGlosserRules();
                $scope.loadUsersAndRoles();

                $scope.saved = "yes";
                $rootScope.loading = false;

                $scope.selected = "newEntry";


              }, function(error) {
                console.log("error loading the data", error);
                // On error loading data, reset saved state
                // Update saved state in Preferences
                Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
                Preferences.savedState = {};
                localStorage.setItem('SpreadsheetPreferences', JSON
                  .stringify(Preferences));
                $scope.documentReady = true;
                $rootScope.notificationMessage = "There was an error loading the data. Please reload and log in.";
                $rootScope.errorLoggingInNotificationShouldBeOpen = true;
                $rootScope.loading = false;
              });
        };

        $scope.loadAutoGlosserRules = function() {
          // Get precedence rules for Glosser
          Data.glosser($rootScope.DB.pouchname).then(
            function(rules) {
              localStorage.setItem($rootScope.DB.pouchname + "precedenceRules", JSON.stringify(rules));

              // Reduce the rules such that rules which are found in multiple
              // source words are only used/included once.
              var reducedRules = _.chain(rules).groupBy(function(rule) {
                return rule.key.x + "-" + rule.key.y;
              }).value();

              // Save the reduced precedence rules in localStorage
              localStorage.setItem($rootScope.DB.pouchname + "reducedRules",
                JSON.stringify(reducedRules));
            }, function(error) {
              console.log("Error retrieving precedence rules.", error);
            });

          // Get lexicon for Glosser and organize based on frequency
          Data.lexicon($rootScope.DB.pouchname).then(
            function(lexicon) {
              var sortedLexicon = {};
              for (var i in lexicon) {
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
              var sorter = function(a, b) {
                  return b.value - a.value;
                };
              // Sort each morpheme array by descending value
              for (var key in sortedLexicon) {
                sortedLexicon[key].sort(sorter);
              }
              localStorage.setItem(
                $rootScope.DB.pouchname + "lexiconResults", JSON
                .stringify(sortedLexicon));
            }, function(error) {
              console.log("Error retrieving lexicon.", error);
            });
        };

        $scope.loginUser = function(auth, chosenServer) {
          auth.server = auth.server || chosenServer;

          if (!auth || !auth.server) {
            $rootScope.notificationMessage = "Please choose a server.";
            $rootScope.openNotification();
          } else {
            $rootScope.clickSuccess = true;
            $rootScope.loginInfo = {
              "username": auth.user.trim().toLowerCase().replace(/[^0-9a-z]/g, ""),
              "password": auth.password
            };

            // if (auth.user === "senhorzinho") {
            //   var r = confirm("Hello, developer! Would you like to enter developer mode?");
            //   if (r === true) {
            //     $rootScope.developer = true;
            //   }
            // }
            $rootScope.loading = true;

            $rootScope.serverCode = auth.server;
            $rootScope.server = Servers.getServiceUrl(auth.server, "corpus");


            Data.login(auth.user.toLowerCase(), auth.password).then(
              function(response) {
                if (response === undefined) {
                  return;
                }

                $scope.addActivity([{
                  verb: "logged in",
                  verbicon: "icon-check",
                  directobjecticon: "icon-user",
                  directobject: "",
                  indirectobject: "",
                  teamOrPersonal: "personal"
                }], "uploadnow");

                // Update saved state in Preferences
                Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
                Preferences.savedState.server = $rootScope.serverCode;
                Preferences.savedState.username = $rootScope.user.username;
                Preferences.savedState.password = sjcl.encrypt("password", $rootScope.loginInfo.password);
                localStorage.setItem('SpreadsheetPreferences', JSON
                  .stringify(Preferences));

                $rootScope.authenticated = true;
                var userRoles = response.data.roles;
                var availableDBs = {};
                // Find databases the user is allowed to read from db roles with reader
                for (var roleIndex = 0; roleIndex < userRoles.length; roleIndex++) {
                  var pieces = userRoles[roleIndex].split("_");
                  if (pieces.length > 1 && pieces[pieces.length - 1] === "reader") {
                    pieces.pop();
                    availableDBs[pieces.join("_").replace(/[\"]/g, "")] = {
                      roleIndex: roleIndex
                    };
                  }
                }
                // put dbs in order that they were added to the user rather than alphabetical by pouchname which isnt useful
                var scopeDBs = [];
                for (var dbName in availableDBs) {
                  if (availableDBs.hasOwnProperty(dbName)) {

                    // Only show lingllama's grafiti corpora to lingllama, per client request
                    if (dbName.indexOf("lingllama-communitycorpus") > -1 || dbName.indexOf("public-firstcorpus") > -1) {
                      continue;
                    }
                    scopeDBs.push(dbName);
                  }
                }
                $scope.corpora = [];
                var processCorpora = function(index) {
                    // Use map-reduce to get corpus title

                    Data.async(scopeDBs[index], "_design/pages/_view/private_corpuses").then(
                      function(response) {
                        var corpus = {};
                        if (response.rows[0]) {
                          corpus = response.rows[0].value;
                        } else {
                          console.log("Error finding a corpus in this database. This database is broken and someone should dbe notified to fix it.", response);
                          corpus.pouchname = scopeDBs[index];
                          corpus.title = scopeDBs[index];
                        }
                        // If this is the corpus the user is looking at, update to the latest corpus details from the database.
                        if ($rootScope.DB && $rootScope.DB.pouchname === corpus.pouchname) {
                          $rootScope.DB = corpus;
                          // If the currently choosen corpus has a default template, overwrite the user's preferences
                          if (corpus.preferredTemplate) {
                            var fieldsForTemplate = {};
                            if (window.defaultPreferences[corpus.preferredTemplate]) {
                              fieldsForTemplate = window.defaultPreferences[corpus.preferredTemplate];
                            }
                            $rootScope.overrideTemplateSetting(corpus.preferredTemplate, fieldsForTemplate, true);
                          }
                        }
                        corpus.gravatar = md5.createHash(corpus.pouchname);
                        $scope.corpora.push(corpus);
                      }, function(error) {
                        console.log("Error finding a corpus in this database. Either his database is out of date or the server contact failed. ", error);
                        var corpus = {};
                        corpus.pouchname = scopeDBs[index];
                        corpus.title = scopeDBs[index];
                        corpus.gravatar = md5.createHash(corpus.pouchname);
                        $scope.corpora.push(corpus);
                      });
                  };
                for (var m = 0; m < scopeDBs.length; m++) {
                  processCorpora(m);
                }
                $rootScope.loading = false;
              }, /* login failure */ function(reason) {
                $rootScope.notificationMessage = "Error logging in.\n" + reason;
                $rootScope.errorLoggingInNotificationShouldBeOpen = true;
                $rootScope.loading = false;
              });
          }
        };

        $scope.logOut = function() {
          Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
          Preferences.savedState = {};
          localStorage.setItem('SpreadsheetPreferences', JSON
            .stringify(Preferences));
          $scope.reloadPage();
        };

        $scope.selectDB = function(selectedDB) {
          if (!selectedDB) {
            $rootScope.notificationMessage = "Please select a database.";
            $rootScope.openNotification();
          } else {
            try {
              selectedDB = JSON.parse(selectedDB);
            } catch (e) {
              console.log("must have been an object...", e, selectedDB);
            }
            $rootScope.DB = selectedDB;


            // Update saved state in Preferences
            Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
            Preferences.savedState.mostRecentCorpusPouchname = selectedDB.pouchname;
            localStorage.setItem('SpreadsheetPreferences', JSON
              .stringify(Preferences));

            // If the currently choosen corpus has a default template, overwrite the user's preferences
            if (selectedDB.preferredTemplate) {
              var fieldsForTemplate = {};
              if (window.defaultPreferences[selectedDB.preferredTemplate]) {
                fieldsForTemplate = window.defaultPreferences[selectedDB.preferredTemplate];
              }
              $rootScope.overrideTemplateSetting(selectedDB.preferredTemplate, fieldsForTemplate, true);
            }


            $scope.loadSessions();
            $scope.loadUsersAndRoles();

          }
        };

        $rootScope.overrideTemplateSetting = function(template, newFieldPreferences, notUserInitited) {
          $rootScope.template = template;
          $rootScope.fields = newFieldPreferences; //TODO doesnt seem right...
          console.log("notUserInitited", notUserInitited);
        };

        $rootScope.setAsDefaultCorpusTemplate = function(templateName) {
          console.log(templateName);
          if (!$rootScope.admin) {
            alert("You're not an admin on this corpus, please ask an admin to set this template as default for you.");
            return;
          }
          if ($rootScope.DB.description) {
            $rootScope.DB.preferredTemplate = templateName;
            Data.saveCouchDoc($rootScope.DB.pouchname, $rootScope.DB)
              .then(function(result) {
                console.log("Saved corpus template preferences ", result);
              }, function(reason) {
                console.log("Error saving corpus template.", reason);
                alert("Error saving corpus template.");
              });
          } else {
            alert("The corpus doc was never fetched. So I cant save the preferences... Please report this if you think you should be able to save the preferences.");
          }
        };

        $scope.selectSession = function(activeSessionID) {
          $scope.changeActiveSession(activeSessionID);
          // Make sure that following variable is set (ng-model in select won't
          // assign variable until chosen)
          $scope.activeSessionToSwitchTo = activeSessionID;
          $scope.dataentry = true;

          // Update saved state in Preferences
          Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
          Preferences.savedState.sessionID = activeSessionID;
          localStorage.setItem('SpreadsheetPreferences', JSON
            .stringify(Preferences));
          $scope.loadData(activeSessionID);
          $scope.loadUsersAndRoles();
          window.location.assign("#/spreadsheet/" + $rootScope.template);
        };

        $scope.changeActiveSession = function(activeSessionToSwitchTo) {
          if (activeSessionToSwitchTo === 'none' || activeSessionToSwitchTo === undefined) {
            $scope.activeSession = undefined;
          } else {
            $scope.activeSession = activeSessionToSwitchTo;
            for (var i in $scope.sessions) {
              if ($scope.sessions[i]._id === activeSessionToSwitchTo) {
                $scope.fullCurrentSession = $scope.sessions[i];

                // Set up object to make session editing easier
                var editSessionInfo = {};
                editSessionInfo._id = $scope.fullCurrentSession._id;
                editSessionInfo._rev = $scope.fullCurrentSession._rev;
                for (var k in $scope.fullCurrentSession.sessionFields) {
                  editSessionInfo[$scope.fullCurrentSession.sessionFields[k].label] = $scope.fullCurrentSession.sessionFields[k].mask;
                }
                $scope.editSessionInfo = editSessionInfo;
              }
            }
          }
          // Update saved state in Preferences
          Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
          Preferences.savedState.sessionID = $scope.activeSession;
          Preferences.savedState.sessionTitle = $scope.currentSessionName;
          localStorage.setItem('SpreadsheetPreferences', JSON
            .stringify(Preferences));
        };

        $scope.getCurrentSessionName = function() {
          if ($scope.activeSession === undefined) {
            return "All Sessions";
          } else {
            var sessionTitle;
            if (debugging) {
              console.log(sessionTitle);
            }
            for (var i in $scope.sessions) {
              if ($scope.sessions[i]._id === $scope.activeSession) {
                for (var j in $scope.sessions[i].sessionFields) {
                  if ($scope.sessions[i].sessionFields[j].label === "goal") {
                    if ($scope.sessions[i].sessionFields[j].mask) {
                      $scope.currentSessionName = $scope.sessions[i].sessionFields[j].mask;
                      return $scope.sessions[i].sessionFields[j].mask.substr(0,
                        20);
                    } else {
                      $scope.currentSessionName = $scope.sessions[i].sessionFields[j].value;
                      return $scope.sessions[i].sessionFields[j].value.substr(0,
                        20);
                    }
                  }
                }
              }
            }
          }
        };

        $scope.editSession = function(editSessionInfo, scopeDataToEdit) {
          var r = confirm("Are you sure you want to edit the session information?\nThis could take a while.");
          if (r === true) {
            $scope.editSessionDetails = false;
            $rootScope.loading = true;
            var newSession = $scope.fullCurrentSession;
            for (var i in newSession.sessionFields) {
              for (var key in editSessionInfo) {
                if (newSession.sessionFields[i].label === key) {
                  newSession.sessionFields[i].value = editSessionInfo[key];
                  newSession.sessionFields[i].mask = editSessionInfo[key];
                }
              }
            }
            // Save session record
            Data
              .saveCouchDoc($rootScope.DB.pouchname, newSession)
              .then(
                function() {
                  var directobject = $scope.currentSessionName || "an elicitation session";
                  var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
                  $scope.addActivity([{
                    verb: "modified",
                    verbicon: "icon-pencil",
                    directobjecticon: "icon-calendar",
                    directobject: "<a href='#session/" + newSession._id + "'>" + directobject + "</a> ",
                    indirectobject: indirectObjectString,
                    teamOrPersonal: "personal"
                  }, {
                    verb: "modified",
                    verbicon: "icon-pencil",
                    directobjecticon: "icon-calendar",
                    directobject: "<a href='#session/" + newSession._id + "'>" + directobject + "</a> ",
                    indirectobject: indirectObjectString,
                    teamOrPersonal: "team"
                  }], "uploadnow");

                  var doSomething = function(index) {
                      if (scopeDataToEdit[index].sessionID === newSession._id) {
                        Data
                          .async($rootScope.DB.pouchname,
                            scopeDataToEdit[index].id)
                          .then(
                            function(editedRecord) {
                              // Edit record with updated session info
                              // and save

                              editedRecord.session = newSession;
                              Data.saveCouchDoc($rootScope.DB.pouchname, editedRecord).then(function() {
                                $rootScope.loading = false;
                              });
                            },
                            function() {
                              window
                                .alert("There was an error accessing the record.\nTry refreshing the page");
                            });
                      }
                    };
                  // Update all records tied to this session
                  for (var i in scopeDataToEdit) {
                    $rootScope.loading = true;
                    doSomething(i);
                  }
                  $scope.loadData($scope.activeSessionID);
                });
          }

        };


        $scope.deleteEmptySession = function(activeSessionID) {
          if ($scope.currentSessionName === "All Sessions") {
            $rootScope.notificationMessage = "You must select a session to delete.";
            $rootScope.openNotification();
          } else {
            var r = confirm("Are you sure you want to put this session in the trash?");
            if (r === true) {
              Data.async($rootScope.DB.pouchname, activeSessionID)
                .then(
                  function(sessionToMarkAsDeleted) {
                    sessionToMarkAsDeleted.trashed = "deleted";
                    var rev = sessionToMarkAsDeleted._rev;
                    if(debugging){
                      console.log(rev);
                    }
                    Data.saveCouchDoc($rootScope.DB.pouchname, sessionToMarkAsDeleted).then(function(response) {

                      if(debugging){
                        console.log(response);
                      }
                      var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
                      $scope.addActivity([{
                        verb: "deleted",
                        verbicon: "icon-trash",
                        directobjecticon: "icon-calendar",
                        directobject: "<a href='#session/" + sessionToMarkAsDeleted._id + "'>an elicitation session</a> ",
                        indirectobject: indirectObjectString,
                        teamOrPersonal: "personal"
                      }, {
                        verb: "deleted",
                        verbicon: "icon-trash",
                        directobjecticon: "icon-calendar",
                        directobject: "<a href='#session/" + sessionToMarkAsDeleted._id + "'>an elicitation session</a> ",
                        indirectobject: indirectObjectString,
                        teamOrPersonal: "team"
                      }], "uploadnow");

                      // Remove session from scope
                      for (var i in $scope.sessions) {
                        if ($scope.sessions[i]._id === activeSessionID) {
                          $scope.sessions.splice(i, 1);
                        }
                      }
                      // Set active session to All Sessions
                      $scope.activeSession = undefined;
                    }, function(error) {
                      console.warn("there was an error deleting a session", error);
                      window
                        .alert("Error deleting session.\nTry refreshing the page.");
                    });
                  });
            }
          }
        };


        $scope.createNewSession = function(newSession) {
          $rootScope.loading = true;
          // Get blank template to build new record
          Data
            .blankSessionTemplate()
            .then(
              function(newSessionRecord) {
                newSessionRecord.pouchname = $rootScope.DB.pouchname;
                newSessionRecord.dateCreated = JSON.parse(JSON
                  .stringify(new Date()));
                newSessionRecord.dateModified = JSON.parse(JSON
                  .stringify(new Date()));
                newSessionRecord.lastModifiedBy = $rootScope.user.username;
                for (var key in newSession) {
                  for (var i in newSessionRecord.sessionFields) {
                    if (newSessionRecord.sessionFields[i].label === "user") {
                      newSessionRecord.sessionFields[i].value = $rootScope.user.username;
                      newSessionRecord.sessionFields[i].mask = $rootScope.user.username;
                    }
                    if (newSessionRecord.sessionFields[i].label === "dateSEntered") {
                      newSessionRecord.sessionFields[i].value = new Date()
                        .toString();
                      newSessionRecord.sessionFields[i].mask = new Date()
                        .toString();
                    }
                    if (key === newSessionRecord.sessionFields[i].label) {
                      newSessionRecord.sessionFields[i].value = newSession[key];
                      newSessionRecord.sessionFields[i].mask = newSession[key];
                    }
                  }
                }
                Data
                  .saveCouchDoc($rootScope.DB.pouchname, newSessionRecord)
                  .then(
                    function(savedRecord) {


                      newSessionRecord._id = savedRecord.data.id;
                      newSessionRecord._rev = savedRecord.data.rev;
                      for (var i in newSessionRecord.sessionFields) {
                        if (newSessionRecord.sessionFields[i].label === "goal") {
                          newSessionRecord.title = newSessionRecord.sessionFields[i].mask
                            .substr(0, 20);
                        }
                      }
                      var directobject = newSessionRecord.title || "an elicitation session";
                      var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
                      $scope.addActivity([{
                        verb: "added",
                        verbicon: "icon-pencil",
                        directobjecticon: "icon-calendar",
                        directobject: "<a href='#session/" + savedRecord.data.id + "'>" + directobject + "</a> ",
                        indirectobject: indirectObjectString,
                        teamOrPersonal: "personal"
                      }, {
                        verb: "added",
                        verbicon: "icon-pencil",
                        directobjecticon: "icon-calendar",
                        directobject: "<a href='#session/" + savedRecord.data.id + "'>" + directobject + "</a> ",
                        indirectobject: indirectObjectString,
                        teamOrPersonal: "team"
                      }], "uploadnow");

                      $scope.sessions.push(newSessionRecord);
                      $scope.dataentry = true;
                      $scope.selectSession(savedRecord.data.id);
                      window.location.assign("#/spreadsheet/" + $rootScope.template);
                    });
                $rootScope.loading = false;
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
            window.location.assign("#/");
            window.location.reload();
          }
        };

        $scope.deleteRecord = function(datum) {
          if (!datum.id) {
            $rootScope.notificationMessage = "Please save changes before continuing.";
            $rootScope.openNotification();
            $scope.selected = datum;
            // } else if (datum.audioVideo && datum.audioVideo[0]) {
            //   $rootScope.notificationMessage = "You must delete all recordings from this record first.";
            //   $rootScope.openNotification();
            //   $scope.selected = datum;
          } else {
            var r = confirm("Are you sure you want to put this datum in the trash?");
            if (r === true) {

              Data
                .async($rootScope.DB.pouchname, datum.id)
                .then(
                  function(recordToMarkAsDeleted) {
                    recordToMarkAsDeleted.trashed = "deleted";
                    var rev = recordToMarkAsDeleted._rev;
                    console.log(rev);
                    //Upgrade to v1.90
                    if (recordToMarkAsDeleted.attachmentInfo) {
                      delete recordToMarkAsDeleted.attachmentInfo;
                    }
                    Data.saveCouchDoc($rootScope.DB.pouchname, recordToMarkAsDeleted).then(function(response) {
                      // Remove record from scope
                      if(debugging){
                        console.log(response);
                      }
                      var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
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

                      // Delete record from all scope data and update
                      var index = $scope.allData.indexOf(datum);
                      $scope.allData.splice(index, 1);
                      $scope.loadPaginatedData();

                      $scope.saved = "yes";
                      $scope.selected = null;
                    }, function(error) {
                        console.warn(error);
                      window
                        .alert("Error deleting record.\nTry refreshing the data first by clicking ↻.");
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

        $scope.createRecord = function(fieldData, focusOnFieldAfter) {
          // $scope.setFocusOn(focusOnFieldAfter);
          document.getElementById(focusOnFieldAfter).focus();

          // // Reset new datum form data and enable upload button; only reset audio field if present
          if ($rootScope.template === "fulltemplate" || $rootScope.template === "mcgillfieldmethodsspring2014template" || $rootScope.template === "yalefieldmethodsspring2014template") {
            document.getElementById("form_new_datum_audio-file").reset();
            $scope.newDatumHasAudioToUpload = false;
          }
          $rootScope.newRecordHasBeenEdited = false;
          $scope.newFieldData = {};

          if (!fieldData) {
            fieldData = {};
          }

          // Edit record fields with labels from prefs
          for (var dataKey in fieldData) {
            for (var fieldKey in $scope.fields) {
              if (dataKey === fieldKey) {
                // console.log(dataKey);
                var newDataKey = $scope.fields[fieldKey].label;
                fieldData[newDataKey] = fieldData[dataKey];
                delete fieldData[dataKey];
              }
            }
          }
          // console.log(fieldData);
          // Save tags
          if (fieldData.datumTags) {
            var newDatumFields = fieldData.datumTags.split(",");
            var newDatumFieldsArray = [];
            for (var i in newDatumFields) {
              var newDatumTagObject = {};
              // Trim spaces
              var trimmedTag = newDatumFields[i].trim();
              newDatumTagObject.tag = trimmedTag;
              newDatumFieldsArray.push(newDatumTagObject);
            }
            fieldData.datumTags = newDatumFieldsArray;
          } else {
            fieldData.datumTags = [];
          }

          // Save comments
          if (fieldData.comments) {
            var comment = {};
            comment.text = fieldData.comments;
            comment.username = $rootScope.user.username;
            comment.timestamp = Date.now();
            comment.gravatar = $rootScope.user.gravatar || "./../user/user_gravatar.png";
            comment.timestampModified = Date.now();
            fieldData.comments = [];
            fieldData.comments.push(comment);
          }

          fieldData.enteredByUser = {
            "username": $rootScope.user.username,
            "gravatar": $rootScope.user.gravatar,
            "appVersion": $rootScope.appVersion
          };

          fieldData.timestamp = Date.now();
          fieldData.dateEntered = JSON.parse(JSON.stringify(new Date(fieldData.timestamp)));
          fieldData.dateModified = fieldData.dateEntered;
          // fieldData.lastModifiedBy = $rootScope.user.username;
          fieldData.sessionID = $scope.activeSession;
          fieldData.saved = "no";
          if (fieldData.audioVideo) {
            fieldData.hasAudio = true;
          }

          // Add record to all scope data and update
          $scope.allData.unshift(fieldData);
          $scope.loadPaginatedData();

          $scope.newFieldDatahasAudio = false;
          $scope.saved = "no";
        };

        // TODO why does this do somethign with datum tags, can any of this be done in the spreadsheet datum ?
        $rootScope.markAsEdited = function(fieldData, datum) {
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
          var modifiedByUser = {
            "username": $rootScope.user.username,
            "gravatar": $rootScope.user.gravatar,
            "appVersion": $rootScope.appVersion
          };

          if (!datum.modifiedByUser || !datum.modifiedByUser.users) {
            datum.modifiedByUser = {
              "users": []
            };
          }
          datum.modifiedByUser.users.push(modifiedByUser);

          // Limit users array to unique usernames
          datum.modifiedByUser.users = _.map(_.groupBy(datum.modifiedByUser.users, function(x) {
            return x.username;
          }), function(grouped) {
            return grouped[0];
          });

          $scope.saved = "no";

          // Limit activity to one instance in the case of multiple edits to the same datum before 'save'
          if (!datum.saved || datum.saved === "yes") {
            datum.saved = "no";
            // Update activity feed
            var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
            $scope.addActivity([{
              verb: "modified",
              verbicon: "icon-pencil",
              directobjecticon: "icon-list",
              directobject: "<a href='#corpus/" + $rootScope.DB.pouchname + "/datum/" + datum.id + "'>" + utterance + "</a> ",
              indirectobject: indirectObjectString,
              teamOrPersonal: "personal"
            }, {
              verb: "modified",
              verbicon: "icon-pencil",
              directobjecticon: "icon-list",
              directobject: "<a href='#corpus/" + $rootScope.DB.pouchname + "/datum/" + datum.id + "'>" + utterance + "</a> ",
              indirectobject: indirectObjectString,
              teamOrPersonal: "team"
            }]);
          } else {
            datum.saved = "no";
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
          comment.gravatar = $rootScope.user.gravatar || "./../user/user_gravatar.png";
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

          var indirectObjectString = "on <a href='#data/" + datum.id + "'><i class='icon-pushpin'></i> " + $rootScope.DB.title + "</a>";
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

                var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
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
                  if ($scope.fullCurrentSession) {
                    recordToBeSaved.session = $scope.fullCurrentSession; //TODO check this, should work since the users only open data by elicitation session.
                  } else {
                    window.alert("This appears to be a new record, but there isnt a current data entry session to associate it with. Please report this to support@lingsync.org");
                  }
                }

                $scope.saved = "saving";
                recordToBeSaved.pouchname = $rootScope.DB.pouchname;
                // spreadsheetDatum.dateModified =
                // recordToBeSaved.timestamp = Date.now(); // these come from the edit function, and from the create function because the save can happen minutes or hours after the user actually modifies/creates the datum.
                promiseToSaveThisDatum = Data.saveSpreadsheetDatum(recordToBeSaved);
                saveDatumPromises.push(promiseToSaveThisDatum);

                promiseToSaveThisDatum.then(function(spreadSheetDatum) {
                  spreadSheetDatum.saved = "yes";
                  activities[0].directobject = activities[1].directobject = "<a href='#corpus/" + $rootScope.DB.pouchname + "/datum/" + spreadSheetDatum.id + "'>" + utteranceForActivityFeed + "</a> ";
                  $scope.addActivity(activities, "uploadnow");
                }, function(reason) {
                  console.log(reason);
                  $scope.saved = "no";
                  window.alert("There was an error saving a record. " + reason);
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
          Q.all(saveDatumPromises)
            .done(function(success, reason) {
              if (reason) {
                console.log(reason);
                $scope.saved = "no";
                window.alert("There was an error saving one or more records. Please try again.");
              } else {
                if ($scope.saved === "saving") {
                  $scope.saved = "yes";
                }
              }
            });
        };

        // Set auto-save interval for 5 minutes
        var autoSave = window.setInterval(
          function() {
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
        if(debugging){
          console.log("autoSave was defined but not used", autoSave);
        }

        $scope.selectRow = function(scopeIndex) {
          // Do nothing if clicked row is currently selected
          if ($scope.selected === scopeIndex) {
            return;
          }
          if ($scope.searching !== true) {
            if ($rootScope.newRecordHasBeenEdited !== true) {
              $scope.selected = scopeIndex;
            } else {
              $scope.selected = scopeIndex + 1;
              $scope.createRecord($scope.newFieldData);
            }
            // if(scopeIndex === "newEntry"){
            //   $scope.setFocusOn("firstFieldOfNewEntry");
            // }else{
            //   $scope.setFocusOn("firstFieldOfEditingEntry");
            // }
          }
        };

        $scope.editSearchResults = function(scopeIndex) {
          $scope.selected = scopeIndex;
        };

        $scope.selectNone = function() {
          $scope.selected = undefined;
        };

        $scope.runSearch = function(searchTerm) {
          // Create object from fields displayed in scope to later be able to
          // notify user if search result is from a hidden field
          var fieldsInScope = {};
          for (var key in $scope.fields) {
            fieldsInScope[$scope.fields[key].label] = true;
          }
          if ($rootScope.template === "fulltemplate" || $rootScope.template === "mcgillfieldmethodsspring2014template" || $rootScope.template === "yalefieldmethodsspring2014template") {
            fieldsInScope.datumTags = true;
            fieldsInScope.comments = true;
          }

          fieldsInScope.dateModified = true;
          fieldsInScope.lastModifiedBy = true;

          if ($scope.searchHistory) {
            $scope.searchHistory = $scope.searchHistory + " > " + searchTerm;
          } else {
            $scope.searchHistory = searchTerm;
          }
          // Converting searchTerm to string to allow for integer searching
          searchTerm = searchTerm.toString().toLowerCase();
          var newScopeData = [];
          // if (!$scope.activeSession) {
          // Search allData in scope
          for (var i in $scope.allData) {
            // Determine if record should be included in session search
            var searchTarget = false;
            if (!$scope.activeSession) {
              searchTarget = true;
            } else if ($scope.allData[i].sessionID === $scope.activeSession) {
              searchTarget = true;
            }
            if (searchTarget === true) {
              for (var fieldkey in $scope.allData[i]) {
                if ($scope.allData[i][fieldkey]) {
                  // Limit search to visible data
                  if (fieldsInScope[fieldkey] === true) {
                    if (fieldkey === "datumTags") {
                      var tagString = JSON.stringify($scope.allData[i].datumTags);
                      tagString = tagString.toString().toLowerCase();
                      if (tagString.indexOf(searchTerm) > -1) {
                        newScopeData.push($scope.allData[i]);
                        break;
                      }
                    } else if (fieldkey === "comments") {
                      for (var j in $scope.allData[i].comments) {
                        for (var commentKey in $scope.allData[i].comments[j]) {
                          if ($scope.allData[i].comments[j][commentKey].toString()
                            .indexOf(searchTerm) > -1) {
                            newScopeData.push($scope.allData[i]);
                            break;
                          }
                        }
                      }
                    } else {
                      var dataString = $scope.allData[i][fieldkey].toString()
                        .toLowerCase();
                      if (dataString.indexOf(searchTerm) > -1) {
                        newScopeData.push($scope.allData[i]);
                        break;
                      }
                    }
                  }
                }
              }
            }
          }

          if (newScopeData.length > 0) {
            $scope.allData = newScopeData;
            $scope.data = $scope.allData.slice(0, $rootScope.resultSize);
          } else {
            $rootScope.notificationMessage = "No records matched your search.";
            $rootScope.openNotification();
          }
        };

        $scope.selectAll = function() {
          for (var i in $scope.allData) {
            if (!$scope.activeSession) {
              $scope.allData[i].checked = true;
            } else if ($scope.allData[i].sessionID === $scope.activeSession) {
              $scope.allData[i].checked = true;
            }
          }
        };

        $scope.exportResults = function() {
          $scope.open();
          var results = $filter('filter')($scope.allData, {
            checked: true
          });
          if (results.length > 0) {
            $scope.resultsMessage = results.length + " Record(s):";
            $scope.results = results;
          } else {
            $scope.resultsMessage = "Please select records to export.";
          }
        };

        // Add activities to scope object, to be uploaded when 'SAVE' is clicked
        $scope.addActivity = function(activityArray, uploadnow) {
          Data.blankActivityTemplate().then(
            function(sourceTemplate) {

              for (var index = 0; index < activityArray.length; index++) {
                var template = JSON.parse(JSON.stringify(sourceTemplate));
                var bareActivityObject = activityArray[index];

                bareActivityObject.verb = bareActivityObject.verb.replace("href=", "target='_blank' href=");
                bareActivityObject.directobject = bareActivityObject.directobject.replace("href=", "target='_blank' href=");
                bareActivityObject.indirectobject = bareActivityObject.indirectobject.replace("href=", "target='_blank' href=");

                template.appVersion = $rootScope.appVersion;
                template.verb = bareActivityObject.verb;
                template.verbicon = bareActivityObject.verbicon;
                template.directobjecticon = bareActivityObject.directobjecticon;
                template.directobject = bareActivityObject.directobject;
                template.indirectobject = bareActivityObject.indirectobject;
                template.teamOrPersonal = bareActivityObject.teamOrPersonal;
                template.user.username = $rootScope.user.username;
                template.user.gravatar = $rootScope.user.gravatar || "./../user/user_gravatar.png";
                template.user.id = $rootScope.user.username;
                template.user._id = $rootScope.user.username; //TODO remove this too eventually...
                template.dateModified = JSON.parse(JSON.stringify(new Date())); //TODO #1109 eventually remove date modified?
                template.timestamp = Date.now();

                $scope.activities.push(template);

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
                    activitydb = $rootScope.DB.pouchname + "-activity_feed";
                  } else {
                    activitydb = $rootScope.user.username + "-activity_feed";
                  }

                  Data
                    .saveCouchDoc(activitydb, $scope.activities[index])
                    .then(
                      function(response) {
                        if(debugging){
                          console.log("Saved new activity", response);
                        }
                        // Deleting so that indices in scope are unchanged
                        delete $scope.activities[index];
                      },
                      function(reason) {
                        window
                          .alert("There was an error saving the activity. " + reason);
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
            Data.register(dataToPost).then(function(response) {
              if(debugging){
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
            Data.createcorpus(dataToPost).then(function(response) {

              // Add new corpus to scope
              var newCorpus = {};
              newCorpus.pouchname = response.corpus.pouchname;
              newCorpus.title = response.corpus.title;
              var directObjectString = "<a href='#corpus/" + response.corpus.pouchname + "'>" + response.corpus.title + "</a>";
              $scope.addActivity([{
                verb: "added",
                verbicon: "icon-plus",
                directobjecticon: "icon-cloud",
                directobject: directObjectString,
                indirectobject: "",
                teamOrPersonal: "personal"
              }], "uploadnow");

              $scope.corpora.push(newCorpus);
              $rootScope.loading = false;
              window.location.assign("#/");
            });
          } else {
            $rootScope.notificationMessage = "Please verify corpus name.";
            $rootScope.openNotification();
            $rootScope.loading = false;
          }
        };

        $scope.loadUsersAndRoles = function() {
          // Get all users and roles (for this corpus) from server

          var dataToPost = {};

          dataToPost.username = $rootScope.loginInfo.username;
          dataToPost.password = $rootScope.loginInfo.password;
          dataToPost.serverCode = $rootScope.serverCode;
          dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");
          dataToPost.pouchname = $rootScope.DB.pouchname;


          Data.getallusers(dataToPost).then(function(users) {
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
            Data.async("_users", "org.couchdb.user:" + $rootScope.loginInfo.username)
              .then(
                function(response) {
                  $rootScope.admin = false;
                  $rootScope.readPermissions = false;
                  $rootScope.writePermissions = false;
                  $rootScope.commentPermissions = false;

                  if (response.roles.indexOf($rootScope.DB.pouchname + "_admin") > -1) {
                    $rootScope.admin = true;
                  }
                  if (response.roles.indexOf($rootScope.DB.pouchname + "_reader") > -1) {
                    $rootScope.readPermissions = true;
                  }
                  if (response.roles.indexOf($rootScope.DB.pouchname + "_writer") > -1) {
                    $rootScope.writePermissions = true;
                  }
                  if (response.roles.indexOf($rootScope.DB.pouchname + "_commenter") > -1) {
                    $rootScope.commentPermissions = true;
                  }
                });
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

          newUserRoles.pouchname = $rootScope.DB.pouchname;

          var dataToPost = {};
          dataToPost.username = $rootScope.user.username.trim();
          dataToPost.password = $rootScope.loginInfo.password.trim();
          dataToPost.serverCode = $rootScope.serverCode;
          dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");

          dataToPost.userRoleInfo = newUserRoles;

          Data.updateroles(dataToPost).then(function(response) {
            if(debugging){
              console.log(response);
            }
            var indirectObjectString = "on <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a> as " + rolesString;
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

        $scope.removeUserFromCorpus = function(userid) {
          // Prevent an admin from removing him/herself from a corpus; This
          // helps to avoid a situation in which there is no admin for a
          // corpus
          if (userid === $rootScope.user.username) {
            window
              .alert("You cannot remove yourself from a corpus.\nOnly another Admin can remove you.");
            return;
          }

          var r = confirm("Are you sure you want to remove " + userid + " from this corpus?\nNOTE: This will remove ALL user roles for " + userid + ". However, you may add this user again with new permissions.");
          if (r === true) {

            var dataToPost = {};
            dataToPost.username = $rootScope.user.username.trim();
            dataToPost.password = $rootScope.loginInfo.password.trim();
            dataToPost.serverCode = $rootScope.serverCode;
            dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");

            dataToPost.userRoleInfo = {};
            dataToPost.userRoleInfo.usernameToModify = userid;
            dataToPost.userRoleInfo.pouchname = $rootScope.DB.pouchname;
            dataToPost.userRoleInfo.removeUser = true;

            Data.updateroles(dataToPost).then(function(response) {
              if(debugging){
                console.log(response);
              }
              var indirectObjectString = "from <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
              $scope.addActivity([{
                verb: "removed",
                verbicon: "icon-remove-sign",
                directobjecticon: "icon-user",
                directobject: dataToPost.userRoleInfo.usernameToModify,
                indirectobject: indirectObjectString,
                teamOrPersonal: "personal"
              }, {
                verb: "removed",
                verbicon: "icon-remove-sign",
                directobjecticon: "icon-user",
                directobject: dataToPost.userRoleInfo.usernameToModify,
                indirectobject: indirectObjectString,
                teamOrPersonal: "team"
              }], "uploadnow");

            });
          }
        };

        $scope.commaList = function(tags) {
          var tagString = "";
          for (var i = 0; i < tags.length; i++) {
            if (i < (tags.length - 1)) {
              if (tags[i].tag) {
                tagString = tagString + tags[i].tag + ", ";
              }
            } else {
              if (tags[i].tag) {
                tagString = tagString + tags[i].tag;
              }
            }
          }
          if (tagString === "") {
            return "Tags";
          }
          return tagString;
        };

        // Paginate data tables

        $scope.numberOfResultPages = function(numberOfRecords) {
          var numberOfPages = Math
            .ceil(numberOfRecords / $rootScope.resultSize);
          return numberOfPages;
        };

        $scope.loadPaginatedData = function() {
          var lastRecordOnPage = (($rootScope.currentPage + 1) * $rootScope.resultSize);
          var firstRecordOnPage = lastRecordOnPage - $rootScope.resultSize;

          if ($scope.allData) {
            $scope.data = $scope.allData.slice(firstRecordOnPage, lastRecordOnPage);
          }
        };

        document.getElementById("hideOnLoad").style.visibility = "visible";

        $scope.testFunction = function() {
          console.log($rootScope.currentPage);
        };

        $scope.pageForward = function() {
          $scope.selected = null;
          $rootScope.currentPage = $rootScope.currentPage + 1;
        };

        $scope.pageBackward = function() {
          $scope.selected = null;
          $rootScope.currentPage = $rootScope.currentPage - 1;
        };
        // Audio recording

        function hasGetUserMedia() {
          return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
        }

        if (hasGetUserMedia()) {
          $rootScope.audioCompatible = true;
        } else {
          $rootScope.audioCompatible = false;
        }

        var onFail = function(e) {
          $scope.recordingStatus = "Record";
          $scope.recordingButtonClass = "btn btn-success";
          $scope.recordingIcon = "fa-microphone";
          console.log('Audio Rejected!', e);
          $rootScope.notificationMessage = "Unable to record audio.";
          $rootScope.openNotification();
        };

        var onSuccess = function(s) {
          window.AudioContext = window.AudioContext || window.webkitAudioContext;
          var context = new AudioContext();
          var mediaStreamSource = context.createMediaStreamSource(s);
          try {
            recorder = new Recorder(mediaStreamSource);
            recorder.record();
          } catch (error) {
            onFail(error);
          }
        };

        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia || navigator.msGetUserMedia;

        var recorder;

        // Functions to open/close audio warning modal
        var openAudioWarning = function() {
          $scope.audioWarningShouldBeOpen = true;
        };

        $scope.closeAudioWarning = function() {
          $scope.audioWarningShouldBeOpen = false;
        };

        var audioRecordingInterval;

        $scope.startRecording = function(datum) {
          if (navigator.getUserMedia) {
            $scope.datumForAudio = datum;
            openAudioWarning();
            $scope.timeLeftForAudio = "5 minutes 0 seconds";
            // Begin countdown
            var minutes = 5;
            var seconds = 0;
            audioRecordingInterval = setInterval(function() {
              if (seconds === 0) {
                if (minutes === 0) {
                  clearInterval(audioRecordingInterval);
                  stopRecording(datum);
                  $scope.audioWarningShouldBeOpen = false;
                  return;
                } else {
                  minutes--;
                  seconds = 59;
                }
              }
              var minuteText;
              if (minutes > 0) {
                minuteText = minutes + (minutes > 1 ? ' minutes' : ' minute');
              } else {
                minuteText = '';
              }
              var secondText = seconds + (seconds > 1 ? ' seconds' : ' second');
              seconds--;
              $scope.$apply(function() {
                $scope.timeLeftForAudio = minuteText + " " + secondText;
              });
            }, 1000);
            $scope.recordingButtonClass = "btn btn-success disabled";
            $scope.recordingStatus = "Recording";
            $scope.recordingIcon = "fa fa-rss";
            navigator.getUserMedia({
              audio: true
            }, onSuccess, onFail);
          } else {
            $scope.recordingStatus = "Record";
            console.log('navigator.getUserMedia not present');
          }
        };

        $scope.stopRecording = function(datum) {
          if (recorder) {
            recorder.stop();
            $scope.closeAudioWarning();
            clearInterval(audioRecordingInterval);
            $scope.recordingStatus = "Record";
            $scope.recordingButtonClass = "btn btn-success";
            $scope.recordingIcon = "fa-microphone";
            if ($scope.processingAudio) {
              return; //avoid double events which were leading to double audio.
            }
            $scope.processingAudio = true;

            recorder.exportWAV(function(s) {
              $scope.uploadFile(datum, s);
            });
          } else {
            $scope.closeAudioWarning();
            $scope.recordingStatus = "Record doesn't appear to be working currently in your browser";
            $scope.recordingButtonClass = "btn";
            $scope.recordingIcon = "fa-microphone-slash";
          }
        };

        $scope.uploadFile = function(datum, file) {
          if (!datum || !datum.id) {
            $rootScope.newRecordHasBeenEdited = true;
          }

          // if($scope.processingAudio){
          //   return; //avoid double events which were leading to double audio.
          // }
          $scope.processingAudio = true;

          var blobToBase64 = function(blob, cb) {
            var reader = new FileReader();
            reader.onload = function() {
              var dataUrl = reader.result;
              var base64 = dataUrl.split(',')[1];
              cb(base64);
            };
            reader.readAsDataURL(blob);
          };

          var base64File;
          var inputBoxPrefix;
          // Test to see if this is a new datum
          if (!datum || !datum.id) {
            inputBoxPrefix = "new_datum";
          } else {
            inputBoxPrefix = datum.id;
          }

          // Create attachments

          var newAttachments = {};

          // // If a new file, set up attachments structure, to be saved later
          if (!datum || !datum.id) {
            if (!datum) {
              datum = {};
            }
            datum._attachments = {};
            datum.audioVideo = [];
          }

          var numberOfFiles;
          if (file) {
            numberOfFiles = 1;
          } else {
            numberOfFiles = document.getElementById(inputBoxPrefix + "_audio-file").files.length;
            // Disable upload button after uploading file(s) once in new datum; cannot reset file input in non-async task
            if (!datum || !datum.id) {
              $scope.newDatumHasAudioToUpload = true;
            }
          }

          // Check to see if user has clicked on upload without recording or uploading files
          if (numberOfFiles === 0 || numberOfFiles === null) {
            // $rootScope.editsHaveBeenMade = false;
            $scope.processingAudio = false;
            $scope.newDatumHasAudioToUpload = false;
            document.getElementById("form_" + inputBoxPrefix + "_audio-file").reset();
            $rootScope.notificationMessage = "Please record or select audio to upload.";
            $rootScope.openNotification();
            return;
          }
          var doSomethingWithAudio = function(index) {
              blobToBase64(file || document.getElementById(inputBoxPrefix + "_audio-file").files[index], function(x) {
                base64File = x;
                var filename;
                var description;
                var contentType;
                if (file) {
                  filename = Date.now() + ".wav";
                  contentType = "audio\/wav";
                  description = "";
                } else {
                  // Test to see if this is a new datum
                  var fileExt;
                  if (!datum || !datum.id) {
                    fileExt = document.getElementById("new_datum_audio-file").files[index].type.split("\/").pop();
                  } else {
                    fileExt = document.getElementById(datum.id + "_audio-file").files[index].type.split("\/").pop();
                  }
                  if (fileExt !== ("mp3" || "mpeg" || "wav" || "ogg")) {
                    $rootScope.notificationMessage = "You can only upload audio files with extensions '.mp3', '.mpeg', '.wav', or '.ogg'.";
                    $rootScope.openNotification();
                    return;
                  }
                  filename = Date.now() + "" + index + "." + fileExt; // appending index in case of super-rapid processing on multi-file upload, to avoid duplicate filenames
                  contentType = "audio\/" + fileExt;
                  description = document.getElementById(inputBoxPrefix + "_audio-file").files[index].name;
                }

                var newAttachment = {};
                newAttachment = {
                  "contentType": contentType,
                  "data": base64File
                };
                // if(newAttachments[filename]){
                //   return; //try to avoid double of the same file...
                // }
                newAttachments[filename] = newAttachment;
                newAttachments[filename].description = description;

                // Push attachment to scope if new record, to be saved later
                if (!datum || !datum.id) {
                  var newScopeAttachment = {
                    "filename": filename,
                    "description": newAttachments[filename].description,
                    "URL": $rootScope.server + "/" + $rootScope.DB.pouchname + "/" + datum.id + "/" + filename,
                    "type": "audio"
                  };

                  $scope.$apply(function() {
                    if (datum._attachments[filename]) {
                      return; //try to avoid double of the same file...
                    }
                    datum._attachments[filename] = newAttachments[filename];
                    if (!Array.isArray(datum.audioVideo)) {
                      console.log("Upgrading audioVideo to a collection", datum.audioVideo);
                      var audioVideoArray = [];
                      if (datum.audioVideo.URL) {
                        var audioVideoURL = datum.audioVideo.URL;
                        var fileFromUrl = audioVideoURL.subset(audioVideoURL.lastIndexOf("/"));
                        audioVideoArray.push({
                          "filename": fileFromUrl,
                          "description": fileFromUrl,
                          "URL": audioVideoURL,
                          "type": "audio"
                        });
                      }
                      datum.audioVideo = audioVideoArray;
                    }
                    datum.audioVideo.push(newScopeAttachment);
                  });
                }
              });
            };
          for (var i = 0; i < numberOfFiles; i++) {
            doSomethingWithAudio(i);
          }

          // Stop here if new datum record (i.e. do not upload yet)
          if (!datum || !datum.id) {

            // Force digest after recording audio
            if (file) {
              $scope.$apply(function() {
                $scope.newFieldDatahasAudio = true;
                $scope.processingAudio = false;
              });
            } else {
              $scope.newFieldDatahasAudio = true;
              $scope.processingAudio = false;
            }
            return;
          }

          // Save new attachments for existing record
          Data.async($rootScope.DB.pouchname, datum.id).then(function(originalDoc) {
            var rev = originalDoc._rev;
            console.log(rev);
            var key;
            if (originalDoc._attachments === undefined) {
              originalDoc._attachments = {};
            }

            for ( key in newAttachments) {
              originalDoc._attachments[key] = newAttachments[key];
            }
            // Update scope attachments
            if (!datum.audioVideo) {
              datum.audioVideo = [];
            }
            if (!Array.isArray(datum.audioVideo)) {
              console.log("Upgrading audioVideo to a collection", datum.audioVideo);
              var audioVideoArray = [];
              for (var audioVideoItem in datum.audioVideo) {
                if (datum.audioVideo.hasOwnProperty(audioVideoItem) && datum.audioVideo.audioVideoItem.URL) {
                  var audioVideoURL = datum.audioVideo.audioVideoItem.URL;
                  var fileFromUrl = audioVideoURL.subset(audioVideoURL.lastIndexOf("/"));
                  audioVideoArray.push({
                    "filename": fileFromUrl,
                    "description": fileFromUrl,
                    "URL": audioVideoURL,
                    "type": "audio"
                  });
                }
              }
              datum.audioVideo = audioVideoArray;
            }
            for ( key in newAttachments) {
              var newScopeAttachment = {
                "filename": key,
                "description": newAttachments[key].description,
                "URL": $rootScope.server + "/" + $rootScope.DB.pouchname + "/" + datum.id + "/" + key,
                "type": "audio"
              };

              datum.audioVideo.push(newScopeAttachment);

              var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
              $scope.addActivity([{
                verb: "recorded",
                verbicon: "icon-plus",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + newScopeAttachment.filename + "'>the audio file " + newScopeAttachment.description + " (" + newScopeAttachment.filename + ") on " + datum.utterance + "</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "personal"
              }, {
                verb: "recorded",
                verbicon: "icon-plus",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + newScopeAttachment.filename + "'>the audio file " + newScopeAttachment.description + " (" + newScopeAttachment.filename + ") on " + datum.utterance + "</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "team"
              }], "uploadnow");
            }
            datum.hasAudio = true;
            originalDoc.audioVideo = datum.audioVideo;
            //Upgrade to v1.90
            if (originalDoc.attachmentInfo) {
              delete originalDoc.attachmentInfo;
            }
            // console.log(originalDoc.audioVideo);
            Data.saveCouchDoc($rootScope.DB.pouchname, originalDoc).then(function(response) {
              console.log("Successfully uploaded attachment.");
              if(debugging){
                console.log(response);
              }


              // Reset file input field
              document.getElementById("form_" + inputBoxPrefix + "_audio-file").reset();

              $scope.processingAudio = false;
            });
          });
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
            Data.async($rootScope.DB.pouchname, datum.id).then(function(originalRecord) {
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
              Data.saveCouchDoc($rootScope.DB.pouchname, originalRecord).then(function(response) {
                console.log("Saved attachment as trashed.");
                if(debugging){
                  console.log(response);
                }
                var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
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
                // Data.async($rootScope.DB.pouchname, datum.id).then(function(record) {
                //   // Delete attachment info for deleted record
                //   for (var key in record.attachmentInfo) {
                //     if (key === filename) {
                //       delete record.attachmentInfo[key];
                //     }
                //   }
                //   Data.saveCouchDoc($rootScope.DB.pouchname, datum.id, record, record._rev).then(function(response) {
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
            $scope.savedStateButtonClass = "btn btn-success";
            return "Saved";
          } else if ($scope.saved === "no") {
            $scope.savedStateButtonClass = "btn btn-danger";
            return "Save";
          } else {
            $scope.savedStateButtonClass = "pulsing";
            return "Saving";
          }
        };

        $scope.contactUs = function() {
          window.open("https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform");
        };

        $scope.setFocusOn = function(elementId){
          $timeout(function(){
            if(document.getElementById(elementId)){
              // console.log("old focus" , document.activeElement);
              // document.getElementById(elementId).focus();
              // console.log("new focus" , document.activeElement);

            }else{
              console.warn("requesting focus on an element that doesnt exist.");
            }
          },500);
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
            Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
            // Update users to new saved state preferences if they were absent
            if (!Preferences.savedState) {
              Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
              Preferences.savedState = {};
              localStorage.setItem('SpreadsheetPreferences', JSON
                .stringify(Preferences));
              $scope.documentReady = true;
            } else if (Preferences.savedState && Preferences.savedState.server && Preferences.savedState.username && Preferences.savedState.password) {
              $rootScope.serverCode = Preferences.savedState.server;
              var auth = {};
              auth.server = Preferences.savedState.server;
              auth.user = Preferences.savedState.username;
              try {
                auth.password = sjcl.decrypt("password", Preferences.savedState.password);
              } catch (err) {
                // User's password has not yet been encrypted; encryption will be updated on login.
                auth.password = Preferences.savedState.password;
              }
              $scope.loginUser(auth);
              // Upgrade to v92 where corpus info is not saved in the prefs, only the pouchbame
              if (Preferences.savedState.DB) {
                Preferences.savedState.mostRecentCorpusPouchname = Preferences.savedState.DB.pouchname;
                delete Preferences.savedState.DB;
              }
              if (Preferences.savedState.mostRecentCorpusPouchname) {
                $rootScope.DB = {
                  pouchname: Preferences.savedState.mostRecentCorpusPouchname
                };
                if (Preferences.savedState.sessionID) {
                  // Load all sessions and go to current session
                  $scope.loadSessions(Preferences.savedState.sessionID);
                  $scope.navigateVerifySaved('none');
                } else {
                  $scope.loadSessions();
                }
              } else {
                $scope.documentReady = true;
              }
            } else {
              $rootScope.openWelcomeNotification();
              $scope.documentReady = true;
            }
          }
        });
        $scope.resetPasswordInfo = {};
        $scope.changePasswordSubmit = function() {
          if ($scope.resetPasswordInfo.confirmpassword !== $scope.resetPasswordInfo.newpassword) {
            $rootScope.notificationMessage = "New passwords don't match.";
            $rootScope.openNotification();
          }

          $scope.resetPasswordInfo.username = $rootScope.user.username;
          Data.changePassword($scope.resetPasswordInfo).then(function(response) {
            if(debugging){
              console.log(response);
            }
            Data.login($scope.resetPasswordInfo.username, $scope.resetPasswordInfo.confirmpassword);

            Preferences.savedState.password = sjcl.encrypt("password", $scope.resetPasswordInfo.confirmpassword);
            localStorage.setItem('SpreadsheetPreferences', JSON.stringify(Preferences));

            $scope.resetPasswordInfo = {};
            $scope.showResetPassword = false;
            $rootScope.notificationMessage = "Successfully updated password";
            $rootScope.openNotification();


          }, function(reason) {
            console.log(reason);
            var message = "Please report this.";
            if (reason.status === 0) {
              message = "Are you offline?";
            } else {
              message = reason.data.userFriendlyErrors.join(" ");
            }
            $rootScope.notificationMessage = "Error updating password. " + message;
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
          if ($scope.saved === "no") {
            return "You currently have unsaved changes!\n\nIf you wish to save these changes, cancel and then save before reloading or closing this app.\n\nOtherwise, any unsaved changes will be abandoned.";
          } else {
            return;
          }
        };

      };
    SpreadsheetStyleDataEntryController.$inject = ['$scope', '$rootScope',
      '$resource', '$filter', '$document', 'Data', 'Servers', 'md5', '$timeout'
    ];
