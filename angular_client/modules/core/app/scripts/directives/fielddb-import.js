'use strict';
/* globals FieldDB */

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbImport
 * @description
 *
 * uses drag and drop from https://github.com/codef0rmer/angular-dragdrop example: https://stackoverflow.com/questions/18679645/angularjs-drag-and-drop-plugin-drop-issue
 * # fielddbImport
 */
angular.module('fielddbAngularApp').directive('fielddbImport', function() {

  var controller = function($scope, $upload) {
    var processOffline = true;

    var progress = function(evt) {
      console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
    };
    var success = function(data, status, headers, config) {
      // file is uploaded successfully
      console.log(data, status, headers, config);
    };
    $scope.removeRow = function(row) {
      console.log('remove ', row);
      var removed = $scope.importer.asCSV.splice(row, 1);
      console.log(removed);
    };
    $scope.onFileSelect = function($files) {
      //$files: an array of files selected, each file has name, size, and type.
      if (processOffline) {
        $scope.importer = $scope.importer || new FieldDB.Import();
        $scope.importer.status = '';
        $scope.importer.error = '';
        $scope.importer.rawText = '';
        $scope.importer.importType = $scope.importer.importType || 'data';
        $scope.importer.corpus = $scope.corpus;
        $scope.importer.dbname = $scope.corpus.dbname || 'default';
        $scope.importer.files = $files;

        console.log($scope.importer);
        $scope.importer.readFiles({}).then(function(sucessfullOptions) {
          console.log('Finished reading files ', sucessfullOptions);
          $scope.$digest();
          $scope.importer.guessFormatAndPreviewImport();
          $scope.$digest();

        }, function(failedOptions) {
          console.log('Error reading files ', failedOptions);
          $scope.$digest();
        });
      } else {
        for (var i = 0; i < $files.length; i++) {
          var file = $files[i];

          $scope.upload = $upload.upload({
            url: 'server/upload/url', //upload.php script, node.js route, or servlet url
            //method: 'POST' or 'PUT',
            //headers: {'header-key': 'header-value'},
            //withCredentials: true,
            data: {
              myObj: $scope.myModelObj
            },
            file: file, // or list of files ($files) for html5 only
            //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
            // customize file formData name ('Content-Desposition'), server side file variable name.
            //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'
            // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
            //formDataAppender: function(formData, key, val){}
          }).progress(progress).success(success);
          //.error(...)
          //.then(success, error, progress);
          // access or attach event listeners to the underlying XMLHttpRequest.
          //.xhr(function(xhr){xhr.upload.addEventListener(...)})
        }
      }
      /* alternative way of uploading, send the file binary with the file's content-type.
           Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
           It could also be used to monitor the progress of a normal http post/put request with large data*/
      // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
    };
    /*jshint camelcase: false */
    $scope.locale = {
      locale_Import_First_Step: 'Step 1: Drag & drop, copy-paste or type your data into the text area, or select audio/video file(s) from your computer. Yes, you can edit the data inside the text area.',
      locale_Import_Second_Step: 'Step 2: Drag and drop or type the field names in column headers. Edit data in the table as needed.',
      locale_Add_Extra_Columns: 'Insert Extra Columns',
      locale_Attempt_Import: 'Import ' ,
      locale_Import_Third_Step: 'Step 3: The imported data will look like this. Edit in the table or the text area above as needed. Edit the datalist title and description, and the eliciation session section before finishing import.',
      locale_Import: 'Importer des liste(s) de classe (.csv)',
      locale_Drag_and_Drop_Placeholder: 'Drag and drop files, copy-paste or type your data here. (Or use the Choose file(s) button)'
    };
  };
  controller.$inject = ['$scope', '$upload'];

  var directiveDefinitionObject = {
    templateUrl: 'views/import.html',
    restrict: 'A',
    transclude: false,
    // scope: {
    //   importDetails: '=json'
    // },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: 'stringAlias'
  };
  return directiveDefinitionObject;
});
