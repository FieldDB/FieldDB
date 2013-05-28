define([], function() {

  var DropUp = (function() {

    var stored = localStorage.stored && JSON.parse(localStorage.stored) || [];
    var dropupElement;

    var addToStorage = function(img) {
      stored.push({
        "path" : img,
        "date" : (new Date())
      });
      localStorage.stored = JSON.stringify(stored);
    };

    var startUpload = function(file, bin, li, desc, progress) {

      var xhr = new XMLHttpRequest(), upload = xhr.upload;

      upload.addEventListener("progress", function(e) {
        if (e.lengthComputable) {
          var percentage = Math.round((e.loaded * 100) / e.total);
          if (percentage < 100) {
            progress.style.width = percentage + "px";
          }
        }
      }, false);

      xhr.onload = function(event) {

        if (xhr.status === 200) {

          if (li) {
            $(li).addClass("loaded");
            $(li).find(".wrapper a").attr("href", xhr.responseText + ".html");
          } else {
            console.log("Loaded: " + xhr.responseText);
          }

          if (desc) {
            desc.innerHTML = "<a href='/" + xhr.responseText + ".html'>"
                + xhr.responseText + "</a>" + "<a class='remove' data-path='"
                + xhr.responseText + "'>remove</a>";
          } else {
            console.log("/" + xhr.responseText + ".html " + xhr.responseText);
          }

          addToStorage(xhr.responseText);

        } else {
          if (li) {
            $(li).find(".loading").remove();
          }
          if (desc) {
            $(desc).addClass("error").text(
                "There was a problem uploading your file");
          } else {
            console.log("There was a problem uplaoding your file");
          }
        }
      };

      xhr.open("POST", "https://localhost:3184/uploadFile");

      xhr.setRequestHeader('Content-Type', 'multipart/form-data');
      xhr.setRequestHeader('X-File-Name', file.fileName);
      xhr.setRequestHeader('X-File-Size', file.fileSize);
      xhr.setRequestHeader('X-File-Type', file.type); // add additional
      // header
      xhr.send(file);

      // xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
      // xhr.sendAsBinary(bin)
    };

    /**
     * 
     */
    var fileLoaded = function(event, li, desc, progress) {

      var file = event.target.file;
      var getBinaryDataReader = new FileReader();

      if (progress) {
        progress.style.width = "0%";
      }
      if (li) {
        $li.find("img").attr("src", åevent.target.result);
        $(dropupElement).append(li);
      }

      var f = function(evt) {
        startUpload(file, evt.target.result, li, desc, progress);
      };

      if (!hasStupidChromeBug()) {
        getBinaryDataReader.addEventListener("loadend", f, false);
      } else {
        getBinaryDataReader.onload = f;
      }

      getBinaryDataReader.readAsBinaryString(file);
    };
    var validateFilesBeforeUpload = false;
    var csvFiletypes = "/text.(csv|xls|ods)/";
    var audioFiletypes = "/text.(wav|mp3|acc|ogg|mp4)/";
    var imageFiletypes = "/text.(png|jpg)/";
    var acceptableFileSize = 1048576 * 5;
    var drop = function(e) {

      var i, len, files, file;

      e.stopPropagation();
      e.preventDefault();

      files = e.dataTransfer.files;

      for (i = 0; i < files.length; i++) {

        file = files[i];

        if (validateFilesBeforeUpload) {
          if (file.size > (acceptableFileSize)) {
            $(dropupElement).append(
                "<li class='item'><p class='error'>" + "5MB Limit</li></p>");
            continue;
          }
          var acceptableFileTypes = audioFiletypes;
          if (!file.type.match(audioFiletypes)) {
            $(dropupElement).append(
                "<li class='item'><p class='error'>Sorry, "
                    + "you can only upload " + acceptableFileTypes + " files."
                    + "</p></li>");
            continue;
          }
        }

        reader = new FileReader();
        reader.index = i;
        reader.file = file;

        if (!hasStupidChromeBug()) {
          reader.addEventListener("loadend", fileLoaded, false);
        } else {
          reader.onload = fileLoaded;
        }
        // reader.addEventListener("loadend", fileLoaded, false);
        reader.readAsDataURL(file);
      }
    };

    var hasStupidChromeBug = function() {
      return typeof (FileReader.prototype.addEventListener) !== "function";
    };

    var doNothing = function(e) {
      e.stopPropagation();
      e.preventDefault();
    };

    var init = function(optionalTarget) {
      if (!optionalTarget) {
        optionalTarget = document.createElement("div");
        optionalTarget.classList.add("droparea");
        optionalTarget.setAttribute("id", "dropup-area");
        optionalTarget.innerHTML = "Drop files here to upload them";
        document.body.appendChild(optionalTarget);
      }
      dropupElement = optionalTarget;
      optionalTarget.addEventListener("dragenter", doNothing, false);
      optionalTarget.addEventListener("dragover", doNothing, false);
      optionalTarget.addEventListener("drop", drop, false);
    };

    return {
      "init" : init
    };
  })();

  return DropUp;
});
