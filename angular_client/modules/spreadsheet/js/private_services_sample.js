console.log("Loading the SpreadsheetPrivateServices.");

'use strict';
define(
  ["angular"],
  function(angular) {
    var SpreadsheetPrivateServices = angular
      .module('spreadsheet_private_services', [])
      .factory(
        'Servers',
        function($http, $rootScope) {

          var localhost = true;
          var servers = {};

          if (localhost) {
            servers.localhost = {
              auth: "https://localhost:3183",
              corpus: "https://localhost:6984",
              serverCode: "localhost",
              userFriendlyServerName: "Localhost"
            };
          }
          servers.testing = {
            auth: "https://authdev.example.org",
            corpus: "https://corpusdev.example.org",
            serverCode: "testing",
            userFriendlyServerName: "Example Beta"
          };

          // servers.production = {
          //   auth: "https://auth.example.org",
          //   corpus: "https://corpus.example.org",
          //   serverCode: "production",
          //   userFriendlyServerName: "Example"
          // };

          return {
            'getServiceUrl': function(label, serviceType) {
              var serverInfo = {};

              serverInfo = servers[label];  
              if (!serverInfo) {
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