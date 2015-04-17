console.log("Loading Webservices info");
/* Extends the OPrime class */
var OPrime = OPrime || {};

OPrime.apptype = "myaamia";

OPrime.websiteUrl = "http://myaamiacenter.org/";
OPrime.authUrl = "https://authdev.lingsync.org";
OPrime.audioUrl = "https://audiodev.lingsync.org";
OPrime.lexiconUrl = "https://lexicondev.lingsync.org";
OPrime.corpusUrl = "https://corpusdev.lingsync.org";
OPrime.activityUrl = "https://activitydev.lingsync.org";
OPrime.widgetUrl = "https://widgetdev.lingsync.org";

/*
 * Use the current app's chrome url, assuming if its a dev, they will have their
 * own url that is not from the market, and if its a bleeding edge user, they
 * will have the market one. In both cases it is save to return the
 * window.location.href but this code is added to be clear that there is also a
 * bleeding edge url for users.
 */
OPrime.chromeClientUrl = function(){
  if (window.location.origin != "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa"){
    return window.location.origin;
  }else{
    return "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa";
  }
};

/*
 * This function is the same in all webservicesconfig, now any couchapp can
 * login to any server, and register on the corpus server which matches its
 * origin.
 */
OPrime.defaultCouchConnection = function() {
  var localhost = {
    protocol : "https://",
    domain : "localhost",
    port : "6984",
    dbname : "default",
    path : "",
    authUrl : "https://localhost:3183",
    userFriendlyServerName : "Localhost"
  };
  var testing = {
    protocol : "https://",
    domain : "corpusdev.lingsync.org",
    port : "443",
    dbname : "default",
    path : "",
    authUrl : "https://authdev.lingsync.org",
    userFriendlyServerName : "LingSync Beta"
  };
  var production = {
    protocol : "https://",
    domain : "corpus.lingsync.org",
    port : "443",
    dbname : "default",
    path : "",
    authUrl : "https://auth.lingsync.org",
    userFriendlyServerName : "LingSync.org"
  };
  var mcgill = {
    protocol : "https://",
    domain : "prosody.linguistics.mcgill.ca",
    port : "443",
    dbname : "default",
    path : "/corpus",
    authUrl : "https://prosody.linguistics.mcgill.ca/auth",
    userFriendlyServerName : "McGill ProsodyLab"
  };
  var myaammia = {
      protocol : "https://",
      domain : "corpusdev.lingsync.org",
      port : "443",
      dbname : "default",
      path : "",
      authUrl : "https://authdev.lingsync.org",
      userFriendlyServerName : "LingSync Myaamia"
    };
  OPrime.servers = [ localhost, testing, production, mcgill, myaamia ];
  /*
   * If its a couch app, it can only contact databases on its same origin, so
   * modify the domain to be that origin. the chrome extension can contact any
   * authorized server that is authorized in the chrome app's manifest
   */
  var connection = testing;
  if (OPrime.isCouchApp()) {
    if (window.location.origin.indexOf("corpusdev.lingsync.org") >= 0) {
      connection = testing;
      OPrime.authUrl = "https://authdev.lingsync.org";
    } else if (window.location.origin.indexOf("lingsync.org") >= 0) {
      connection = production;
      OPrime.authUrl = "https://auth.lingsync.org";
    } else if (window.location.origin.indexOf("prosody.linguistics.mcgill") >= 0) {
      connection = mcgill;
      OPrime.authUrl = "https://prosody.linguistics.mcgill.ca/auth";
    } else if (window.location.origin.indexOf("localhost") >= 0) {
      connection = localhost;
      OPrime.authUrl = "https://localhost:3183";
    }
  } else if (OPrime.isChromeApp()) {
    if (window.location.origin.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
      connection = mcgill;
      OPrime.authUrl = "https://prosody.linguistics.mcgill.ca/auth";
    } else if (window.location.origin
        .indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
      connection = testing;
      OPrime.authUrl = "https://authdev.lingsync.org";
    } else if (window.location.origin
        .indexOf("ocmdknddgpmjngkhcbcofoogkommjfoj") >= 0) {
      connection = production;
      OPrime.authUrl = "https://auth.lingsync.org";
    } else if (window.location.origin
        .indexOf("docjbffdphmligpdknoebnljjgmfamfd") >= 0) {
      connection = myaamia;
      OPrime.authUrl = myaammia.authUrl;
    } else {
      /*
       * its probably a dev's chrome extension, use the corresponding connection
       * for this build
       */
      connection = testing;
      OPrime.authUrl = "https://authdev.lingsync.org";
    }
  }
  return connection;
};
OPrime.getAuthUrl = function(userFriendlyServerName) {
  var makingSureDefaultAuthIsSet = OPrime.defaultCouchConnection();
  var authUrl = userFriendlyServerName;
  if (authUrl.indexOf("LingSync.org") >= 0) {
    alert("This version of the app is only availible on Testing servers. It will be availible on the stable app sometime in February.");
    return;
    authUrl = "https://auth.lingsync.org";
  } else if (authUrl.indexOf("LingSync Beta") >= 0) {
    authUrl = "https://authdev.lingsync.org";
  } if (authUrl.indexOf("LingSync Myaamia") >= 0) {
    authUrl = "https://authdev.lingsync.org";
  } else if (authUrl.indexOf("McGill ProsodyLab") >= 0) {
    authUrl = "https://prosody.linguistics.mcgill.ca/auth/";
  } else if (authUrl.indexOf("Localhost") >= 0) {
    authUrl = "https://localhost:3183";
  } else {
    if (authUrl.indexOf("https://") >= 0) {
      var userWantsToUseUnknownServer = confirm("Are you sure you would like to use this server: "
          + authUrl);
      if (userWantsToUseUnknownServer == true) {
        OPrime
            .debug("User is using an unknown server, hope they know what they are doing...");
      } else {
        /*
         * TODO change this back to the lingsync server once the lingsync server
         * supports 1.38
         */
        authUrl = "https://authdev.lingsync.org";
      }
    } else {
      alert("I don't know how to connect to : "
          + authUrl
          + ", I only know how to connect to https servers. Please double check the server URL and ask one of your team members for help if this does this again.");
      return;
    }
  }
  /*
   * Make sure user uses the auth server for their corresponding couchapp or
   * chrome extension. for now dont let them switch between servers. to do that
   * we should do it manually to besure its safe. instead, simply take them to
   * that couchapp and let them log in there.
   */
  if (authUrl != OPrime.authUrl) {
    var userWantsToUseAMisMatchingServer = confirm("Are you sure you would like to use the "
        + userFriendlyServerName + " server?");
    if (userWantsToUseAMisMatchingServer == true) {
      var appropriateserver = _.pluck(OPrime.servers, "authUrl").indexOf(
          authUrl);
      if (appropriateserver == -1) {
        OPrime
            .bug("We don't know which corpus server to use, so we will just let the user do what they are trying to do.");
      } else {
        var couchConnection = OPrime.defaultCouchConnection();
        OPrime
            .bug("We know which corpus server to use, so we will just let the user do what they are trying to do but only in the couchapp.");
        couchConnection = OPrime.servers[appropriateserver];
        window.location.replace(OPrime.getCouchUrl(couchConnection, "")
            + "/public-firstcorpus/_design/pages/corpus.html");
      }
    } else {
      authUrl = OPrime.authUrl;
    }
  }

  return authUrl;
};

