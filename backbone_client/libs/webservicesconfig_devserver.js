console.log("Loading Webservices info");
/* Extends the OPrime class */
var OPrime = OPrime || {};

OPrime.apptype = "production";

OPrime.websiteUrl = "https://wwwdev.lingsync.org";
OPrime.authUrl = "https://authdev.lingsync.org";
OPrime.audioUrl = "https://speechdev.lingsync.org";
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
OPrime.chromeClientUrl = function() {
  if (window.location.origin != "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa") {
    return window.location.origin;
  } else {
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
  // var testing = {
  //   protocol : "https://",
  //   domain : "corpusdev.lingsync.org",
  //   port : "443",
  //   pouchname : "default",
  //   path : "",
  //   authUrl : "https://authdev.lingsync.org",
  //   userFriendlyServerName : "LingSync Beta"
  // };
  var production = {
    protocol : "https://",
    domain : "corpus.lingsync.org",
    port : "443",
    pouchname : "default",
    path : "",
    authUrl : "https://auth.lingsync.org",
    userFriendlyServerName : "LingSync.org"
  };
  //v1.90 all users are on production
  testing = production;

  var mcgill = {
    protocol : "https://",
    domain : "corpus.lingsync.org",
    port : "443",
    pouchname : "default",
    path : "",
    authUrl : "https://auth.lingsync.org",
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
      OPrime.authUrl = "https://auth.lingsync.org";
    } else if (window.location.origin.indexOf("lingsync.org") >= 0) {
      connection = production;
      OPrime.authUrl = "https://auth.lingsync.org";
    } else if (window.location.origin.indexOf("prosody.linguistics.mcgill") >= 0) {
      connection = mcgill;
      OPrime.authUrl = "https://auth.lingsync.org";
    } else if (window.location.origin.indexOf("localhost") >= 0) {
      connection = localhost;
      OPrime.authUrl = "https://localhost:3183";
    }
  } else if (OPrime.isChromeApp()) {
    if (window.location.origin.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
      connection = mcgill;
      OPrime.authUrl = "https://auth.lingsync.org";
    } else if (window.location.origin
        .indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
      connection = testing;
      OPrime.authUrl = "https://auth.lingsync.org";
    } else if (window.location.origin
        .indexOf("ocmdknddgpmjngkhcbcofoogkommjfoj") >= 0) {
      connection = production;
      OPrime.authUrl = "https://auth.lingsync.org";
    } else {
      /*
       * now using the stable as the default
       */
      connection = production;
      OPrime.authUrl = "https://auth.lingsync.org";
    }
  }
  return connection;
};
OPrime.getAuthUrl = function(userFriendlyServerName) {
  return "https://auth.lingsync.org";
  var makingSureDefaultAuthIsSet = OPrime.defaultCouchConnection();
  var authUrl = userFriendlyServerName;
  if (authUrl.indexOf("LingSync.org") >= 0) {
    authUrl = "https://auth.lingsync.org";
  } else if (authUrl.indexOf("LingSync Beta") >= 0) {
    authUrl = "https://auth.lingsync.org";
  } else if (authUrl.indexOf("McGill ProsodyLab") >= 0) {
    authUrl = "https://auth.lingsync.org";
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
        authUrl = "https://auth.lingsync.org";
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
  }  else if (window.location.origin.indexOf("corpus.lingsync.org") >= 0) {
    mostLikelyAuthUrl = "LingSync.org";
  } else if (window.location.origin.indexOf("corpusdev.lingsync.org") >= 0) {
    mostLikelyAuthUrl = "LingSync.org";//"LingSync Beta";
  } else if (window.location.origin.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
    mostLikelyAuthUrl = "LingSync.org";//"LingSync Beta";
  } else if (window.location.origin.indexOf("ocmdknddgpmjngkhcbcofoogkommjfoj") >= 0) {
    mostLikelyAuthUrl = "LingSync.org";//"LingSync Beta";
  } else if (window.location.origin.indexOf("localhost:8128") >= 0) {
    OPrime.debug("The user is in a touchdb app, not trying to reccomend their choice for an authserver");
  } else if (window.location.origin.indexOf("localhost") >= 0) {
    mostLikelyAuthUrl = "Localhost";
  } else if (OPrime.isChromeApp()) {
    if (OPrime.debugMode)
      OPrime
          .debug("The user is using an unknown chromeApp, most likley a developer but it could be an unknown chrome app from a ling department");
    var appropriateserver = _.pluck(OPrime.servers, "authUrl").indexOf(authUrl);
    if (appropriateserver == -1) {
      OPrime.bug("This shouldn't happen. Please report this bug.");
    } else {
      mostLikelyAuthUrl = OPrime.servers[appropriateserver].userFriendlyServerName;
    }
  }
  // TODO add Production when it can support 1.38+
  // ocmdknddgpmjngkhcbcofoogkommjfoj

  return mostLikelyAuthUrl;
};

