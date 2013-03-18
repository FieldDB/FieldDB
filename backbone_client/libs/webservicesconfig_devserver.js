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
    encryptedUser : "confidential:VTJGc2RHVmtYMTl2bUM2NkhxOTU3aXpmbVlmTytpZDRFbUdKOU1tSXgwaGw3QkdkY3BOejNUQVdBOGhEK01ybjlTU1R3NTVoVnQ4WHFweDlJK3d0S2ljOTBrR2lzbENzMTcrQ25Bbnpsd3EwdVVKYmFGUUJVT2tLUFA2dE9BdTBzQ2FRcCs0WkgrY2lHek1jNkJhSHFKazJGQmFpTm9OVFkzeXJQdDJsU1RoWmtybzVIYXdQbzAzUHdZNEh6cXR0bVhWTHZ0NEdERnJENlJlY3BPTDEyR1hWT3NwVHF4RkV2V0RVS1ZQandHUHovT1RtUE50b2NKM1BNNXE5K25DdlVzMWhpYXF2RFg5NkZzY29HaFBueDZIWmJsQTVTZ2UxU2xxd0hiRG5ZRjZEUkswbk0zbEdwVisrUkdwSTQ2MzhDV3RoeWoxS1hJamVQZzRlOVlWTkx2dTRrL1MwRHYvWGlWZjEzZmxpVE9qWUtjRkdCRmh2cXBtUVY1cFNrb01xRWpPZlE3VU1wMjRWQ0QwV3c1VDhoZC9wZWFyUmtmRE5lYnI3aU5UY0RrVDQ2SGNLdGR6YkorRC90NEdoRDQ2YnFQUW5scUpITkJVQVlvOTMzMEZEalRCdDJxcGFOc01xemFHS2QwVVFxSVo4Q1pHUUVYaTZQSHVOelVPaDlPYjkzNmQzeXFGSXFVVS94MDQ1R1RiNUFCeFdwOEF2ZzAzZldBdi9LY2J0QUxKQWtib3U1YTJYcEsvalR5cFdlenVKNE0vc05HMTV1WE0vTTdEaWpkZmJSOEh2NVJGWW9KMVgxWnlNTUVVUXp5N2pWMVh5eVQ0N05oWTNJdzc2azBvZi9WdWZLa0tKTWFWaDBTRGZESkRLOG1PcUxTekdycSsyQmlVaUtRNFZkSU40dGxMcWcyMDRmamEyUWxobEQxSk9LLytIWEpYbUMxY0dFYTh4eVc0a0VVUkxxVENpT3duN3hVQW9HaWdNZDZXbXBjSjZ6eXI1YzRKOGdqbWk2a0tzSzh4eThkVXVpVjZhbWJxNUdkRDFsa05wQUVJd21JcE11dndkVGMxZU5TMDdsRTFrVjBjVTlNOHNXekoxejRPMktxQjVsR2JDa21NOXgxd25iZjkyREJML1NLSzB4eURHNjJVTFZ2VGpDRlI0eXIrQkZyS2Uwa042UkM5eXUrRFI2b3lWcW9lZ3FrOEsyVSs4S2dVQkQ2Ykc0Smk3L2Q2dWVDYjZzcEQ3Z1A2aHhjNEJGMlVOSDAyYStMcVZweklPb21hVU5OaysrTUp4TVNYUkZlcEFoRkM4dDFNcklKTHBScG91V2hDTlFFTzViaGljZVlqL3F3eEpWcTRLalhZakZnRE4rUFFnWjBJYlVneFJRMXhCN1NaZSt3R3M2NUtlZWJySnZERTU0K1BVOVdEUUpHdzNrZVNSSTJrcmhZSDVVZHAzK09wTm1mdGZkcUtPMHlJeW03eFdhOEN3a09sRWF2Zk5tckdWczRldVNSY3FlRlFsakNmdTVvbzhQSjNSbm51WWxjbGxqM1psTXc3Ui9IZU5QVVdmNXR5MWhyVWZzTmNxVGJydjlnVDZzcG1RVTU5TDNlajB3Y0x5TURxcURYR1l5UitHK2M1eUQ0U09jcVJXQXR6ak5FWldjUE1yZDVMZWxlVHNQM3VDaEZDZ3JDY1g4RkdNOUdzWEcweTN4Ty9jZXYyQmpZaFJBNTdJK0xPRWxCSzVNSUlnTG9lSUNwYUs1OTkvaWFzSXJSRlhNYzBweFBFMmlsdUg3S0R6TGUzUWVHWWp1TWxFNmV4NFVndlJkRHZpSmFCVGt5eDZYNitpaUlsUzNXUUV0TnRNb014dkpWSmZCYmE0dlZ5TXhnbkRqY3g4UzBwSFFQOVBDOVYzNmxJdzJuSmxuNmRwSHc5OWlKT2tzWFJkanBkOW5PeGpaMHdwVTZ0SWhkZG8xczNMQi9tN1BzM290dmNPanQ1UUg2YVJodnR6cTFCS1hUK0hGei91a1NlMXczQStycTdmL0ZDenliaW5PMnlQRTVwRmg3R0xFN29vWHFlb2MzL0J6SUNLaWFaeGJaTlZ0eWY3TjlCanhlb3g2UlZNWEFvb1B5cWRjdmpsMytmUnNaQ0Rrc1Zrd05ZbUNyRExqS29IdVJYdGs2R09CRUYxZXJzR0RxZm1PU1owYUZMOXhNTUs4RU1wL1ZsejM4eVRQVjd6VjY5NVdRNVkvL0hHWkJBK1g4TWtOMXlzWDNXUFJtQ0drUWZHY25wRHJEdksrU3dqdEFDZ1dMc2pxa1BGV3lsUithYlh2S0lKK09OYmZrY2R3dXEwejRzclE1YkUySVVjL0Y0OGZYY1p3T1VMakN2WnJqa1BlTzhwVyt0Qm05SzYwZ0JMZGFqMllSNnN6Smkva1B6ejNuVnJvblNTckRkc28yTTg3WEgrQ1ZiL1Q1cG56UzJMU0lTV0pBNThNdEdKYUU0UjJobmpmNEZKOEE0SEZFOFZPRFM1d3Q0QjZKZit2UlhDR2xKWXc2M2pUaCsxRjh2a2o1OUpaWndVWmhqTmhwTFZZNnZsVk5QQWVpcHhUbjlyZk5vWjhhWTZRb1dabCs5UGwva3F5TmpXOEZyTWEzcDZtajZxNnIyL0h1NE1Ocm15MzAzbDlnMkt5T0paRTlkcWpZRWRjV0NheWVrTzF0UENzdTVucTMybEdLUWNjSkVoUEl5QkR0cEwwKzR1RE5GdjdPMDVlVFB6N2VmdDh5QURCVTdhMDFUYnUyamF1NjNUci9wYVk4QWNCMnVoY0ZGZGdrS2VoNm8xeVZIaktXNEFHRlFxK1REWXFJWFF4RmdpVlZXdStCWjNIdzNCbWxWU1BpUFAxWXBTZ3Q2UkFOdWV3Vy9JMG0yaTlMNWxPcDkzR1ozdEhoZ0s5MVozSjgwUXNXMkZ3RDlKUXg3TWxYNTU1TFRtbG9VOVdnQkIybmc0OGMvczFiNHh2eGpIR0paNVdiRUlLdE5idkVvNU14MzFOYmVKVnlQYlhoMEh1emh1REtEdXBCNDQ2K2dWaWYyS1FhbHl3WlIxczNzTEpGMG9nMmpwVFBzOCthU0lpTkNRclBlaURMZ2xoS2tsdmxMQTNUb29RSmZsckFsR2JJTWlENzhKNmZCM0pGb3ZpQXRTOEpvTlpjVVNTVVZBTjVUTzlsbUdFYnlBb1NBbkkwbEZ1RGdibVIwQnVsZVhqdkpKZ1p1MGw0d3BndTZJcDJWNkpyeENaV3pVNlhUdGZqV1l0S2VUWFVrUjlvdmFWSFZ6VVZnYm1Mc2Y1dkF1RnliN3l6dlVxQkpKaVErQW5QakxybWtKQXAwR0RmZGZzT1B5Mlp6M3FjNERYOEFSb1h5UEh6WFBXa1k4S25xMmszOHg5ckVtdUd6QnRDNmtmZE5ZNmdQcS9udDB5aXZkSVRkS1BIcm02ZXpleWtxdkZQODNIK25MVHhZVkI2dStDS01PQjd1clBHeU94UVVzRXBaN2RabGd2cHBPOUpuS2M2TVg4NFJZTmQrMGt4NzVNZmd6YzhpUDlPd1pHODFIWUJObmJCZ0NoR3N3L3N6RllOeGpoajdVTTJIaXVFQnJuU3dWdTBSNkl3M0xvNTdmSnhCL013WGp4KzgwenpxbURtdHBCdGIraURaZWdEOUpTQ2xxdDdHRldHVTNnMVVZcjR1dGxZcnFQdzIra2ZlMUR5OHNFRVh0RHR1Q3dqU1JWeWpyeEh4SzN4czVTUHo0cE02NCs4R2hoQmhKek5UYWhGWmJuZGFZekxsaXluc0IwME9Hekp3dSswR0lYem9YUW1aUlB4QmtnYWtGWk5yR21kM0xleEJlMzUwQVhBRWRJazZFT3Q4d3l0SGttRUkvdkJJZlZrL0g0NW9Eb0M2bXg5R2x0UFJXQVRKK2VzSFNSZStaMm5YeWZqVzFJTzBvM0NROWpEajVId2REMldkTjlrUmZWektHNS9pSi91RVJRT1JkRmt3N082VzF0azF5MWxYRldGaGwxcUpwTjdZREk5dmxUbzVWbVcrMkptMktFRWxlVGw2WHdMRkJodUw2LzJqdlRFUG9EOHRmTC9yR2tKQU9mcnRFQmFCOG5YZmNNbjQwbUE0Z0dieUVFcmtTSGhYWE9Td1ZmU29kN1g3dHhKSVNqcnUyTS8yeE5SWjR6V3p3YkNPN2ViZmRXendKMGozZVAxc1pqUDY3cXh5dWFSbFN1dHZQRSs5RVBBclRmNEtLNzY4UktjVGlqZmlBUThhTGxtcHBzb0syMmpYRVppNHc5OWpRd28zd0R3R2NJZVZLcVdCU2RVeTRPR2I0SVE2TXB3TnhwcnRaejFzQUlqV1p1OGdMamhteXgwaW52Tml6KzJHT0hCQjB0SjVadGNJR3hyUFBZWDhQNERKNnF1OTZKQWVob0Vqd1JHdnZHUmhSZHI3QVlOSys4Z3JXTTA1UFRwS0twTUREN0xKTDZWMEJQMmhYYlROb2R0Vlh5T2FQSnBacm5tclpZUUxXbTdhdkNkekZ1WjdFbGRwTmg4MUpIOG8yL09GSm5zeU52RVRPc296YkJkSHM3d2xSeUVSUzVEaUhFUS9aZUQ4M21UTlVFTTVXL2dpZ2RSaFNqNytHaVp5WGlIV2MwNXFNRGFiNGdrLzN1ZDFBbUUxa25hbG9hdkVoM0RtVWRLM0U3VXdrQkdxeWh6cW5kb0xyY0tBUzA3MS9sRGFrVnpSWkttRHFZeDRUN05UV2I2bnRTNHVGQjFENXFnTUtZUzhUbUVDR0N5c0cxSkY4aHY0TVYwUXJvOHBBWFRZek15d29KMHZBUGlOOERjSklNNVhUK3ZZM0tvWnNscnc5ejFIUE4rVDQzSDZ2YTNqRGlBNndvV1VBUTFlSzVUNEV0ZWNNK3BWdkIxc2lXeTEyWlVmcmxYQy8rQ2tYdndpL0NhMGhPdTRSR3NEYXlUWDFVWUZvUCt2dmRsS0NNSUVyRE9WdkVkN0VnbjV0U0VwNHNlM0VhVDYrNzBJUkVFdFZHdHlpbnlrZ3owU1FZalRuY1JQVFVwUG52bnJCTy9QQXY1UDUzQVpuWDFoRmlRdXdObE05M2RWMVpaTzMvN2M5M1VjVTVwdW4wZ05EcFptTGsveGFpaVAwV2Vrd1RmQ2NveG9MQnppd3RTNnBiOHJObk14SmQ0Vk1MMFM4bVQxUHc4MkNGVkNxbFhtaXNzYVAvVU43YmxNLzRvL0JKNG1oRVNOcTJEL1JqNVpwM3JwOWJzVHNUSG4wckFhblpuTjFYWTJBY2d3V1NpWDFqQlFqcFpCa21GNi9ESGFHUDNkQk5QTDlCL2RBYnpRYTBHbWFnRmxWa1BGUm9IaXZqbjM2ajBWRy9rRHBrOW5GbCt1Q21NTThzNGNKZklEQjVJOGl1b2hBZUxIUDlrTHRXMW5MNDJFaGNvaC9tbzd2S0gvSzBxTStkYWR1cFZFQUZIL0NXR3NaeVpKRFRGbkVNSHFzM1dvRjRZRmdmU28yamZXeXNTL294VTJXZStpYVNLNEp2bWxiYllFU0daRlRzVXdhM2ZuTVdXUWxRUmdZMkQ1N1dnQitqWFcwQlpvNnYyYS9BcSthUDUwa2E1R1o1Ri95M0NNNUVzZjFzbmVHeW5tOVl5Q3cyQnhCbGl0R3VEcjg5WHdTU2I2YU14a29ZZ2V4ZlpYeU53UkZUOFZNaXFCaXNpSmd4NWJPK29WN0RyTVRxNXFUUmpRakZBeVNtcnNNcHJjL3FoRGpFZGp4c3FCRDFGQWxtcFZKRzJnTE5zS3RqbHBaTTNkdVFUR3JtTWlTTlBCb0w4WG14d1ZUNm1ya2NnekN4MkViVENmVDZpalZlcVV3Yk1vUnNtdHJjTHZ3",
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