OPrime = OPrime  || {};
OPrime.couchURL = function() {
  
  return {
    complete : window.location.origin+"/lingllama-cherokee-activity_feed/",
    protocol : "https://",
    domain : window.location.origin.replace("https://","").replace("http://",""),
    port : "",
    db : "lingllama-cherokee-activity_feed/"
  };
};
