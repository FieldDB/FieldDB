console.log("Loading Webservices info");
/* Extends the OPrime class */
var OPrime = OPrime || {};


OPrime.websiteUrl = "https://wwwdev.lingsync.org";
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
    pouchname : "default",
    path : "",
    authUrl : "https://localhost:3183",
    userFriendlyServerName : "Localhost"
  };
  var testing = {
    protocol : "https://",
    domain : "corpusdev.lingsync.org",
    port : "443",
    pouchname : "default",
    path : "",
    authUrl : "https://authdev.lingsync.org",
    userFriendlyServerName : "LingSync Testing"
  };
  var production = {
    protocol : "https://",
    domain : "corpus.lingsync.org",
    port : "443",
    pouchname : "default",
    path : "",
    authUrl : "https://auth.lingsync.org",
    userFriendlyServerName : "LingSync.org"
  };
  var mcgill = {
    protocol : "https://",
    domain : "prosody.linguistics.mcgill.ca",
    port : "443",
    pouchname : "default",
    path : "/corpus",
    authUrl : "https://prosody.linguistics.mcgill.ca/auth",
    userFriendlyServerName : "McGill ProsodyLab"
  };
  OPrime.servers = [ localhost, testing, production, mcgill ];
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
  } else if (authUrl.indexOf("LingSync Testing") >= 0) {
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
            + "/public-firstcorpus/_design/pages/index.html");
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
    mostLikelyAuthUrl = "LingSync Testing";
  } else if (window.location.origin.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
    mostLikelyAuthUrl = "LingSync Testing";
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

OPrime.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";

OPrime.publicUserStaleDetails = function() {
  return JSON.stringify({
    token : "$2a$10$TpNxdbXtDQuFGBYW5BfnA.F7D0PUftrH1W9ERS7IdxkDdM.k7A5oy",
    encryptedUser : "confidential:VTJGc2RHVmtYMTkvZ0dHaTd6ZWVKQ1dvcDNuWWUrQXR6YUN1WFM0NThzVkRwWUdqZ2tpL3hUQXJaR3l0c0lKL3RUR2pjYmhFdmtYVzhxcDJna1cvTGZPTTR4OUVXQ2x5eDdWTHpEd2pMRUMwVXNJNmtSTWtkOGMwYStMWGNGdCtTMXRpaTY1NUNiR2FZbXVJTm1SRis2SU1iQjEzR3M0dTNxNkFVRU9sdHE2M2VhVWc5SkRKYW0xbThkVXN4TXBLOEdRSC91SFpVOU5NM1NHMS84dnZVd1h0UTVuYVYwM3RlU1h5TEVWL2JzbWhqcEw3UUNpWVp2MnVkRVZuMklFb05ncWg4ajJkT2xNMHoyM01adVh3ZU9JcGhhMkZRcXpIRkk3K3MvaXVpWnEyUXNHeDFFMlA4NlBqQUFIM2F2bC91T0pGL1lOQ1hwNG5uTmZ6a00yL1Vxem5MNHB1V0ZxVzVCanFmMFBwN2NuRUovaVpVeGJ3aEZvcmF4NTNMaEdocDhrMnhtUXRtME1kb1hrUDdHOThrQ0RwODZFQis5NVU1b05YME4wK3A4bWFYUm45YkhXV3R5ZDlidnNRbVA4b1phVGZFUkVnL3NLa3ZuendIRXRod2htY3JuOFhlVXh6VGY0UmNGWDduQktKWXpXNHY0d21KY1p0OW9TQk12T1cyTS9KSHFka3VhWlNGY0U5Q29MK2tkTmNleVF1dWt2NC9FaG51eHBNeEpJRXBob2ZKWG1zWlBPb0JTUERYdExlYjBFL3lSd1ovSCtSZFE5SGd4ZUY0VnhTS3BxU2xBbXd5ZTVYY0w3ZkIxK29ybStISTFCMUN2WW4rdHUxSmt1M1ZkVVFVb0RDSTJqUWowSG5uYVd3NFdRb3o1VzRsanNkNzQxSlBIcU4vQm4rUWpMZlQ0aXEvRTZrYWhMNTRDRFpLWVJiYzFkZzd2aDlRbW9PUGNGSHJ4bWF5Mm05TnhPQ011aStIeDF6NHFybVRoVjcyK0FDVE5QckhlUjVPSzYzSmZmeWx0NVNqSHhqNk9uSlkyUVI2YVpEcHFzTHE4dWVMZXp3Nm5ZM3FxR3BqREV3KzE5ZEVpSUQ4a1RDY2lJS21KS2N4ZDFhZWhZRG05SnhReHVvNHVqNlM4NjdqYSswOTN4cEZFOS9udVUwL2xQYU1kbFdTYmRmamNRY2lhQWNNZXYyYkJyS0pGRmc3REdZTUY5MHhFMzQxMWs0ZE9ZOWtMWVlHTWNYRGprU25pVTJDRGxQR3VRM1VrZW5ET3RCY243TnVocVJnd2V6cDdSUXQyK1hhZFhNa1VlbXM4SEFJRm9XNkYySjlJMU9YSGlJTkJ1WTJEQXVDZjFOb3FWby9xQUp4VU5nOStLRXNMcnAwdUF4ZS9UOExDRXlGTGxnZjhjKzA5NmNjSHBwakpoNG9DckJuSkZIanNXWHRvbDd0ZnhXWU1Ra1kxSVp6Q3gyYnNEcElsR0cveWhDU2ZIU3VzcU9nLzBlR2NXNWg2SURXSm9VaDJhb0ZOd0JSbWRTMWhDcXd3TVBnYXFmWDhuT280N21ZRWdlNXBBWjBHNXorSmo4ZWRwYlU0SU4zaE5BTTlDcmc3VkdNZlZCUDIvbnBPY0FBL3NuVm11ZE1NZGJZbTcvMjRwWVU2aXJmT2k5STh0UzhYaEF3aHRBZ0hscVpaU1lYZzltT0FrcjBVSTcwUEJ2TGMzd2IvZ3Zmc1A0QTFRb1pQNUVVSk92b2dxa09qd2dMc0g1bkFkWDVBZDF0K1I3WmVhdDhYVm9CbTM3ZStUQnVsNTZuVWhHM0hOcG5RcTZBY0dtYlQ0VTZJd1JnaDBkdXdWRzQraHN6MUgzUTVwaTVXaW5UcXVMQVlDT3IzcFQxNFdpZFprWjB2TzE0bnM2aGdSRU1mVy9CNUwreXozK05uTHNuT2pCNmhhVEt6bVZHdlAvWWdvNmJoVUVZRXdyc1VFYzRseEVjeEovNW1nazh2dVo5SlUxNmZBQVdSVUNNU1VjMHBNOU9JUnphOG1RMnl0bitQTDVaZVo2aDMyaW1GM3phYW95S0RTVXV4OVgrVTZ1SDhXei9LcUZyVlQxS1B4bnQvTGVLZmNHVTViN2o4VFlaR255RmJYdzhxOXFIOUd0dVoxRVhNZHNhMUp2VkJFbGdkZlYyREZSYnB6ZzZ0NFRZbUNXRHd4NmhGWUQ4eHk4SXljWDFQMExWc0xmV0I4WWcvVTJCekhpVXd4T251Zit2SnAwN1RGMUJyODl1NGdseW9jMXZLZ0xJckp5bjB6Y1BjVmxuQmhwYUlFYkVWblIvMVltRzIxdytHUHhUOXlxYStrQldIR1ZLNTFmb20zWGp5bytuYTd2dFkzSHdIbUJHSHdoV093TGIrZEtpSkFKL012VnZTd1RxR3BiNmhpb3N3cUFJNHpobTRDUThHaDhSeXg5UjJpT2FWaUhTaGluZ3hJSERPT3ZsbjdBRkFoWnhZY2xVc3dYRGFyaWpIM2tneFJwVys2blhNWVZQY1VqZnM1Tk9WOXYwbUVIRGtNd0FtTmZuSWQyV283SC9mWTh3cmVEVEtwZDVMQUhqOWxyYTVvTFdBeTVCS1NWZkV4Ky9HbkhDNnBiRm41ZDVrNGN3THlqa0MxQlh1YkVRYUJSNXkxZmNkNmNmcXNTODlIbGFsbEdScDlGZlhOVmRMSkFKdzNRU3ZxU0lWN0tLTnByVmVhWDNtYU9XL1RJc0VhaFBQMDBtNHV5eVkvNmR0NlBmdXRsalhuTVp1NklRckJkWE56REdyNGJkRU5xVDd6T2hnMDFhK0xzd3gwMGoxV3lkSXZwTUVwVGViUk5HSFFtbUZkUElLK1pJWTJiZmwzLy83UGluVVQzNDhRcUV0bDVzWVdDUlFuODZGU2RCakVaUEF0ZE8vVmNZT2N2VCtVU0lwamp4dTEzdFMyd0Vra3ZUV2l5d0ZKd29pWGhBVmlRSXhzNm01MVRKaUVDdzdhMjdpdzllMWcwU3F4b0lZTXB2ZDdZR2Y1enBjbXgvZmNqbGh2cDhxdlg3Q2czcWkvR0NZdzVIeTVGaXBWNXJEQ0h4Ky94UFVEWlhFa2lsandDNnB1SDFxMExuS0E2bzV6RVIxdGxZMlZ6K1lOMjQ3QnJEMEZMNk84YUhVUWYrL3JOY291dlRJbXBlRXhVdnJ6ZjZqSExQcWtFQW4zdkRlWFlKRzNZdlh4eFhKa1B2aDVtZUE5S3VCSU5JT3NESHdQdEkzdDA0VGd1a2haaHhrZGQwdnlIcndBKzhsNm9yYWJyZE9Gd3p5RjgyeTFoeVgzU3R0MDBHS21aQXhnOUJUK3FjdVFQOTAxNzBjK3gxdkxBcmhQV0l3bXF0dHU5bTNXOStEZEZtYTEra0pvSGZsOEZudjlXcUpBTy9KNVczSGI2V3M1RDU4VzVNbVdpcGpsamdvSjh5Z2YydUhhMlFvSVN4S2FBQ3FMR29MSi9neml5Sy9JQ1o5bGpCVGZ2QnV3WDliYVVuRXRpZlArb3U0Y1RYdVd5TGFEb3FudFYxeFNLUjhaa0RjelpKcnNLNzRTa01tY0JRZEFpYThNRHFBRTFWWXNXUStEcGp0K1lwekhrYkJTcytNVzV6WVd6QUJqTldLRnJtVTBYeC9wSkV5dkNrenBmNC9sOHpLb1MwOEtIVSt2RnhwbkVTMjFCQmVJZmJ1VXJjSXlnVTNlWVhmaXoyZElqVk9NNGxaQU1xSzdsRTg1TTJRdnI2WEc5RnRoVUVOOE5CRStKRUw3T0dpN1dOejBmbjZnUERMcEVNZzFwRUEyanQ2eUkyT2hYdytKV2thTG1IdmRxNkFtaXp3dUp3bEZDSG5pRjJqTkhQZFRJcW00eW9NVmJkREdSa0ZwZmR6S2F0Y0pyU3p1SkRDRVkzMUp1SHJnT2hyQ3NZTTY4Z2I5ZUgxcG10cTFGUWtMRk5saGpuV3Zad1FpZEkxMHg2U1g0b0ZodDV1WEhtY1BhcHRxSEQwSVFKdGNwbS85R211aWRjcnl1eXR2dklVdDNybTVtQTZNR3dxUXM4eENiL09DV1k0eGE2SENINXpiVndTNnA4cnNURmVMRjB6dHZYeFh6OGphQzFjL0dmYU00cVd0blFjV0NyY0V0aEFzeC9nbTQ4S1p0c1dDTkJJdEZ3N2U5c1UwbEhXQkttb25qODNpVFZQOEx4TjFKKzN1bFZnbU4xaVVaaU1sdHRtN0t1b0pFQUVZUFZrRExlUnJTdmpIQXFYdkdBbi9ZMEpTbkw4K2FvYi9PbDdEVkJ4MVh3VmFSOFd4Sk1oN0R2ZEVEVWY3dGJXNEFtZDlBUmREZ0dObno3QjgzRmhxRTVPOW5STFZLWlF0ajZpTEx1VzU1RmFUNHk0UzVCWi90YWZtVTBUd0swSE5PNUdEUFhMQTJRZXBSUVpCLys3MzgyUFQrYVhyZURLWkxOUitzMU9WaXNaMk4wM2lSRDFXMTdrOXVDeHhOYURqVkFiNWFoazZrYlJOeDJ2OXdqbm1PZStKdzg5RHFXQTdFM0VsK1BZSzZFdWVwRFR5bnZCY2tSK1lTSlY3eWtTbTVRVjVjS3Q1U210YjYwV1BMOEtjMmFxcnl2N2NVWWZpK2ZOdm5EZzFkK3JudFF6Wi9tcm9ER2pEeVg3UmoxN0Q4U0dvNm82Z0p6eXVOUW4wbzg3bE1rcmFFVW1VNlFsT3NVK3gwcXUrOWJKc2hmUk9GMjRzbmdIUmxSN3AycUMwUnN4bWVrRUtqWW9RRVZibm5PRGxxc3V6d3RlMlRBUnloWk9SZmlnR2NHRHBIQlRCZ3AxNW5RVW1iWnMwPQ==",
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