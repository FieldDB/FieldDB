/* If they have an old link, redirect them */
if (window.location.origin.indexOf("ifielddevs.iriscouch.com") >= 0 ){
  var newTestingServerWithCORS = window.location.href.replace("ifielddevs.iriscouch.com", "corpusdev.lingsync.org");
  if (window.location.protocol == "http:") {
    newTestingServerWithCORS = newTestingServerWithCORS.replace("http", "https");
  }
  window.location.replace();
}

/* Make sure they use the https versions, if they are on a couchapp */
if (window.location.origin.indexOf("localhost") == -1) {
  if (window.location.protocol == "http:") {
    window.location.replace(window.location.href.replace("http", "https"));
  }
}


//if (localStorage.getItem("username") == "public" || !localStorage.getItem("username")) {
window.location.replace("corpus.html");
// } else {
// window.location.replace("user.html");
// }
