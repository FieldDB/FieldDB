console.log("Loading Webservices info");
/* Extends the OPrime class */
var OPrime = OPrime || {};

OPrime.websiteUrl = "https://localhost:3182";
OPrime.authUrl = "https://localhost:3183";
OPrime.audioUrl = "https://localhost:3184";
OPrime.lexiconUrl = "https://localhost:3185";
OPrime.corpusUrl = "https://localhost:3186";
OPrime.activityUrl = "https://localhost:3187";
OPrime.widgetUrl = "https://localhost:3188";
OPrime.chromeClientUrl = function() {
  return window.location.origin;
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
  var connection = production;
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
      connection = localhost;
      OPrime.authUrl = "https://localhost:3183";
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
  return JSON
      .stringify({
        token : "$2a$10$VEzkBbg7kN5LpiEurR7HgOuBxtcgl0g2E/1RQq8OTju7LbqZb2n7S",
        encryptedUser : "confidential:VTJGc2RHVmtYMTlMeldLZlVXTXdLNHc5cW0xTWx0anB1M211NjUvZVRaYUZPaWRFZWIzRDVtTmc2Z21Ea05wVS9vZ3NUcmhiZmRONTM0SVlLN056RXplNEE0eDJwcXIrZTJoWXpXRVE0UHlkWURhd28xb2pIY2dteW5YRTVsY1VaS2M2a2REcW5UaUlteUk1NVVqY2t0OHAyeGRDM1dUV25HaXdTUEs1a2t2QVlNR2Z3UXRzSHlyMWJ3TGdyMllUZFpNam92c1pHK2dyYU1oMEd6c3BWS1BBaHRvRWZmbjZ5dzgrdnhhdHhXWTBDekd2M2xHMDlmdHRLK0t3UVdPRnIzeDNHakJGTjFoLzQrK2RRTDZiMjBHdmVBbEtaYTdWTkxYMzFmVWtiTXpSZlZ1emdaVHBJU2JmVUZRWHh4TCtGYUlxaythNWhXa0U2Ti9vTVc2OU9HM2I4d0dkNUpNVHRrbnZHSkJnRjRuU0RVeVQ4Tm9ORVVjMkdvcFpLSWRMbHFOWmZZQ3Evd0NWK0psOXZIa3NIZldxMGpZUEU3V3lGeVh5RnNZT081SVZEWXhxc1pEbmRWL0xDK3NOUTJhQW42dXpDdGx2QmFvU0daWVl4N3lsT1l2WVhvSVdrb3B0b1IycHVKbVFBUmpwWTY0U2Vua2JOSHhkeDZ6czVRSEhXNTlnSkJ4MEdpNGhGdHNTcjNQZ1I5REFBTndqb3krZnU1WFRTWUtVNTluT3F5U0VEZFU2cDN0TzRPcC9TYVp3SW9DbmZKRVp6YVJGSFFxQjJpVXJ5YTNIOUN5eUk2ZTBkZlVyYjNmelN1ZzBFOXBxNGxvb0pDOE5JcVJ1ZE4zd24vWC9wSW1pNUhWQjhucmxhZDN1eUM4NXZza3M4cFYvWVJMeHYxc1FHNnVDTlJzUzNYQ0habEwwQ0FSUnhlTFdFMGlUNDE5RGpnZEprWWtIL3FXbkNxTWViV3lveVhrb2lmTHgvNVpuaS9GWm50S3JqZ2dQcnIxZ3BnZ253Unh5STZWdHdwZXVUdGNQY3ZiTmVaR05CQTB0Q3BlaUMwWmpwZ0c5ZWI0ZXlQSjcySERtaFpUT2NucC8vZ0VzNzFFSkdPQXIzdDFKd0lHeGxKM21pdnJIanlWRk12RmJ1TStQNFQ4NFl2WGxGM2k4Yk90S25vUWlhS05ibk4yTC9pNUtGTDBBcGVPZFR6cWI0aWdBS2NOa0lEeU1YTEE2ZEJOUkFwWEU2eWxuckxIUzNIM2N3cE9lZExIYTk1U1VJZHhlUFlTNkRIQXhxUGE3VUN6ZjhzQWVma04wdDdSTHVOZGcybG5pMVlXRGpRekNOalh0WW1CV1NPZFkwYURUT1ViSmE4RVJOV0pVVXV2NE9ScTErOE13bk45cEpJYlNGamlxdFh5bFZ1czVIcFJmNlduV3hLTWNYYXE4eDlQRXJuZUExbDRoRkhtQzl6cDVqdGdJMXlsMHBaRzZYNzBjeHhEcjhqVDRlNEZEMFQzRG5mVTF3U1NRcGI4OTNHQzV6VDJoN20wN1RrOVlzdnFMR0VoSXJHZHp6aXlUSVZxQzJuaktCZU53aGRDQVNvbW5yYk9WUTdCT3BUSjZ0NTR3SEVPZnY2cGlSWWZnZmE3MXV5T1pPN3B1RVdhenByckVBVE1DM3FyMHVja2xqLzl1QndqTlZxY05ac0t3WEdFemZrK1Rqc0tBelY2bGQ4dVhDM0U1TTJPQjZ5TkkvTGtla2x4ZWw4eEo5UWRQajNJclFPL2xxdVl4ZWl0WkpkMVZwWDF0WGcxMTUrT0cwMkJNQk51eWptRVNYZEdxU3dVcWFTZjB3UHhvMkJJdC9qRk9rUzUvVnBRY3NmNGpSb05MNkY5MU1uSzJiejE1MERQcGRIOTRLc3RWRFMyWUlTNGFYREc0SmJMZmRiNG9Fd3Rxc0RITS9nc3VOSlRhakZNa1RkeVZXQzNCWlQyUkNHUkE2MlFZOUgrajBtSzl0emUzbUpOL09QUWNaUTNDZVBLK28relpqOVBpL1UyWlB4NkZaT1cwQk9GRDBMNjNaeTRNL0hkOGRXYWQxVkt2eGp6bE9nL2NuVFcxTll0ZjVwNnJkU1EzcUZISDFmUlk4bmJZSFV2NTc4d0EzeFpJQ1ZNbngybjBrMktMSDRaR3Y4WWJwQS92bjBGd284MzF1cXJjd2VnN3hsU0xRZ2Y5dGFrbXhvbjNNQ0pQYUh5a2gwbU4wcktOOWFGNy9ReXV0Q2pMQTJneDR2enZHY3VITCtRalNjY1AvazJKcmhCZFBoelRNcDZMZWUvODhiK1ZURGRtRWhORTZGYjBadXFkUXo0QjhTeTljWDVheWluSzRxK3RhWUhWeUltT2g4ei9ya0EvcEdEamJYT1dXSVd0bzJhRER0Ym1jSlNVL09UalMzdHZxZ3NSYlpyelIzeTRBUzUrVXEyOTVHMzl6VklFMmZBbzBkTmlsNStSNkpXME85RFhyVnJRQUFiZlpWSFdLZld4a1RNWW4wd2c5Ry9HaFFEd0dCZnRnQWl4NzVmYzZvaWM4MzRtNnBhSDJrbFl0cWZZZHJ1eVAwUjV6ejY4MVdpVWZ6cm5EYVV5bW1CQ0pDMHV1VXF5eVlqYmxnYkc3VWhOY3V6bXZUMHBncTYxSkZjdi9kdGhzbzE3ZzhveVI0aFNJdEVFU1Bna1lBVmxqOXhSbEpUZjdWMXh1clJtT0FvSExZdGFKcVdTVkZGbitJZXJwZVhXWDQxNGVwdHZUNGhrNElDSnFPM2dkVmFybGQybXkwakRBVVZERCtFSE5ZVHRhdmNuRGFLWTNvYzNpeE5WREY3dkNJQ25CbHVRVVEwWFp4M1Z2VVVWc1pJNEh2eUhud1FnbTc4QUhRNkp1QmYzelN4ZExOMS85aWVlMjl4MDVPY1VpTHQ5aFo5NmtkMDlhRzlGdlJSQUNVNk5zSjcvWjg2a0hETS9sajFndUVmRm9lbnlkVXJGL1NiaHVxT1ZmeXh0UHBoOUh2azA3YkNuNGlqWi9GYTFRS0JYUUhGNGQza2x4VkpHOVJSK3pXSTQrU3g2NXg5LzJJcjN0S0JtdjdZMFFjdTc2YW0yRjVoSXFaODhjWmxDZm1UWE5nSEhDaTBHZmJ5czBRVFJXVE9yZ2ZybVJRKzBKQXgyanVXQzd6RG1yY0pmTC93cGhCQWxtUld3VUhhRVV3cnJLRFYyRDBQZnhWSTN4dmh3UmhERmE3UXdlc3d0Q0ZJVWpETG9KOFVWc0g5UkpOaEk4SUprUG9jZkUySGsydEJkb1pzZEt6Nm1tYy9USGZnQTdyTFlsaFcvM2YvR052WGU3ZmFqQjljUVU2TG94eHpVZ2dGbEVhT2NpbWtWTUpRM0FJYlZyemhvWFVPUnc4MWlDQ3RkNXJGandaelo3VW5Hcmx4dkZqV1JZeE9sZU43djFUZ3lzNVJNME9JMEJTaHZpYkpMZFRLOGFvNkhyclF1UEFtQzhaeGpJWFdpMVh1UmlCYjQyRDgvZUhpQ2hrbzZ0NTBUR3ZzMi9yZU1lM1lpcVRCT2N4UzU5NHQ0UXBraTJNRThhY3MwWmhWWDZEZExHRTdxRWwvOG5kNmkxZzNBRlBYdjdPVXNtUVFPV25iRjNVM2lYMDAvR2JQUm5ubFBEazZUTGZoU3U2QnFZYkFacmZjbEloVVpKMHlUejF5OTlIZVlWRkE0Z2ZGUURTQkMyQ1NYUTdwOURPdE1udHZmUnR2ekF6amQwOUxZVXpyOVFkeTQ2bTVYejdUYS9JUi8vbzNjbFdoOFZoMTZ6ZTR3NDFmbCsyazFZcjdWeGZiM3lNWE1SU2VCcEQvQ0UvK1hoRUc0dVhZd3dFTUU0YTdzYS8vNXBXMEZZbXFCYVlocHcvdTNxNysrV3J4TTFtL1BNWXlKMU5TS29OVVVtVmRyeWhZRDh5OGxuUzdITW1TdmwxOVh3UHZUTjJIQU1FdEt3WGN5SEpUYW40K245bUF0RUErMnJ1TnVIeno0dUVyUFZRSlVVZVRsVVoxbUdpcm1EcnR3bjJFY1IwK1J0dCs5QVZRWTBHaytRUVhNaHQ0b0ZyZ0pLRVk2QVdDU2ZwTjVuQTdpenpZLzVCQXE1blg4SFBySS9WVENCd0ZoZ0hNOHk4VkFGN00yS1VvSlBhWGJLRGIrTjgveVNqUkZOcmlmelVpQXJrNjgwSDJFVm5NUjFlZGxNaFlCblJqRXVxdmNMYkQ4V1lZZDFwdTRPR2MyWDgwSDZKOXowTXRuUFRSWFpQRHE2NFFPbE5tOW1sTlozR1dPYmlxWWJ1TDcwcnBNc1RUNENZYi9VQk9FNGxwQk1DeFhqd2M2VENWenRIbi9penlqUWNTMGlEOXNPNEJreVJ4MGszQUVLSG03eTlGVW1DM3JjMEVuZ0hkU2lsbnZSQmtORE9JUGlFeUpsZG1YQnh1V3N3MWtFQ2lzSHp0YUZmaXM5OGhhdHFpRTdiYVlYWjBZczB2ZytDODJXTXpMeVhOVDlLWlhJdVlxOUVHWmpVZWUwc1hrOFNkRjN3cEorbzR4M0pXLzY1R3VMeHd3ZDVQWk4waVExcUZSU05UUkFTSUd0aitVOFJBb3FFd0pKTDRmLy9zQmRXSlhiLytOTCtXZ2NDUWRFa0xjc1hxTjlZWXZ0di9EaE00S0JzU1Z3M1NHR2lJWG1wRFJ1ajVwdVhtRXBLbTU2K1Jha3c9PQ==",
        username : "public"
      });
};

OPrime.guessCorpusUrlBasedOnWindowOrigin = function(dbname) {
  var optionalCouchAppPath = "";
  if (OPrime.isCouchApp()) {
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
    optionalCouchAppPath = corpusURL + "/" + dbname + "/_design/pages/";
  }
  return optionalCouchAppPath;
};