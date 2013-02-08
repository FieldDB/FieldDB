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
    encryptedUser : "confidential:VTJGc2RHVmtYMSsrMjk1UmdHbUJocU5sRHpsSUFGZkk2U3hCSWxEYkNrZCsvWHJyWTMyZUhwL3A0bmpKWU9sSnk2ZTFBRHB0RkQ2ZUtkVTBocEwxQnhTMHRNeW9JOWc0WUhpLzFzdFRNRFpHc1dEd1ZPdlMvTkdPK2h2akl3WVhGQ3JlYWtOTHc3T21QRHE2ZWo0SnQ1UjNqcGpYODlXRkI5alY1Yng2b0ZqYnRVWUhzZUlPRnIxYTdRSXJRdkNuSHlKWFV3ZTl2MmFnRktTOXdUc2pUbUw3SDEvd1lMMFhNQmJldzlPSTFnS0E0TXhzZ1dwa2xLcjNkZzE3endkMFN3RWlLQmowTDY4Vk1TMFpQNXgwZW5BdUdlM2tmcDZpNkxhYm82bjRsdTJmbEF3Y005Zmc3UVNqOUVXSGZiWGxNTFFWRXp1VlJzT2ZXa1J6b1Nvd3NDKzN0WWwrTmRZTUZ0WE9wTTRGTHpYSmM0bStPWkUwaGw5eHpDNVRvOC96R2F3MTR1MU9veEdydkpOQi9mSUNFVnhTb3diU3hqZFI0aU41V1h1UEhwSTlQTndERjdQYVM5QjYwM2N6UURPUWRibXcvM1p6ZXJEVHcvKzdrb01MNVRuUThxNGJYR09UQXFHNVlFVG84d2l2aUhqaE5XelZUYVhmc21KRlo4WXhCRmNlZjZCS0RESlkxZ0dWRGY0QlNMRjNqbkYrZDhFUTV3eHFCZTZ6Yk5XblkzSVF1SmNWMW8rcElVR1FNUlBVemp4My9aT3VxM2tjRzB0Q3VycEU1RWhSb1REQXVxZ0dlQTk3NThXUkZ4S3BiaEpNZmk3VCtKZ28wcXUyZHNwaDdTQzZ5bFNtY3MrcHI1UldZYVNXZldJS0gxanAzNlFDaDZrTE9ySmxHN1ZTUWF6NUU5NERCN3I4ZS8yUHZOamNtUVVoUG1OR3JCd0dlend6YTNvWitPT0R6OTJWNURWKzkwWWd4L0kvNWxOcmdaeVZBT1NVaDJUZkJiMVAwYzhxbDFzTDBiTVVVWlZJNERDVTVyeCtrTlhtTElTdW5OTmZIMWNMZkxIUVRjekU0Q1pIOW9SN0FWYTdtY01rSDN1SHRaMDVGbUFnSnhrMHFOYldGR2dKQW9jRHBxMFZlRUN0bjFKQjFrODMvS1laOWdKeUw2SjZsVzRYVjFUVzhPbi9rak1ONXlzdUdDNHRodDVCNitNWjdjb24zYVJ4b2FjRGU2dmhsZ0NwVE5jOHFqVmdkNDcvNk9TMUtPODBMSWZabytYMzVyZUJFb3FSK3RMRkxuVFpYMVlJU2h1OGJHd0JZSlpvUGI2TStIV3VpS0w4VmlCYVpOR0NhY0t4OEZISktmZGdRaDUxS2thOWdDbzdsNzdJTkh4TDB5Yit4alNvYXlyVi9oUmNZSHoxR0hSRGJpQm8rVmUxWjN3ZmxtTGczdmdONDFTdWEyYUtzMnZTVW9oenNyYWZ0QnZvYTRUckE3bUs0ZkNmWFM0d1JZMmRFMEtpUEgrSE1ZdXlOamZXYmpibFMyMlJ6ZFBuYlprMldnREpIeVAvc3U1SWpyeUFhMklwMXJSeVhZcXZEVGVqeHh2NVlPT25EK3VOcGVqT2JaVXhTVGNyQVNXSkFENXNzemdobnVTTjA1b0d5V2FtelRidVZ1YWhpcG4yRlE1OXVEUWE4Z0xVK3NFckpTdnJJNGxpWnlkUVBxb0V5WERHTUFNcy9hcTZJaGVaQWpKeVhmWUpsSHVteHhPMm0zazN6U0lCNjZLalRONVBJZE9IUit1MGVqeS85RE5Ic0I2d2pWcUhDNzBWaDZBc29VaUhxQktTQzcxdU40d1pXWW81MDlaUkhkSDhpU0JjWkFPcllXcHpvMFRacnF3WUxkZmx3WGdhYmNxUEdOeFhXTEQ2eGNEUTVxODdkdTE3WHdkRno0SEYrMnduRFhsWkF2VXVDQzd6ajFLOURZNG9oejdCeStpb1UwRUYxbEI3NUpIMFZyb2hjLzV0TGFxY1czY0hTVm9WQjNwZlM5Z2VNYmt5VkorcnVpeFYxYUYva3B1Tm1NU1BXOU9oRW9GOVkvV0VNVmJSMUdyY1BiVlU5akRGRW5vMUtNZkt3R3NCQTFxNENLUGkvcXA2ajNtT3BWSG5aUEV4blBQKzhlTXRGM1VZZCtHYlpad2IyUVh2WTRhMVVIeGRmMlN1aE5VM0hIdVQ2WWczK1Zoam1GR0R6OFNLVEQvcXVDSGIyVmxjR3VIYjl2b2RiOGpCdXVsb09QaTNCOFdsWGM0ZmNBb2JtT1VkbUppa1ZSUWVLVHYrTmpxVGVlUUNzWUJPSWFUMHY2Sjg2WkM1dmlSOGlnSlNzbXFOUFVXd1dHVjRvUzg0Z1lyQmliNTlBcjhzYUFFenpWRTZYOFVMNVNOOUErZCtWK3FRVFBEb1RmL1lWRStJTlpXTW55dGc4cGRlVDlibEx2Vk5OemV4TEVYVlNIdnVvRWN0eEhMd29lV1dLTDhLeUxNRE90bExmUWpzcGkvZ3hnc0NHbnlpbGZhWGUxYVVjNGp0QVdUSW82U0Q3S2NFKzBEeGpzM3JUdzhQdzV1VFNDNFlVVXZ1ZisyaDlrZzR3UnEzeGRrWDNwWjRjM251VlNpOVBMYlR5bS9yWjJHbHN2RERKenZBdE8xRGlldW5FTGdJKzEyTWdoTDZUUi81aFp3endLYXBWM2IzbFlpdVJhNkg4RnFveUxVYW1pdE44aG84SVpHNHMxcVg5a3hURFViTk03SEJQNzFaNUUrbTd5R0c0a0lXdmRuUnRwekJqSGpjb0JodlFCL0k4dW51VFNVclhyVGJuNzdSbEZWcDRFNFdoZmhUb1RVR2dLbEs3MTBLWXJMSmpybE5zdWxaUFAxckFXeXRlZlhTRVdMVFg3ejNrLzVGMkQyaWNxbVQ4UEIvTnNYL1ZoK1F1eTlxM0hOeFk1TngwN1VGSTZJTE1iU3h1c1doRytJSEJBUlhXUXA1ckd0U29jUnJxcmprbytoSEVXZGhMZzdxRVdPRGdWSzVmc2d5SVVCMTRsVFM0Z1IwRWZvTlpHVDhRZGhiYURObTNNdStyWkZ6R09FSHZnVWU0aXViYUxNTCtDaUNBVXRycHFvc29IYk4xK0ZadkhiQUozaE9SYU1uRUxZQlgxOEZ6N2hpQitDdmdHby9TWFZBT1UrWFlubm85ZUNzdEZqLzhwK1h5QU40b3dEdnQra0RGWlJVa3laQWF6WktiRjYwa2pyajBYY1pjMzM1QVZWVDFoYnFzNmVBR0xKeVdHbXhBbEJZbjV5QnZ1dkFRTkRES3dENlVwT2grdmpsRjRFVGRLSkVDcEZMK3kzWXVGaHNTOHpQYnhERlF4OEVkTE8wNEFVWDM2ZEppTXZ6TDJiK2hiQy9vS1lnSzRQOCsxU2tkNy9BME5YaStpdy8wMWtpMXZwMW5yL1h4RHlJaWtuMCtxTitWakZOeG9JdDkrRStYOGxTdUx6YXlLaEJyWHRqYVpXVy9mZ2h6V2lZbEVNYnI3VjE3Yll4ckRlUlRiZU83QmpvcHFQUmloYjF4VXpSMUluWGwwNktuWUdTOG5UVkNIaFRqTWQydVlXODRNL1FYeTluTE02UmJUa0QxQTY5YWdqMytDVVFTQzZTempQL2FScXdNMWxxNndIVUVpL1FEUllrU3kvSEdDV3dmdVhzTnYydDNQcXh4bjFHY3ovKzB6SUdsNnZwUnJLSU5iUURZMWtIYThJUExMcFhXSFJEMWVkQUxidjlxVXVqOXRybkI0dmF3NGROR0RqVzZmdndXT08vY0ZFNzlGNUdtd1NHb0cyQS9NeU5YSGRIdlZqbkpnZlJaNFRvc1hobFNhZ1ZIUVNYYUZacFB3b2NYM0VVSk5Lc2tkWE9QeUJET3RIUHJsUnAzTW9jZnVOZ3dNV0xBOXFhOTk5QXpKYmQzc1o1OU42WUZTai9TQzVHUkFvbE9FR0ovY3BtSFcyc0RpaHRvUWpUTFEyVG5XQmFhTncxZUE0dW0zQVVMUjZjUk44S2syNkxsaFY2cXJTZjMwc3JacGovalpGeU5ZTlYvNVV5a3V2WU1QV2tKY3NTeUx3WW51Qi81SkRGMy91NU1FQ1Y2UVpKNGlQazVGVm5NcjQwdmpIV2RoVlFUQWIvN0xmWUI0VncxcXBtckxGNTg4N3g0Zk0vRUdxanBHMjVpNXh0cmQ1WWFFSjFCZnFRdXk4bVY5NkdVWi8xTzlUSzBlZk5PdlQ2MEJyMUNjUnBBa0xEZ1NURFlJMUM0TGNWaU8zVlNDMTN2TWlhaU9mZmRjRklDYldwQ1p3Tk1hanNscVB0dzNadXNMdXF0WngzT29TNnB2T1ptdVpSeFFOUFFWSE9rVnVLQmlOYi9WY2xQSGZRaStQZjl2VEF3Qk14QjVoTmtKMzN4R3MyK2JvK0JDdWduclR3TTRQTjBxeWhZbXNXMDMxdDQ2ZHRjWlNDT1hvUExCUUtQUDBJWkU3U2NXeUUzTHBFa2xrOWZRWnFydkNQbmFxb2VkYjRQRFdoMUVJcklKMisxd1FUZmYwUkYvNkJ2d016U1ZWamx1bGY4eTU2K0k4dHRseVpoWjhPME96bGFUR1BqN0JCSk03MHVvVjRaVjlkN2E2bUhmelhKUkNzZFg3Z3A3cTJ1aFN5YmFMa2lkcXBhdXYrdE1HZ2hRdEpUS1ZQQzZvSDIvTTdoeFpvNnBsUnptL3I0YU90MGFFOUVPN1NTUy9SQ0FYMXpnLzFwa3BFQkdMbktpT0lNcTJscGRjdjh3PT0=",
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