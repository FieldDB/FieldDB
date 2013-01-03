if(localStorage.getItem("username") != "public"){
  window.location.replace("user.html");
}else{
  window.location.replace("corpus.html");
}
