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
      path : ""
  };
  var testing = {
      protocol : "https://",
      domain : "ifielddevs.iriscouch.com",
      port : "443",
      pouchname : "default",
      path : ""
  }; 
  var production = {
      protocol : "https://",
      domain : "corpus.lingsync.org",
      port : "443",
      pouchname : "default",
      path : ""
  };
  var mcgill = {
      protocol : "https://",
      domain : "prosody.linguistics.mcgill.ca",
      port : "443",
      pouchname : "default",
      path : "/corpus"
  };
  
  /*
   * If its a couch app, it can only contact databases on its same origin, so
   * modify the domain to be that origin. the chrome extension can contact any
   * authorized server that is authorized in the chrome app's manifest
   */
  var connection = production;
  if (OPrime.isCouchApp()) {
    if (window.location.origin.indexOf("lignsync.org") >= 0) {
      connection = production;
      OPrime.authUrl = "https://auth.lingsync.org";
    } else if (window.location.origin.indexOf("authdev.fieldlinguist.com") >= 0) {
      connection = testing;
      OPrime.authUrl = "https://authdev.fieldlinguist.com:3183";
    } else if (window.location.origin.indexOf("prosody.linguistics.mcgill") >= 0) {
      connection = mcgill;
      OPrime.authUrl = "https://prosody.linguistics.mcgill.ca/auth";
    } else if (window.location.origin.indexOf("localhost") >= 0) {
      connection = localhost;
      OPrime.authUrl = "https://localhost:3183";
    }    
  }
  return connection;
};

OPrime.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";

