'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbImport
 * @description
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

    $scope.onFileSelect = function($files) {
      //$files: an array of files selected, each file has name, size, and type.
      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];

        if (processOffline) {


        } else {
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
