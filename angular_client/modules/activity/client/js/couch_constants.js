OPrime = OPrime || {};
OPrime.couchURL = function() {
  var corpusURL = window.location.origin;
  var couchConnection = {
    complete : corpusURL + "/lingllama-cherokee-activity_feed/",
    protocol : "https://",
    domain : corpusURL.replace("https://", "").replace("http://", ""),
    port : "",
    db : "lingllama-cherokee-activity_feed/"
  };
  if (corpusURL.indexOf("corpusdev.lingsync.org") >= 0) {
    corpusURL = "https://corpusdev.lingsync.org";
    couchConnection.domain = "corpusdev.lingsync.org";
  } else if (corpusURL.indexOf("lingsync.org") >= 0) {
    corpusURL = "https://corpus.lingsync.org";
    couchConnection.domain = "corpus.lingsync.org";
  } else if (corpusURL.indexOf("prosody.linguistics.mcgill") >= 0) {
    corpusURL = "https://prosody.linguistics.mcgill.ca/corpus";
    couchConnection.domain = "prosody.linguistics.mcgill.ca/corpus";
  } else if (corpusURL.indexOf("localhost") >= 0) {
    corpusURL = window.location.origin;
    couchConnection.port = ":" + window.location.port;
    couchConnection.domain = "localhost";

  } else if (window.location.origin.indexOf("ocmdknddgpmjngkhcbcofoogkommjfoj") >= 0) {
    corpusURL = "https://corpus.lingsync.org";
    couchConnection.domain = "corpus.lingsync.org";
  } else if (window.location.origin.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
    corpusURL = "https://corpusdev.lingsync.org";
    couchConnection.domain = "corpusdev.lingsync.org";
  } else if (window.location.origin.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
    corpusURL = "https://prosody.linguistics.mcgill.ca/corpus";
    couchConnection.domain = "prosody.linguistics.mcgill.ca/corpus";
  } else {
    corpusURL = "https://localhost:6984";
    couchConnection.port = ":6984";
    couchConnection.domain = "localhost";
  }
  couchConnection.complete = corpusURL + "/lingllama-cherokee-activity_feed/";
  return couchConnection;
};