OPrime.publicUserStaleDetails = function() {
  return JSON.stringify({
    token : "$2a$10$VEzkBbg7kN5LpiEurR7HgOuBxtcgl0g2E/1RQq8OTju7LbqZb2n7S",
    encryptedUser : "confidential:VTJGc2RHVmtYMStHUStFa0tvUXZUeC9xWXEwZEpHYlg0NEJVU2FlUUcvWlNPK1c4NFdLTGNHeEVuRFJueU9WRU50RXlTK2p5V3B5UHZaVWJlWUhoV1NZU3RrK0N4cm9obWcxUk5jdGFIMmM5NmhyazkvTTJJNnNzN1B1MVAzbTJMTUdjTWhBWXRUTitZZ1ppbjA5N3RrMERRUGFmTTZhR1ZVRG4zZmlZbjlwZHBxcTR4VUlkQzc5UG82MG1NSndVdmJKeU0zVFZYRndhNzJnSFBNR0h1RE04TmpxVVFOSnJTbldVWEJNM3RXOVRRWDVPTi83R3FRUDRzRGRzaGQ2cktDQVpmMVZPZ1NJUVRycnNGSWYyVjVJQ21PTG5aNHczK3NONC9UM1lENDZKR0c1UGhqRUpSN2RvdElqbDB3ejFURjVjK1ZLUVRTSnhkNW1XWGVFeWFEcTNSMnYzM1RjUzJkVTNhcFRGakgxTUZLVFAwZjUxWWJ6K0tHQnlONElDcTliMGxhM2dXZGRONDZkVWdoYTk5UUFJWlQwbElhQ2MwL09rV3czWmNFcEVXYmZmUExVU0VWUW5PczdvUFRvTE5aNHJDaDhMVmh4cUlEVEFTeEtQY0hGckVsd095cDJ5OG52Z3hEVGF5WFFIL080bVJjMGdCNWJTdGVRK0ozV0wxRGd2OHgvaVFwcWJSRmd0Sk9KL1JDdWFmamxweVlieGNXV2RoYXVBcDkrM2FadkNiR2kvWnM1UVZmaS9IMHN4WlR1WVh4SDJkRGxPU004MnRCMXRHVjRQUmgwMHIyWDJuU1Jpc25DdmNWWnduR3g1Umx1eHZvQmllemJjeS9vNlI1WXA1eVRLTy84dGJuK2dTWlB5RmhWOTdZdFRia1dWY3pETkdQNElKdnR4UFZFZThhc0d1dDFzaWRtQzJLVHF0WU8zdHkwUWtVaysxZS9MNm1acmlCaWRCUEQyM2lPTGpOZDZpNzY1NWlyWFlvRTJDMWpWcU40TlgvSkhRRXZEeVY2T1Bnd3FJNjEvcURMaGVCTENlMzM3UGdQYTREeE1VVFJ0d1gzMExYWVVmUVY3NmZJUUZnLzM2RWpDSEdFOFF3V3VwWlJNTVhMWG9jaDR3c1ZNL2I3bXVJOGZPbC9UM09uUWc2N0hSeVFGZGVEaktheTlmSlZjOFB6QVRzV1Z0aVRPb2NLUGlkWm41bjNrVmJoYnhhWnNFZTE4MmNCNGloME93bU9YOTQ1Y0NmNUJqdUJtZkdLNHpxM09LWURiSDRIdFRxVHZEQmp2eEU1M2htZTh5RDI4Vkh3bk9jek4xQnF5eFRIWjc2K1A1RHFybFRNM2xsMDNrYkZ0UTNJOFNVMm8wRU1SMXMzam0rNkNoVVFlN291VGxMd052VUFab3Fmd2lybTgxZE5IaG5DbUNpTUtsTGdXd2hVQ01lY2tWMzRpcG1TS1h5ZTA3UVI1UDlzNzdDSmQrQysvcURZS3VFYTZjbG5GK1h0cE1tQkhSNndoZlA0QktZRFpWejl3eE51TFdxS0JCMi9aRjE5WlZmTHZwMkU4ZnVlM1V2MHNOWndKUFRkRWhMR3BmYmJ2UzFoaFNwQzNJTGZFZGJPbUF4RkVEUWJpK2tCRS9UdUs4NGN5YkdFOHdLUGNXbHpEeUNSa2U1QzNsQVZncjZmWldCdmFYWFVLN25mREdHNmxDM2VmeEx1MkFjcVljSjA1OE9YNzNpaEk1eFZIaUJzNE9Mb3pYRlpLMkRyVUw4SlRtekFQK3ovaUtCdVdyTTA0clAzMVBHaVJ5c1c5aVQ1ZHEyU0djVGdINS9yaTluL1duc215cmJDeEVNamJLTDFGYVZVenFnTlNVekhmcTNYNTBzRDZINVRuU2VuQldYUGNiSWxSb1htL09oODVOR3ljcFdGRUt2b2hSeWtBNEJtMG1DVnBZN0kvMmlZNTczZHNoMllkN2pHeDJIYzFIYzdONkk1ekJTdHV1VmNpQ0Y1MzZWcjJXeTV3ckpVQ0srTnEyYUp2NzJ0SHhBWXV5TGZJanN3ZGQ3dEowenNGNERRZE94VU1HUWlZWXVxK0E4MnJuTjErVURmVHI2dGc0V2xzUEFkSU1HWlhOQVh6UjAxYWRyUFRRbGxnT1pzdWoyV3JFQTNmcGIvck5tbEE5dVFCVm01RDZ3UllnSzRBMVIwMitVRWJjR053ZitmZU55ZXZYYnhmMTl6bzZvRGEra3Bkajl1Mm1yYjlVSWt4YXphWnNmMHRlVzFPTDdCNWtNNWNpeVRBZ3VrMldxancyeWJNMGZ5bGlZYnJLRGFGeWFlcFlyQ1QyV3Fod1hxY0p0ZUYvZURteloxZ0JiN2dteGRuQURMSnAyVHZGZnRSWTBibnFOcjRrd3NEUHo3a2hnM2dnc3J5MFBjYU1PQlVnazdPOU1hNmF5aFlTY3pRWG5qalV0dkp6am1scjVBZ0ZabHVGZFQyM2hNVmtGQ240WkVzbUNJVGZxUm1qQ0xkTk1tSW4xem8wVEVwb3d2ZUZIbWk0dUY5UmFzSXlEVmpPczJZQUU0bnJFYTgvTEM1ZzdaWGo4M0JDbGhtc1FBWkVOMC9LZXAyNTM3UzNBQ0lzU2FDWUN0aXh2V2pPSGk1R01IRndlUFNSSzAwRndqMWt6K3FwTitmSStLdHdBQ2E0d0djL1dZbGN2RTd1NXlReXdmMWk1dVN2L2dKSnp0cHNJc3FtYXJzd29BZVMzd3VhSkxrQklnVDNOeWowdHo2QlB3OEdsSXdDYnpwenVFVG9QM1k4STk5OGpnb2JXZ094V0dNbXIrZE9jcDdaKzdOZ2FZa1pKTUt1cWM3eDdLajAwRzVOcnVzanhqWEw2UUtkRjVVa1NCUWJPQ3RsZ0xrekIvRDBoZWhSMld6SjdldCtSL0dWcVd4NnlMU21ySHhEakNwcTFRd0o1YVFNbGU3RFAyenZUSnh0WjlGa3JyZHZFeDkxM1psVzBuVEFYeFFKcVJWWHB1R2tsUXdoTHFheTVTUk1iNldKU3NlOFBKdC9rTi9vVGZ2ZlhUSHJ6TWVYZWtiSDltY2Vyc1JMUmhPZW85dDlvZU1jM3NXZ1lWOVBIR1gzbmtGOXJqOG1FTlBSMzlKNlJHeEE2bW9NUXBHUmhGWjB4dlBjYzRuWXRvVUcyYVNUVzJTTk9ONEROVWkxcE9neWd6UzgzR3NZbWNIdEQvSVJ6Uy9BRndsdSszWlJZMWRxWER6S1g3UHNQelcrdlhHNnptTnVSM0ljekVlRGFwakNqSmJNUCtLRE9PN3BVZ3ErSnJOa3NDTkxQSlpwa1lhTDN1bENwTzNNQkVHVjd5N1E4SWtzcjBmalRwK2p1NEpIN0dLZjREZzg4ZkU1Mk9MSVphMXYzNFkyaEZmbEpKM3lrWG5mNEF1N0Q5YkhMVm4yZEMwdWdzL0dpQkhMbGplV0xnaUdKanBzcnBTSUcwK04rRythMW9IUU5GOWJLV2lHdXVSM2ZQaHRoUU9vdFV4Vi9ZL3BSVWhYT2gxcnAvcUlWSUY2SnFXcTRTYmc0TkhIVWs5bXZVVjZ1Tk5oZnAzd2phbndJb3J0cFNnVlI5cTZXSzhqQ1JJUnhmdWxBZUVrb0RYZy94RUJ2c21RU1B6NGtmbFQrd3RFMDNZcEM3d2tBYVZyVnZYbDU2QW4yeVo3aVhuVnF3Ty9yZ1BnNmk5eU9yS0xac0NoK3VTbVB1OUtIdXlFY29xenFQTzNWQzMxUGpJendSZXd4UmhvUUpZR05PdUFxZ1ZHTzY4TWRwdG1yeElsRU1oMFBiY0pjRUd3eE5Wd1B5OGp2SXZ3cWxnSWcvSlRPZ1F0TnprWnlLY2ZhQlJsSiszdXhZQTA3SjBTbDlkQXRDcytWZkY5bFhVNG5EMjZsaVFKY3ZpU2FROFphSGR5Z25XNWJxellMR2dnSFhFR3hwbkpIVmJ5VnpyNHJiR0hkaGJud2tqZ2c4L0JidnFFcm1ib2REUWlaVCsyU0ZEenVlb3VuUTVzT0ppY2JqVHBIUlpjaE14OEllZ3hCTjZBdFA4b0V2aWpkVE01TDBmUW9RNDk2ZDZLTU5zRDVtOE1EUjhKZnM4RE1tTStTQjg1VndPZ3lPUFZYVzdpdmVPM0JvekMzak8wcXMwMFhxZGRpL2ZSUnlBTU9pczdOM0tBUzd2MkpOQnhJTlFncytJbS9kWE1pZ010dG1UREJiTjE5QnBjN1QwcE1DaFZmSGUzN3NzZVczeXpnbFlZeHkwdEdWcTNFZFM2eVVDdXAvV05xbVZoVS9ZcjRYbUFpbFhxbkpIcHM4ZlkwaE8vWTloeTl4dEdHN1R0WEE0cVpkK0JVQ2pPYldRK0QyVjRuUTdDaWk5bVRyblZWTHcycUpaS05ibzZDSmFrSXhwK252MVhPZWhpeXNYUnFrZGZGT0czNmxRelI5MDJlSzNVUWJlbmV5cDVKUlVCMG1vY0xxd1NpWkdMVXNvT1g3WXFxTjM5T3ZPZmRIVXdDRm1pRHRPamNIUDBNSklWR2NvLzdDMWdOU29jc1BBM1V0dFRYcjk3UVB1SzJ4TkQ2UXFyUWlUallHMlFJanc4ZHZVK2tlTW5ldU50SExwYVlxSlBIcVRhdz09",
    username : "public"
  });
};

OPrime.guessCorpusUrlBasedOnWindowOrigin = function(dbname) {
  var optionalCouchAppPath = "";
  if (OPrime.isCouchApp()) {
    var corpusURL = window.location.origin;
    if (corpusURL.indexOf("lignsync.org") >= 0) {
      corpusURL = "https://corpus.lingsync.org";
    } else if (corpusURL.indexOf("authdev.fieldlinguist.com") >= 0) {
      corpusURL = "https://ifielddevs.iriscouch.com";
    } else if (corpusURL.indexOf("prosody.linguistics.mcgill") >= 0) {
      corpusURL = "https://prosody.linguistics.mcgill.ca/corpus";
    } else if (corpusURL.indexOf("localhost") >= 0) {
      // use the window origin
    }
    optionalCouchAppPath = corpusURL + "/" + dbname + "/_design/pages/";
  }
  return optionalCouchAppPath;
};