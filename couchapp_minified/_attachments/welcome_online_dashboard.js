//if (localStorage.getItem("username") == "public" || !localStorage.getItem("username")) {
if(window.location.origin != "localhost"){
  if(window.location.protocol == "http:"){
    window.location.replace(window.location.href.replace("http","https"));
  }
}
window.location.replace("corpus.html");
// } else {
// window.location.replace("user.html");
// }