OPrime.getMostLikelyUserFriendlyAuthServerName = function(mostLikelyAuthUrl) {
  if (!mostLikelyAuthUrl) {
    mostLikelyAuthUrl = "LingSync.org";
  }
  var makingSureDefaultAuthIsSet = OPrime.defaultCouchConnection();
  var authUrl = OPrime.authUrl;
  if (window.location.origin.indexOf("prosody.linguistics.mcgill") >= 0) {
    mostLikelyAuthUrl = "McGill ProsodyLab";
  } else if (window.location.origin.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
    mostLikelyAuthUrl = "McGill ProsodyLab";
  } else if (window.location.origin.indexOf("corpusdev.lingsync.org") >= 0) {
    mostLikelyAuthUrl = "LingSync Beta";
  } else if (window.location.origin.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
    mostLikelyAuthUrl = "LingSync Beta";
  } else if (window.location.origin.indexOf("docjbffdphmligpdknoebnljjgmfamfd") >= 0) {
    mostLikelyAuthUrl = "LingSync Myaamia";
  } else if (window.location.origin.indexOf("localhost:8128") >= 0) {
    OPrime
        .debug("The user is in a touchdb app, not trying to reccomend their choice for an authserver");
  } else if (window.location.origin.indexOf("localhost") >= 0) {
    mostLikelyAuthUrl = "Localhost";
  } else if (OPrime.isChromeApp()) {
    if (OPrime.debugMode) OPrime.debug("The user is using an unknown chromeApp, most likley a developer but it could be an unknown chrome app from a ling department");
    var appropriateserver = _.pluck(OPrime.servers, "authUrl").indexOf(authUrl);
    if (appropriateserver == -1) {
      OPrime.bug("This shouldn't happen. Please report this bug.");
    } else {
      mostLikelyAuthUrl = OPrime.servers[appropriateserver].userFriendlyServerName;
    }
  }
  //TODO add Production when it can support 1.38+ ocmdknddgpmjngkhcbcofoogkommjfoj

  return mostLikelyAuthUrl;
};

