document.addEventListener("deviceready", onDeviceReady, true);
// PhoneGap is now ready

function onDeviceReady() {
// Write your code here
  console.log("The device is ready.");
}

var pictureSource;   // picture source
var destinationType; // sets the format of returned value 

// Wait for PhoneGap to connect with the device
//
document.addEventListener("deviceready",onDeviceReady,false);

// PhoneGap is ready to be used!
//
function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
  // Uncomment to view the base64 encoded image data
  // console.log(imageData);

  // Get image handle
  //
  var smallImage = document.getElementById('smallImage');

  // Unhide image elements
  //
  smallImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  smallImage.src = "data:image/jpeg;base64," + imageData;
}

// Called when a photo is successfully retrieved
//
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the image file URI 
  // console.log(imageURI);

  // Get image handle
  //
  var largeImage = document.getElementById('largeImage');

  // Unhide image elements
  //
  largeImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  largeImage.src = imageURI;
}

// A button will call this function
//
function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50 });
}

// A button will call this function
//
function capturePhotoEdit() {
  // Take picture using device camera, allow edit, and retrieve image as base64-encoded string  
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 20, allowEdit: true }); 
}

// A button will call this function
//
function getPhoto(source) {
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, 
    destinationType: destinationType.FILE_URI,
    sourceType: source });
}

// Called if something bad happens.
// 
function onFail(message) {
  alert('Failed because: ' + message);
}

// Called when capture operation is finished
//
function captureSuccess(mediaFiles) {
  var i, len;
  for (i = 0, len = mediaFiles.length; i < len; i += 1) {
    uploadFile(mediaFiles[i]);
  }
}

// Called if something bad happens.
// 
function captureError(error) {
  var msg = 'An error occurred during capture: ' + error.code;
  navigator.notification.alert(msg, null, 'Uh oh!');
}

// A button will call this function
//
function captureAudio() {
  // Launch device audio recording application,
  // allowing user to capture up to 2 audio clips
  navigator.device.capture.captureAudio(captureSuccess, captureError, {
    limit : 2
  });
}
// Upload files to server
function uploadFile(mediaFile) {
//  var ft = new FileTransfer(), path = mediaFile.fullPath, name = mediaFile.name;
//
//  ft.upload(path, "http://my.domain.com/upload.php", function(result) {
//    console.log('Upload success: ' + result.responseCode);
//    console.log(result.bytesSent + ' bytes sent');
//  }, function(error) {
//    console.log('Error uploading file ' + path + ': ' + error.code);
//  }, {
//    fileName : name
//  });
}