OPrime.getMostLikelyPrototypeVersionFromUrl = function(versionCode) {
  if (window.location.origin.indexOf("prosody.linguistics.mcgill") >= 0) {
    versionCode = versionCode + "pmo";
  } else if (window.location.origin.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
    versionCode = versionCode + "pmc";
  }  else if (window.location.origin.indexOf("corpus.lingsync.org") >= 0) {
    versionCode = versionCode + "pso";
  } else if (window.location.origin.indexOf("corpusdev.lingsync.org") >= 0) {
    versionCode = versionCode + "pbo";
  } else if (window.location.origin.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
    versionCode = versionCode + "pbc";
  } else if (window.location.origin.indexOf("ocmdknddgpmjngkhcbcofoogkommjfoj") >= 0) {
    versionCode = versionCode + "psc";
  } else if (window.location.origin.indexOf("localhost:8128") >= 0) {
    versionCode = versionCode + "pba";
  } else if (window.location.origin.indexOf("localhost") >= 0) {
    versionCode = versionCode + "plo";
  } else if (OPrime.isChromeApp()) {
    versionCode = versionCode + "pdc";
  }

  return versionCode;
};

OPrime.contactUs = "<a href='https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform' target='_blank'>Contact Us</a>";

OPrime.publicUserStaleDetails = function() {
  return JSON
      .stringify({
        token : "$2a$10$TpNxdbXtDQuFGBYW5BfnA.F7D0PUftrH1W9ERS7IdxkDdM.k7A5oy",
        encryptedUser : "confidential:VTJGc2RHVmtYMTlzZnd1TWZmMzlBcnY3bHJWd3JYOEZhOG1OeEo1eTZXYmpSRkV1TWh0ZEdYdTN6emtoUHhBYmg4OHpoZFVMYjFzMFpTU1paQU12U1ZJTjdoNU5oNzZVeElXNjh3TXZoYTJaanQ4eXBEUVNvSEFvc1c0ekhObmh2Qmw4ZlVsZnRzbnlDK0FJMGJ0VVVXOUhURUMraG5sSGlQQ29wYU0yVHlBUXZ1MncwSFl2emovbXB5L1hHbEFFQXJhU0l0VW9BRTg4RFhkeGNGZFd6YVlham9tMW5LbWZrb1dWaVNDZTZSS1h1R2xwU2xtRk5NbFU0U2ZwVklJNXNOaU90SVJoeG96aFkydHJZUUpreHBiU1RsQnJiMS9oYzh3QU0rNWRaT2Qyc0RPalV1bUM0QUhMMkZZK0d4QWV5c0d5Wno5bC9FUElzaGhWSG8vOEtHbEtFYjM3VU9JSTV0ZTZWVHA0K2s1ZVJyOEhsRGc5VDdrR1BPaUJQYmJIdmFkQmxhOEdtZXhlcE5aQkJyYnBhNjBiQm1yOUI3K2RTYUc3b3drZG5wTjBSKzkwbmwxamQrVE9MbERTNXRwdWR4MXpQZ2pxU3l6cmdqV3UzVXc0MFVyemp1dG5jeE1PZVE4L0FmYXc4TWl3ZExjakhiRkpKbVVWaUY0bklEYmtZRnZTOWtLeDFuSlN2YTg5VjlNTkFlKzJBcTNtOWJ4akI1RUZVS0g5a05mTWxkQUtNUTJpQ2ZGS3ZwWnY4aGlZcWg1OVo1dmtpMDYvOFhhbXE3RWtCcWhka3lFMmhubDBoZHZnK3hRYWcvMkQ0VEZEWTA3ZUhCQ3FrTDNnTWRlWGpXaEFUclgxWHJqbkxKYi81S0FzVzBWay9HSk5lMy96dEJNaXZWRWlPRFk4Y2hPc3FsbFdjTUw3ME12eitTTUQwbjFKWkZmZ1VWd29OSmVTNGo1ZkdRT2RxMVZFM0Y2Q1lzYnoyN3hhN3FMZDRNQUk0NmJqcFQ3RWNBZXppQlBPOWZWcFN4UUxnM29MOG9YYTdBVVRYY09mV3djenlyWUdUUGNjamlsVitxWU5Dc0I2anNTNklFRms1OWtBTmQ3OXBtakI4b0txeFNhQ002eWp3Y0dyYzBFSUlPTThVbUNYb1dDQVY1OG4yWWZyc3Z1NmR4RXQ5c1FsNlFkNHViOHgxcE14TjdWNkRSaGswZ1lNODlYalVkVXRoc3NEK0thalB6d0trYkRYZTNRc2pHeXhiMU1wZzVTKzd6OUZCKzF2dGZRQ2JBSENIWm5JeXpDMStWaDlOZVZHd2dESjB0VlJseDBLZkNjRnZaMWIxM2pzMS9pSEs1M2RVOXV3OGRkZExJK0JLc1NmMGlMRlByYmpZVDZCSFg1SUp5dzZGeVB4N1FGZW1XOHN5cVh3VmlEVTJSNlFERXdmNEc4bDJ1L2RXQXdlekkxcHdCc1pwVGEvT3c0WEd1eVlZUHVwRFdCTlB6Q1BlL1lJNWwwUVFFZUhGcFRXQ0ROMktkbC9rVEc4ZTNHbEZRZGZuZk9oZ1BhZGZQSzY2eXlhWGNlQ2s2UEhSSzdUZTFYeDhTQmdYMS9TeG1vK2JsQ3lzcGxBeUVhVXBuQ0ZmUzZyUitXb3Z3TUxWSTFFWit5TStpK2NsUjEvbi9UdWxlejR5QTI5cjNwbGFDT3gzWXhVSTZNMzkwTWRtTzFneTlnVVpCVXJ3WEhWK1F0aHVRRDlGVDJpVjh6b0dpNXFGWVk0cFF6UHZKbjgvMFYyYmJhRmNBWDB5UFIvUU9iK1JHZFd2S0dITllrN01leFZZekI3UXR1TWU2NG83S0NDYlBWeUJuTlJ6SWtGM3U1eEtmTDBIMFVpaXJjcUpLdU5YNkR6RDIyNzFBck1kdkRzNzFSNWZDZUpCWm5KNTVHcVNiSEl1S0hQRG9Ld01mbHFadUZMNFpKTWp4d1dsSExVRkdiOFNKU3NYWDdoYW5xei9KTDl3dmt1RXJrMHVRSHJvbGx0ZGhiNmVPRHcxUmY2VTY2RDBpTVJMenljN0dhVnZuT3RpcEgvVGlLa1VQc2dwa05yRjlFZjAxSnlHTFBuTjc0blNMRC9VOUphSDVPVGhydkRrNEZmU082Y29IWVlmTG51Q0svL1BCNUFaYTZPb1BEbXNUVFZCMDRkY0VtMk5OYnJCL3htZXZtME9lUXhZQWlFNFVHcGhTYW1CeEUyNVBtVFlpL2grbE9pb2JTaDBVMVhNalQvN3R4UVVWL2JpMVBGejVKcjA5SmxaTnFtV1E3QmJTMk55cTNHd3ZxR0NGaTNFWWtyNHZrQzdhMklpUHVYVStvbWdzVkFyWklVT21JZFJOVGpUcVNyS2kzK1M3bEdVeDhYSDZTRFBMRFoxTU9pOWh6VGtqQ3ZRRDJIZTNiakF4YndXeFFTRWhpa0s2MUExdmIwRGJTdWwyK3dvS3VxeWZlR00vQ01aOFZiU0htRU02Qks5emtoYWdJVjlHVXRSVXNnTlVwK29RZ2l2Wko4ZFFOb2o4anRIdHI0R2ZyQnVOOEtUQXQwN2VJTjVGamUvOGl6cXhSWDNtcDd3UWpjQk9XTUowZUN1VnBxdDRDWklLVnlSQkdXZm9wWEhZOWJWSWxWaG8vVnlvY0E1NVdiTlU1eGZ2TDZuNFdBWmFhR1ZxUTlsdHUxNEdoaVZSSkVDd3p0cHhkTE0yVklkeHJURmRyS2g3b1ptNDNYblBKeURFMUxZVmN5SnRVY21rQnAyaE4vUVFCYmVNdkl1eTNiZ1ZjaUZUWjlFZTdRdXNQcUVrWWIyRUZmakVoV0ZaSjFLMGpxMUx1TCt6R3loWk5FS3EwajJzSGpjQW9UZUVEU3hTV3BOSHRIWG9RdWVLTytFMFNVOGRpSW9HRnovaCs1bzRWMnE4eUlmVkFMV3hlc1lMU0lFUFN6UEZicUNUOFFXN3JILzIrc1hsaEJRTFUyMEc3R3BoalUvbUlUcDJSM01DdHhoTkFZZmpLYzc3TFY3azZuL1l1YVFWNzI3U3hQQnR3cTArZDRhQklWdm02VGk4YUc3a0lBTjJpNVUrQzliK0tDQTErMC9TOVZQblBCQmdKQXBrVC9ZbzFFTlZSU1hQUXhxanZBWFNSNGJLeXBvZlZkaUkwS3NEWnhNbjNLNVpXRU9ycC9VOVhhSXhIQ2M0dkdYUm90bThWejZQbEZPbG5NRmZ2VEFsdkJMRlR4VUY4ZVFqeXFRWmxWSUtRSTNzV3hzSUJYYmVoNjkyNVFmRE5hbFBUaEtmVUFnV2pUNGc4cmNja04rYUxEcDdON1c4VW9JSTRGZGkxZ0M2ekFrVE5sdnlmK2JUVlRHUmF0ekh4NGgreFdaVVU1NW1MenFyTmx1MTlDMEtFSHZJNEhhK2ZSVXFxK1J0RWRZQ0w3QWx3VzJwOWFvTHJabytKcFJtM0FPUDJFNUxBRjltbVdoWE5jKzUwWUpRYmx4YVk5TmxuSVJLWmlzdFRrVzdCRnV0M1NCTk9kUjZjdEV1eTBzcTB4U1dIcWhJRG1qdXBwTUx0QzhOQitOM2o3TTVvc0lOWUlzbmR3RUZvN0ZsdzlXM3UydGVjNk82QmFBV0JDeC9ZRHFqSDNrTGtGQ2wyZnp0R3hWNGRlQ2NNMUhzWUFYbW9WTStlWmZJeWJmTUlHWjJPYXlKMG1NQWlncDgvT3ZwMGJXZitJejlPUW5DK1NGZ2NTWTdhcnVrZ2FaV3hTd0J2M1FkQWtrOG1laHFhS3BsWnd2dVRydHNjNEZzaXJaVGdnRmVDekFpbzk5a2lldGdqZldMTTk1TFRUbkZJMDE0dElxcEprUXltNHcyRGtuY1BjQTBqdnZJVlNFeFVTZFJ3cGMvUnoyc2g2Qjh4WElTVnpjNUY3SEhlUnRUSjJkRjVtNFkyNjl4RG1HTDlXdnA4OXNFWENaSXZDc3oyTldESWp0bHpEU3R5RmY3UDFIRlQ5N0lLL2pLYTBQRGlIVlV0eGtZbFhhMndOZm5ONnVCRUh2VlFKMHl3S0VqVjZRZ2JHeDhvS3FrREtxY243cG04dm83ZHE3MU5nK0tSOFRRQjdEaEoxRGVMWG15Q1lzRUlJTEdONzUvcXAzVCsvMVlhWWVSdGc2RlRyOXg5YURzcERyTStjV2tMMnpjNWl1M3c2dDFudjBmN0VWNXlWcWJ1MkRhd3F1RXN5YjVQaWxUQ1dCQ3JUcFd3MUZWM0ZNd2FCMGExUWJkSTlDV3d6RUplUXVjUU8wR1ltUXRZc1ZOWElOclhEYkV6VmhLV0ZHYWNIdS82RDhFcEUydFZaOVcrNWNvVGpYeGNUZUpNY1pxWDRMTC9od3VwelYrU0ZYL3pBZTZKaEhKVGxacytxaFN6V1ZxNjJGa2JXb04wWUgzRWJzbG5SeUhvcTBUU2ExN3pXMUZ2YzRuWmdyUS8ralN6YVVtd1Z1SkFmZjd1Y3E4NlJrdlhwdU1xZEkyQ2x3ajR5NUFWQWpVK0FRc1NXdzNkdStLWWwyN1VsWjNlZlpJL3dDSlozZnBUSDNuajNBdmZXRjdvd0pHN1lIcS9YYit5azd4MVJ0UHgreFRzZEJIV3RVOFoydjg5bzdMc1VXWDJxSDFEQTFrMitVL05sRk5JSkIxMSswM01NNXJPKy9EZHV2SHRmQjU3VlJFV2tzMTB5ZktSdzBMajk2bW9CMXA3QmlEdmJjVlVRU0FYd29aSUdjazNnd3B4SlJSZTN0NE5YUUk1UmNzaVRmdDlzY3plWndwcFRlTURSM00vU2Z4bm9zTktvRXRLTHF4UmIvK3pyazBZdlg5QitHYmhPVzAwWWpYM2hpWDN2TjVUb1lMWWFrT0JmWVZCWFEvQnNnYTR3VXBhNFNUL3JBYVJiM0ZNL1FHSSs3UXFtN1N0Z0YxQkhaeE43MW5aVWd5b3B3QVFsUjZ2bVQ5bTJJU0E4eTBtUnhvSW5ndVNMUFVjeThVTnl6ajg2RmpDdHlTQ0JXZCszZWJST2VKLzArRFd3QS9ZanU4T2JyN0F6amZMRVRCM1N1c29uY0QrUUM4QTdVL051TWJ5Ukg3dHltTnF2UkVPQ2xOcEQ0Ym4xNkdhbWE1UWVKY3MrOXZMa21YTklLZUhZV0ZKR1RPUWxFL0Q5cnRwWVRIYWZpYjBTbFFkenkxTlc4RVF5dEMxV3BzYnNTd1NPcHh1RWpGRm0zcFdTd3ZGdnZGZUUxL2dJSmVwd0ZRWS9OSzkxcTVuYnpxdlJmRjBPRnlvTVlGVTVSZ2U5MWU5cnRwTExBcGRwekhEUE5uWEJpc21OT2RQNnlxMiszbExSMnA0eEIxRzE3Z1J5dDg5QU5HS0ZxMmlrRlFXTnIrUWxQeUxVbXdGdG9RNmU3YkxteExsV3QwMyt6WTZrVTQ0UHYyMlpCdi9TRmpnSExqbnQrcnBOYm92VFFMZ3NmSWtpR2NXSDNIM1V6TllTTFJSd0dJNVN5ek5nazd4ZDBMN3R0VGRYemtpZVpzYldrSE1rb3BkdE4xZ3dwZFJhZndXTTBZRFQ2ZzRza3hHUy9pc0pnaTFkc2lKS2o5NFphR1MzZXJaTU0xbk1UbjMwSWNZNlpZY3h6NVEvbUZiZ2pnS2FFdmxVWGhIZU13VHM2MWQ0RWtwK0FESnR0R0dXK3YvTnJpcGJESGhxQTFLSURjWFg5L0ZidzJ3eEQxZnc1ZVVKUHlKTERabnVUdFhyM3pFaHJQK0lHUTlEaWxQeWJ5Z0Y0S2M3enBqV2JoLytVVGJkMjAvcTI2NzFhblQyWThmRjU1UTBmTEphV0pSQ3BhUHhqK1IzdzlGRHpqb1JUNU1TdUhlaVdEY0lnbDhTb3M4Mk15N0JnKytBcUM5NTI0d1NlSm5RKzlneS81aHVCRy8vQSsyVDh2amNPRk5qNUNSOU9HZlRqVXhnaTVOOERaTHBhaHVrclZ2VU5NcHN5LzBTZkR1ZG5uNC93YTZIOUxUVmpEVTVMdm84TVdhZGl2amVBYWI0M3dpTHBST0tDazR4ckVHaHV4ODU3alZtb05IbFF1ckdCbGhPbyt5WmlwSE8vYktCbGlxNnNGVFdLeFJXeHcwaXIyKzRkUFRDNjJqQW1jQmVCR0QvaWt5WXpHakpUV1kwOEQxS1ByQkFOTHNWRlB5TklCNWRPaFpZMDF5c3BZd2RqaHgxcGFWRHUzTT0=",
        username : "public"
      });
};

OPrime.guessCorpusUrlBasedOnWindowOrigin = function(dbname) {
  var optionalCouchAppPath = "";
  if (OPrime.isCouchApp()) {
    var corpusURL = window.location.origin;
    if (corpusURL.indexOf("corpusdev.lingsync.org") >= 0) {
      corpusURL = "https://corpus.lingsync.org";
    } else if (corpusURL.indexOf("lingsync.org") >= 0) {
      corpusURL = "https://corpus.lingsync.org";
    } else if (corpusURL.indexOf("prosody.linguistics.mcgill") >= 0) {
      corpusURL = "https://corpus.lingsync.org";
    } else if (corpusURL.indexOf("localhost") >= 0) {
      // use the window origin
    }
    optionalCouchAppPath = corpusURL + "/" + dbname + "/_design/pages/";
  }
  return optionalCouchAppPath;
};
