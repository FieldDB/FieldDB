console.log("Loading the SpreadsheetPrivateServices.");

'use strict';
define(
  ["angular"],
  function(angular) {
    var SpreadsheetPrivateServices = angular
      .module('SpreadsheetStyleDataEntry.private_services', ['ngResource'])
      .factory(
        'Servers',
        function($http, $rootScope) {

          var localhost = false;

          var servers = {
            testing: {
              auth: "https://authdev.example.com",
              corpus: "https://corpusdev.example.com",
              serverCode: "testing",
              userFriendlyServerName: "Example Beta"
            },
            production: {
              auth: "https://auth.example.com",
              corpus: "https://corpus.example.com",
              serverCode: "production",
              userFriendlyServerName: "Example"
            }
          };

          if (localhost) {
            servers.unshift({
              localhost: {
                auth: "https://localhost:3183",
                corpus: "https://localhost:6984",
                serverCode: "localhost",
                userFriendlyServerName: "Localhost"
              }
            });
          }

          return {
            'getServiceUrl': function(label, serviceType) {
              var serverInfo = {};

              if (label == "localhost" || label == "production" || label == "testing") {
                serverInfo = servers[label];
              } else {
                throw "Request for an invalid server: " + label;
              }

              if (serviceType === "auth" || "corpus") {
                return serverInfo[serviceType];
              } else {
                return serverInfo;
              }

            },

            'getAvailable': function() {
              var serverCodeMappings = [];
              for (server in servers) {
                serverCodeMappings.push({
                  label: servers[server].serverCode,
                  value: servers[server].userFriendlyServerName
                });
              }
              return serverCodeMappings;
            },

            'getHumanFriendlyLabels': function() {
              var serverCodeMappings = [];
              for (server in servers) {
                serverCodeMappings[servers[server].serverCode] = servers[server].userFriendlyServerName
              }
              return serverCodeMappings;
            }

          };
        });
    return SpreadsheetPrivateServices;
  });