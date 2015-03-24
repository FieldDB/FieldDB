OPrime = OPrime || {};
OPrime.couchURL = function() {
  var corpusURL = window.location.origin;
  var connection = {
    complete : corpusURL + "/lingllama-cherokee-activity_feed/",
    protocol : "https://",
    domain : corpusURL.replace("https://", "").replace("http://", ""),
    port : "",
    db : "lingllama-cherokee-activity_feed/"
  };
  if (corpusURL.indexOf("corpusdev.lingsync.org") >= 0) {
    corpusURL = "https://corpusdev.lingsync.org";
    connection.domain = "corpusdev.lingsync.org";
  } else if (corpusURL.indexOf("lingsync.org") >= 0) {
    corpusURL = "https://corpus.lingsync.org";
    connection.domain = "corpus.lingsync.org";
  } else if (corpusURL.indexOf("prosody.linguistics.mcgill") >= 0) {
    corpusURL = "https://prosody.lingsync.org";
    connection.domain = "prosody.lingsync.org";
  } else if (corpusURL.indexOf("localhost") >= 0) {
    corpusURL = window.location.origin;
    connection.port = ":" + window.location.port;
    connection.domain = "localhost";

  } else if (window.location.origin.indexOf("ocmdknddgpmjngkhcbcofoogkommjfoj") >= 0) {
    corpusURL = "https://corpus.lingsync.org";
    connection.domain = "corpus.lingsync.org";
  } else if (window.location.origin.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
    corpusURL = "https://corpus.lingsync.org";
    connection.domain = "corpus.lingsync.org";
  } else if (window.location.origin.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
    corpusURL = "https://corpus.lingsync.org";
    connection.domain = "corpus.lingsync.org";
  } else {
//    corpusURL = "https://localhost:6984";
//    connection.port = ":6984";
//    connection.domain = "localhost";
    corpusURL = "https://corpus.lingsync.org";
    connection.domain = "corpus.lingsync.org";
  }
  connection.complete = corpusURL + "/lingllama-cherokee-activity_feed/";
  return connection;
};