OPrime.contactUs = "<a href='https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform' target='_blank'>Contact Us</a>";

/* TODO create your own public users prefs and save them to local storage, and then copy paste them here. */
OPrime.publicUserStaleDetails = function() {
  return JSON.stringify({
    token : "$2a$10$TpNxdbXtDQuFGBYW5BfnA.F7D0PUftrH1W9ERS7IdxkDdM.k7A5oy",
    encryptedUser : "confidential:VTJGc2RHVmtYMStIK3J2WU9kZWFGUS9WUS80S2EzbTk3ZFBKcTNTQ0pqclZIak41SHJYZng3RGk5Q1RkaUZKZmpWK1l5MmVYQUYzNnJUclZ6LzJ1enEvbHltVnhISlBtSFpSOVJrdm1EMWRCREl4VWY3cWpadG0rWHhwaEExQ3A5Q1d0SVpjVkZuQXkwT1JNaVZKV1dTL3I5Z3lDYmxiNEdRNkMyVU5vbmxqdzBRcnB2OTBBc2xWV1NUUmFuMEhlaDZGTnJZWS9rNUo4NDJyc1ZveTl1WHhSeUZ6bEhHTHREQ21TdG5yWmk1VDJHSFo1NVdZN2FNKzNFVURrV3g1RTZ1ako2Zlp1UUN6Y0pKN0xwNjh0RXBkNlhpaTNoQi9wbXppdTErajNzWkN1eGoxWjZLWG4yTnAzVm00aTZwbytCRFFEOHhkSzhreDZ4SXFJZTYxUy9LTG5rdTJDQzZ4Y0RRQkVobCtpaFhGQ3RHc1Z0cDBCVmxlcXh5THpiSC9EMWQ3UkFKbjVYWDQ3MXJKcFZ2UkQ2RnJocFd4Ti9uUFRmNjlZcS9HZFZmem5YTE1LM1l5SEJPa3JUYlVUcHYydGZMaFRPQmp5ekRoS0ozY3g3d3JNajFrVWlhQjVQeHNZZmxmbDlza2VFMVJaVFBqenltV2xEakR4Qy9USlhKaFkyMHl1SnBaSThwVkhVVEpkWW1rL1pqMU0vbzdKRlUwVWF2N0E5cjJpQ2g5QURqV2hWT0o4U1pWSFJSYnZoV0xmQ0NSbzdhZlBSbEpJWmFJRnk2VFpYMkNSQ0VmYWlYUEI0YUhRdytWVGpKbHZxZlVtWC9YNkgrZkhaYlMwaVdSdlVhdHdpZzJqK3BrWGlJWElmUW1mano4QlFpSmcyTDI3ZnY5eEFuV0VrTndNaVg2Um95a1B0UWJkODduaDhzNGZ3c1FYWVNnRUYwRWFmT0hwZ3VtdThLUzNTVlFDUEhUVUlqYzZQZTVPVjg0YUt3cVBiQmhXRTZjNlRaRjBXLzR0aDhma2hvTWZzUzJ5UHRRa2w2UTB0eitkYXpuVzFRcVdoanM4cTRqbVBRMW9JYjdMb2ZvYjdYbW5XR1Z4RDRtQ0N4czdKRFpEZHhHd3ExOG1zT1ZhOE9EeFErZU9Mc293eVZHaUZEWUk3S0ZiL1BwNHpKcWw3UjE2TExtN294VTI4N1VBeTNZMCtsMkZ3TDRNcVEwZlR3dTA2WERGNGE2SzZpbVNPRk0xRFB2SUdjRllESUptcC95OHRuUzZaNjNkeUJwNmVYcm1aWUEzNU5ZSUJFVk00Um5mamJaT1ZrL21jajkwc3FlZzVyV1A2R21GK3FZZUI3THY4OGt3a1o2UDc5NTh5WEUrSWY2Vkh6aTJKK1pJV2xqSExZQnZ5SmRyVHA3UmgxT25WaFNuNW5MQTA5ellFb1RpNzdwMkMrRFBnRlJkdlJuZEtYWmJ1MFRCaXdpSWZLd2krbUQ3anFKclBXQkNodEN6Y3gwMElud3pLWG9xWXpBTFB5S0g5ZFBjRmN4dHZhU3pMdDExMWdOclBKNGJ1Z1NGbzd2clpTSjR6Q3dDSDFud2RMNVpGWFZQcDliUXhwcGlpNE9Rc2M5dnFnRG5UeEQ2dVQ4NkJaOGMwL0gzMUFwLzVvRGFNNU9MMHM4dXR5MUhxVHA5T2QxN0ZOelZka2xTbWFRMTR4elpxcE95M0JwYnJNTmZxWEpBUmNURUlnM3NYUG4vSWlLRTBRa1V1Vm1LTHR5OTdOUVdXMHBLUi95Sm5BUFI0ZFFlQURReXpDRGxiWUp0K2dSQy9rVkVQTklscVM5TnJBR0FOL0YzbUdhUVUrN2kzcmxzT1lxSS9rcTJUZnlBMkxJR28relFWVVAybFVSNWV6WGwwdElOMm0wSE9ZTHovOXkxZ2JyWlFkcU5XODhNOTVscVFvYXd3aEZhRm8rU1g0dWxmdzBRcFVacytRUDhCeGw1R1FqU3RQYnFyMm1NclI1cW9LNnpzOUFsSXJYbzZ1L1laS2x2bFdnUWJEVVk5V0QxSzJ5ZGdsRFE1cXlCdFVFUEhpSTJBcENKRXVqTmIwc3hia3FBUW1LdEJvNHczL3VjUkM5R2xRdGlocCtsMlhNOUFqSTk4aUJYckI4RkhIUkd2d3FZeTBoTWNzcnZ6MU13UHp3Rk9tVmVhbWpNTVNqRVgxRjlOcEJNRlpzRTZYUGNLbW9vU3BkSXh2TTJnNVJUam9lZ3hRbXFyYXFMdXU3ZUhPVk12aThjRUcrNjZlTVhQTTF6VXdDaTVvVGI1ZlBEOFBuZ3didmVJMVIzbUFvNUl4NzhxUHZ6Y3MzUUwyYjZyOXFRaDFuMnFwZGZLUk5TNkVlb1BJbkpBNXgwb3BONXVWWmpXdU52VVB3VkhkTWFwVUwvTUhhQU4xa3hhWXdiMnlLYWhRcDg0bHhGVVloeVFrSGhGVVBqOTVQOURDcUQyWDFLd011RW1EallLeldtenpNcXloYjBaWUlzaFZaTmlFYTdoRUNIUmpBV3I1a3VXa2VVYlVjcXlERmpTNWwyVFdtNWE0elpwY3FpcXBlN1JGMjBjMlUxVGF2OUorZ1RrUzJSdDFPalRaMG1NY1JOUXd4dlozaXFhb3BsdE1vbmhkZXlWWnZPQnlVdEx6SWVkRUJNbkZlaVBGc1g1SFJKWnpsdkxvVVhvZHQzWW5mZGczWDRVb1dCNGVodDQ0dGhQQlZ5OWZlVUlrTXltWkpYdkNhWFB4MUgzb0svVVl6KzJ2ZUpXLzl2UmZIbTZabGgwOS9WNWZ0UzZrMFRjUnhGRzlxcG9yQ01HNnBnenlQT1FESy9KaThaWHd0dG0yQXV4cEYwc1d6TmFkYzB0UGNvMG9tTjU3NzNFUjQxSkllRjJiWFJSaU9nK0diSmZ3MTdWb2ZRTU5OaEpmbVlqR1ZLbGs5RVdKYlNydU5KVWRzdGpFNGplRzdCNk9zd3VqYzlzSjNUaGhzWFhtZU5iWlFqYjQva3VhR2l2WENjamZBZUQwNVZwbTdXbWd4ZUFoU1dNdkc1SjhqdWFZWEFsUmtxbFk3U0F1SDd6bVZZbmhBYW5SUmExYnF1ZU5FVmsrTXM0MnJreWhtUjlkcVZCOGdZbnBCTHo5dHE3eXJoSlFGbFlnM3dqaURmcFJ2TEsvUGtBVUtiUnB0SS9uZ3RLdERKcTlwSm5KVnpMeFhyMUFxMk1UWEJSYmtQN1pXK0UreGxTTURnM2MvWUlldFdGeDJ4R2tLbHVzWXcwckdSYXloaFNsejNjYTFCSHV1QStmYVFNSWxCYnlmUDI2bmpFM3N5RVU2bEVuT1c0Y2RlT1UvdmdQV3dLNEx0SDJjdlo3UTB1ck1qMTdnbHAyUzU5TWt2aVU5MUFQZWRZWlF1Q0REZy8wa1lHWFFhK05sS2ZnbFd0anA1dThmTWF6YlVKUXJiMjZLRCtSRTMyMllmb2Q4OFFxR3k3T2FvSm0yV0dic0s2MVZQQ05icURSNndJU2V2U0dvdnNqWHRnMXp0MW1aVTA3Mmc4dXU1SXRRaktzQTY3MThMWGVEWmZLUGNhbnNEM1ZwbmpWTTN1RmdYMzJZU1ljTWdoZTlPQW9VZEtXV2ZCYUI2THRuak5peUdaL09XVzhHdFhKMHlYeURYUVllSThEQkpjU1k2bDkyRFR3d3R2dk9BZUR1NmRVbGkyaFVZNWxXNktucmY4THR5dzhhNXFoZWp0OGg5eWFCVExvSUpPeS80TUEwUUxZU2N1eG5XS2hNaWx6QlRuL1NxVVh4SFZ2OFFzdjJra2Q4Mk05TkJ3ZlljbllScmhrWkFnQzUzZmxsVG9sVVZhRmxxYWtEVHpKOFFibmZlcmtDNnkzdDlQWkNLekllNWVvMk9sN21yY1lVbGw1enJrZ1JSYkcxNml2WjY2OGkvRkR5SXhhem9IZHBwWXR4K0JDK0d6cmpRMHFLeWpjRVdETUNSb1RicWEwamw0WVFkVndwTjRVSXpNRHJhazE2NmpzSWxXYkRISnRuVUdPTXdnTnJoS0k3clZTb2xkV0tEakcyWTNJbnByS3BBeHpFbE5jd1liOG9IMC92TkRSN1Focnc3OGNIdGpBaXNXRG5BYlB0SWR6aUpTaWVLS0VXMURjR21kOENnVFdPSUdTdjVkZUc2TTQzWjl2Uk1rU0d1OUIzL0NYQTlNaUNRWnJ5b1cyY2hnZEJvcGVvd05mQVhwV1A4YTh4TXR0MTdIdG9GbWlhSm56K2tpeENJcWhYWlZpMG0wVmpzdjlMQ3lneGNZZEhvWE9vRnhpRU9ocXB5THlERmlkcFpGSVVDeGRwS0hYKytSNVpPbmJTQy83TE14YlRSd3JsMmdnWGxGMWlLbzZ3aSs3MFhLNmV6LzVxck5pVWlTcVFBQy9sd1IvcE1KMlJYSGtBSFJkbVE0TytVR1RESndjUDRLTEZvQ0RPVTFOdDlSTk9mbnVERWdkVVk2SVlkMjltV2ZScFVpNFZITGloK3k1K1FPSmRzMC81NVY1dXNYNmdLMHJ0VVhac25YTkNheGFpMU54Q1JNL0pxUmZxNmoyTDQrRVdEeWx1RDJkdTBpc2dFU0lDQXBGVEJCaHN0aTk3S2hJeERGVk9sait1b0dJbmJyUGJhR3F4MmNMRDZBQ092TTVNVjlmK2NIejRFazRiTXZ0TkFRK0hEK2o2SUZsUWtFZlk3QWNPS0x3aU51SmJwYkRETHlxMjBnSHgrb0xvOVVGRk5oYXpsM0NKUXdYVTRmTnNkY2pvc3AvYk54UWEwNEo3Z0pzVDBZaXJGb2Y3OWZXTXplRmRJTGl2NDJyTDBFMzVYcEdBSTExSTlBZGtIY2ZSRXVzalZQQUZTMVhhOVU4LzFuWU9GdGFhd09NbGVmUlZxWDh3OWkwQy9rS0V2V2MzZW11SUQwV0V3eFR6R1RtaHhKVmhXVW9GVGlqaG1RM2pZWHlHK0RNTjNCU2MwZGdabWZFbmRpNGpPUDNTSW43OWVDUnI1YTljclRFODk4OFRzelkvYzhzZVp3NGVOY3RsT0U0KzBFdUM1eEhaUDZDc0FIdkZRZ0FQc3c3T0ZUUTRjQ2h6U0hKdkMwUEhGWHh3aDFCRWNXeTZmQjQ3NytBVldwT3NTN0VsZ1MvVEtseFBjVmVmOWJEd3F6MjQvMHZGQzUxY1RwTmtiTWUyd291bVBjOUNnQzRpV2NmbjlINUFUcnVmb2ZFWis4V1BMN0FGM0lvMUd6b0U9",
    username : "public"
  });
};

OPrime.guessCorpusUrlBasedOnWindowOrigin = function(dbname) {
  var optionalCouchAppPath = "";
  if(OPrime.isCouchApp()){
    var corpusURL = window.location.origin;
    if (corpusURL.indexOf("corpusdev.lingsync.org") >= 0) {
      corpusURL = "https://corpusdev.lingsync.org";
    } else if (corpusURL.indexOf("lingsync.org") >= 0) {
      corpusURL = "https://corpus.lingsync.org";
    } else if (corpusURL.indexOf("prosody.linguistics.mcgill") >= 0) {
      corpusURL = "https://prosody.linguistics.mcgill.ca/corpus";
    } else if (corpusURL.indexOf("localhost") >= 0) {
      // use the window origin
    }
    optionalCouchAppPath = corpusURL+"/"+dbname+"/_design/pages/";
  }
  return optionalCouchAppPath;
};
