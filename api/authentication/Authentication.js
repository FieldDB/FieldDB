define([
    "backbone",
    "confidentiality_encryption/Confidential",
    "user/User",
    "user/UserMask",
    "OPrime"
], function(
    Backbone,
    Confidential,
    User,
    UserMask
) {
  var Authentication = Backbone.Model.extend(
  /** @lends Authentication.prototype */
  {
    /**
     * @class The Authentication Model handles login and logout and
     *        authentication locally or remotely. *
     *
     * @property {User} user The user is a User object (User, Bot or Consultant)
     *           which is logged in and viewing the app with that user's
     *           perspective. To check whether some data is
     *           public/viewable/editable the app.user should be used to verify
     *           the permissions. If no user is logged in a special user
     *           "public" is logged in and used to calculate permissions.
     * @property {Boolean} staleAuthentication TODO Describe staleAuthentication.
     * @property {String} state The current state of the Authentication is either
     *           "renderLoggedIn" (if the user is not the public user) or "renderLoggedOut" (if the user is the public user).
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("AUTHENTICATION INIT");
      this.bind("error", function(model, error) {
        if (OPrime.debugMode) OPrime.debug("Error in Authentication  : " + error);
      });

      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      if(!this.get("confidential")){
        this.set("confidential", new Confidential({filledWithDefaults : true}));
        this.get("confidential").decryptedMode = true;
        if(OPrime.getCookie("token")){
          this.get("confidential").set("secretkey", OPrime.getCookie("token")); //TODO store the token somewhere safer
        }else{
          //do nothing, wait until you use the token
//          this.logout();
//          return;
        }
      }
    },
    defaults : {
      username : localStorage.getItem("username"),
      state : "loggedOut"
    },

    // Internal models: used by the parse function
    internalModels : {
      userPrivate : User,
      userPublic : UserMask,
      confidential :  Confidential
    },

    staleAuthentication: true,

    /**
     * Contacts local or remote server to verify the username and password
     * provided in the user object. Upon success, calls the callback with the
     * user.
     *
     * @param user A user object to verify against the authentication database
     * @param callback A callback to call upon sucess.
     */
    authenticate : function(user, successcallback, failcallback) {
      var dataToPost = {};
      dataToPost.username = user.get("username");
      dataToPost.password = user.get("password");
      /* if the user is currently in a chrome app, save which chrome app they used last into their user, so that we can redirect them to it if we ever need to redirect them from the website. */
      if(OPrime.isChromeApp()){
        this.get("userPrivate").set("preferredChromeExtension", window.location.origin);
      }
      if(this.get("userPrivate") != undefined){
        //if the same user is re-authenticating, include their details to sync to the server.
        if(user.get("username") == this.get("userPrivate").get("username") && user.get("username") != "public"){
          dataToPost.syncDetails = "true";
          dataToPost.syncUserDetails = JSON.parse(JSON.stringify(this.get("userPrivate").toJSON()));
          delete dataToPost.syncUserDetails._rev;
        }
        //TODO what if they log out, when they have change to their private data that hasnt been pushed to the server, the server will overwrite their details. should we automatically check here, or should we make htem a button when they are authetnticated to test if they ahve lost their prefs etc?
      }
      var self= this;
      var authUrl = user.get("authUrl");
      OPrime.makeCORSRequest({
        type : "POST",
        url : authUrl + "/login",
        data : dataToPost,
        success : function(serverResults) {
          var userFriendlyErrors = serverResults.userFriendlyErrors || "";
          if (userFriendlyErrors) {
            window.appView.toastUser(userFriendlyErrors.join("<br/>") + " " + OPrime.contactUs, "alert-danger","Login errors:");
            if (typeof failcallback == "function") {
              failcallback(userFriendlyErrors.join("<br/>"));
            }
            if (typeof successcallback == "function") {
              successcallback(null, userFriendlyErrors); // tell caller that the user failed to
              // authenticate
            }
          } else if (serverResults.user != null) {

            this.staleAuthentication = false;

            if(OPrime.isTouchDBApp()){
              /* if on android, turn on replication. */
              var db = dataToPost.username + "-firstcorpus";
              var dbServer = serverResults.user.corpuses[0].domain;
              if(serverResults.user.mostRecentIds && serverResults.user.mostRecentIds.couchConnection && serverResults.user.mostRecentIds.couchConnection.pouchname ){
                db = serverResults.user.mostRecentIds.couchConnection.pouchname;
                dbServer = serverResults.user.mostRecentIds.couchConnection.domain;
              }
              Android.setCredentialsAndReplicate(db, username, password, dbServer);
            }

            self.saveServerResponseToUser(serverResults, successcallback);
          }
        },//end successful login
        error: function(e){
          if (OPrime.debugMode) OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying).", e);
          if(window.appView){
            window.appView.toastUser("There was an error in contacting the authentication server to confirm your identity. " + OPrime.contactUs, "alert-danger","Connection errors:");
          }

          if (typeof failcallback == "function") {
            failcallback("There was an error in contacting the authentication server to confirm your identity. Maybe you're offline?");
          }
        },
        dataType : ""
      });
    },

    logout : function(){
      localStorage.removeItem("username");
      localStorage.removeItem("mostRecentDashboard");
      localStorage.removeItem("mostRecentCouchConnection");
      localStorage.removeItem("encryptedUser","confidential:VTJGc2RHVmtYMStBTDBmMVN3NVVxRldWdWVXcXBBODJuMmxicThPN0hUSmlRYkFCclRwSXFxYVNtV2o5WFdnYkhOR2JlTVEyRjZoSnRobG4rczArdWVmbXl1K1JMaDZCY1NpVGZGTTRubm02azhGZVlhQWxwMkZGZzFVeEhONVZ2UDFicHkwU1l1azVEc0VNOHRpWEZhL0wwdThiNmd2OVhyNUVMU1UxdERPZmpLc0MxR29CUjBxejQ1QTU1c0s0QmdoempIS052YlJlYTRWVVNiTC9SeGNXeFU4eGN6NUp1Z3FQVjlJOTBPeS83ckNBNlZCdVdGYWhYU0ZzYXJhMm14NVN1dE82Yjk1enpaaitTci9CV0pKZWNXbklTNkRyRVlmYmczcGRXemVlcFMwUGRKY0NMRmhGNHp3aEpTNjBxRHU5Si9KUzNTR2dadEJaYWkyd0p2NExpdG9kOXB4YkNIYXQvR21hMTg3QnZFbkhqZmZMazQvZURySkwvTGxkRUUwTGZsdzg2VWduNnZpS3ZFOElWT1RPaXZIbFUzTEdqOFJWYTZrd2dPM3J2ci9EY2dKb24vUkxwUXBrVkZVdUlEektLeXN0WG0rSFQvSEtoZFVQQVdNdTNEWXdUcDI3SUM1NVMyNW5tQ3ZaM1FTeUxiOFk2SWQ5Q0x2dFk4d0ZQRTZVRjdqNnpEem1IRHN2QVBjU0xuQ2k3RGJPWG9BUTFqeFRpald0WW1pSkJ6WXIwNHFFb0xIMk5pN2hjaThiemFCN0Vva0t1b0Vpbm9wbGxGazBseTlkNUtEWE1ma1JncFFYWGNEaUxrQmR3YnhneThaSjlRT0Fqc0kzQXRPQndRUUJMNkVmbTZRUWg5OGFDZWRMVmxFWXQwV2VKSmhCSEJqMDlqcE9qcnkzNUVPMktTU2EwK0lTU0drN1pYd1RWci9vbGlBZHZ4TzNaWGFsWjZMMTNaUWJreU5PWVlXVlU5akJOeTNlYmFaY0NiUTdSL2tNNjFzMVZ2VjJBQmF0NFNKeXJKZkIrbTFSSC9lOE1zU3ppWng0aVZGMzhzOWZWQVV5ZFpUZUpabVM4NVEzNWlDWHpKbkVmcFJLOHFEWGdueFdxTHZtemxkZERXOVNoLzBkdjlneFNKZ05IY08xbU1aUFp0RzErMEVuNUtqbDlLZFovZGhPTGtibmVTdktTRXFZcDhvZnRNbFIzdVlxMXFoQVQ2bjNPQ3FoRmQ4Q3R4YUxTajhNaHBMeFVseEdCNjZvNkNUN2JOMk1ZbGZNV0RycG9Tak9XMUVZZGovN0lrREdVdEZsVDF4SWtIcmVYNlJsNWRQSzVLdTQrbUdGSHI4RkNDZGVINlF1M1FyTGNKR3dJY0tSTW9xYStaRndYU2gvTW1RQ1oyc3VTdVVzSkJIcmg3TFRzei9uY2pGZXZJSmdqb3hZczY3bkxMZmM4QkVrc3R5ZnNkYlJWZlRkeG9ZVitaTC9DeDFFdXlPU1pKSjZBTG9iVytlaEhxMVNFSVRHUEFhMk5RdEN6NlNrYlR6QmJtSCt5bjkzMGlwSDRUSUF1M0l3ME0xRVhrUDVCWVU5bjF0VWxXaUxBdllUVUV6OHBVenpiTUpmOGNtVTB1NWlCOFFZb1hmTW5UL2wwbk1JUm1KT1A1S3BOME9RSEZORWNmb0hmY3dScEl6ZlNVeEUvcXFTV1N3cHhqRXh5aHVEZWllcXBhNlVBbGM3RitTS1pHc21VeTRmUFA5UjMxNy92UEhHakgrWStnMEVIUmN3NUdiY1lRT3ZTMkNSdzl6bXNZL2NQUlFEbzQ4Q2hHL2VzTEhTTzJ1aTkzcURSNHI0aEw4OXRCYXE2REJiaWJSZ1dvWUs0aFdpVG50TGtZd1Z1MGExQkVDZkpsMEZWR0xpemJIalMvek5VSDdtVWh1QWhjZzc3OU0yZGNrTWhaTmZsMC9STWRqcE9aYUpESlMwbkdhTjRNZFZuY3BDZ202TWQ3c0xVcDhWUWlucGEvWGlxbXpVMG9qekpYczRxVTJ5Z0R1a1IrdnZBenAvaDhFeTUzM0NpY2paamdIS0s4a0IrU0NZQ1BaSENOSWhoMVhFVE9Od2tUbzIrVitGL0JtRGVLQWd6TWJta08xKzJ5eG9tYTJqL2E1YWgreUx1VXFNMTlJVWVINUg2cjZmL0QwZmN5RUsrRGZ0NzRhUGFUU01FYitxRFBEc1NDNVZCZ0JoRTJSa2loM3dHQVUwVTEyNU83NTVaekpMOUM3eFRyOUt5SWxjT1VrMzREamwvNkRzWmw5NzZLc1ZOV0tlaHpJSVVNVzBSSVgxTjJ4aXRoTVJVVkpodlU3OUlzT2UvWWlMZER5OFFRcHRpc214dS95ZGRlQyt2Z1BFMFdWb2xKVmprbU1HT0RMNC9YbEZkZFpncG9tMWowRkpqZnRPUHpJbElvSkwvYUVHR0puK3E2em1SZGlwcjk3Tkp3RkxUNmFUN3V4UjdMWmk2cVZxQjFmZkN3VTJVRWVVQWFJZUovQTlYZjgzTnptK1Yxb1BTSDZFSXVXZzFzVm42UEtyL3JlM2Vscks5YitpU08yeWdOTkxsb2plK0EvMlRmc0J3dmFxMThuaTFKeTh6RXVlL2E1a1krOStnSkdOQThsR3BLRUVXbEF1UFFlWDVobUR3MXNsMTJXMUtmYWc1UFRNOGFyQy9LL0FjVzltQUlFTXFpWVl6WmZJM25jUzI0MFByQ1BFRDFFQW9IMDdjbUZQQ1VycW5MRmxKZjl6blJIUmU2NmpHVjQ0SGNOcnZhSGZxMVRRQytaY056ckFxblN1ZC9wWVNDNHhLeGVoeWF4M2xDdzNsbzR0LzhlNHZVZWxwVFpjcUtOaDdXL0p0YlpwNkJrV2JmQldjc21ETEozcC9qM3ZDaG1rcXV0eWxxd0VCS3U1YnluamlrRDlFZEd3SDVwbURRQmsrQ0xoLzhXY0NveE9sT3dMV2EvTUY0VVdnQTlmOHdCUjV1T2VVMUcrUzFjSzBqKzRDbTltc2ZzbnNrZGlCQUVqdjIxbTQ5YituUEZVRkkyYURqUHdFL0Y4RmtTbFRJc1ZuK2hQVmVlMVFPVzFxU0tzZDdHUU1pNWtzSU5nNEp2ZnloMjVZaEwzdmR5VkpJTjhWdXRmQWV4aUhEZUMvbW5qcjh6Z3hkMS9Tb3FCZTluTWJTUUxCQXVlM0hZbXBSNWdBWllFcUdENmRIK0dtUURzQzJCSjVwakZEd1V0MG05ZU5KR0VTdERLZmxZUDJrTE1ReEc5a2FmVmt1SUk4bEMvZVhZNEpYWnR3Q0o4L1hKUVJ6SStQOXJHclpDYWU4Qk9qbDdwcVhkazBISnhVUUFtRkhFc0w1S0NNdWpiT0JEL1FKK25QMldYNXJib2YydWY3MUNNZ2ZaT3FFalFkSmZZblNveDlWQnFJTXFsOVh4R0lHL0RqcEttYXpmV2hneFMwb09DakRPTldKZnRYTk5FUDN5MWJaY0dhdnl0OFVnaklBa3pLRVJjNGhkaUY2ZktoRjhyN1Nhc2JyS3J6OWxHU25FWEhMTEUvcnFyVkIvS2JQLzRTRVRyR0RuZXJUZkJXeVVmd25PTzJjaFNLNmkrQmxReDgrcm5naVdlUFBzZ2ZPQlpHUDFFMWZGSjlZb3JVbnl5YnM4WHBZZDhhaXhLWTRCZndiQ2l5Mk55MXpwSDNDNE1HL0dsZWlIYi81TW9vSERkeVlTa0g4YmxHSm0zeC9mNi9VcEVJQ05LZGRVaEtkenR5Uy9YRG9jT2pUVlNnMGFadm5rMFoybU5VOSswTHVDWENNTkRyZzUvUjZWdlV6U2VhRWtPMjRQVnZiRHFIRXRTUVV0dUNqdDZDMlVaV3NkYnIySTNaVW16Y1cxeTFDQWUzS2lMT2xTU1c1dE9sc2ZLZ3FDMGxnN2VXZmZWeGdvMHlZMU5GbFhSQ3pWazVNT2tIYldSVzUrSDZxUWFaMERvWXVySHZlaVZETGNvNTl2Y3JJbFlvcDlQV0wyaE1ENEhiWGdaTzhMYzU5aUEvTzR0aUZMQm5sUXN0MjNLOWM3cUJHUG5hNVdjcU5zMTJWcHI4bXhrUDRJSzNXL1AwZEtVM2VpSnFTbG9DUUZTS0JFR3JTUGdnVm9QOEdSRVU1cXJlcnVkZzZFbTZYTlgzN1pnYWZoa2J2WWd2TmFtbDdScEpBQ3V6aDc4Q25sZGVya0pQWHJoRXFZbG9LOStpZUF5N05uemMwaU5oSVNZdGhuU2g2WDNXUllXS3BEaWdvbzRtME5zYUgraE51MExBWmZ2QjZNcVpTY2RxMkx0YnozdkdrbHZMSW9wcjlCTzRDNXRkZHFPWUg4VXFub28xdFBMSUNIb3djUG1ydHU3K1ZzL2wwK05NV0hxVWlJL3B2UUV6TVJjMStud3E2cUlZY3lVajc3NFU3VitNMVY1VzFuempYTnlZc0hOVmErRTZGMVJhazd5MkVvYmJhak5POGxVaFBqaEZ4UlhKcWVwd0NHTDM5dkJOUlRnNDl5NldXOWRjNkV5L29vNkdJRk9WWlpLUWdud1R1dktlZ2UyaWpnPQ==");
      /* keep the user's help count*/
//      localStorage.removeItem("helpShownCount");
//      localStorage.removeItem("helpShownTimestamp");

      //Destropy cookies, and load the public user
      OPrime.setCookie("username", undefined, -365);
      OPrime.setCookie("token", undefined, -365);

      this.loadPublicUser();
    },
    /**
     * This function parses the server response and injects it into the authentication's user public and user private
     *
     */
    saveServerResponseToUser : function(serverResults, callbacksave){
      if (OPrime.debugMode) OPrime.debug("saveServerResponseToUser");

      var renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedIn";
      if(serverResults.user.username == "public"){
        renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedOut";
      }
      this.set("state", renderLoggedInStateDependingOnPublicUserOrNot);

      // Over write the public copy with any (new) username/gravatar
      // info
      if (serverResults.user.publicSelf == null) {
        // if the user hasnt already specified their public self, then
        // put in a username and gravatar,however they can add more
        // details like their affiliation, name, research interests
        // etc.
        serverResults.user.publicSelf = {};
        serverResults.user.publicSelf.username = serverResults.user.username;
        serverResults.user.publicSelf.gravatar = serverResults.user.gravatar;
        serverResults.user.publicSelf.authUrl = serverResults.user.authUrl;
        serverResults.user.publicSelf.id = serverResults.user._id; //this will end up as an attribute
        serverResults.user.publicSelf._id = serverResults.user._id; //this will end up as an attribute
//        serverResults.user.publicSelf.pouchname = serverResults.user.corpuses[0].pouchname;
      }


      if (this.get("userPrivate") == undefined) {
        this.set("userPrivate", new User({filledWithDefaults: true}));
      }
      var u = this.get("userPrivate");
      u.id = serverResults.user._id; //set the backbone id to be the same as the auth id
      //set the user AFTER setting his/her publicself if it wasn't there already
      /*
       * Handle if the user got access to new corpora
       */
      if(serverResults.user.newCorpusConnections){
        if(window.appView){
          window.appView.toastUser("You have have been added to a new corpus team by someone! Click on <a data-toggle="modal" href="#user-modal"> here </a> to see the list of corpora to which you have access.","alert-success","Added to corpus!");
        }
        for(var x in serverResults.user.newCorpusConnections){
          if(_.pluck(serverResults.user.corpuses,"pouchname").indexOf(serverResults.user.newCorpusConnections[x].pouchname) == -1){
            serverResults.user.corpuses.push(serverResults.user.newCorpusConnections[x]);
          }
        }
        delete serverResults.user.newCorpusConnections;
      }

      u.set(u.parse(serverResults.user)); //might take internal elements that are supposed to be a backbone model, and override them

      this.set("userPublic", this.get("userPrivate").get("publicSelf"));
      this.get("userPublic")._id = serverResults.user._id;
      this.get("userPublic").id = serverResults.user.id;
      this.get("userPublic").set("_id", serverResults.user._id);

      if(window.appView){
        window.appView.associateCurrentUsersInternalModelsWithTheirViews();
      }

      /* Set up the pouch with the user's most recent couchConnection if it has not already been set up */
      window.app.changePouch(serverResults.user.mostRecentIds.couchConnection);

      this.get("userPublic").saveAndInterConnectInApp();

      OPrime.setCookie("username", serverResults.user.username, 365);
      OPrime.setCookie("token", serverResults.user.hash, 365);
      this.get("confidential").set("secretkey", serverResults.user.hash);
      this.saveAndEncryptUserToLocalStorage();
      if (typeof callbacksave == "function") {
        callbacksave("true"); //tell caller that the user succeeded to authenticate
      }
//    if(window.appView){
//        if(! this.get("userPublic").id){
//          this.get("userPublic").saveAndInterConnectInApp();
//        }else{
//          window.appView.addBackboneDoc(this.get("userPublic").id);
//          window.appView.addPouchDoc(this.get("userPublic").id);
//        }
//      }
    },
    loadEncryptedUser : function(encryptedUserString, callbackload){
      if (OPrime.debugMode) OPrime.debug("loadEncryptedUser");


      /*
       * If the encryptedUserString is not set, this triggers a
       * logout which triggers a login of the public user
       */
      if (!encryptedUserString) {
        this.logout();
        return;
      }
      /*
       * If there is currently no token to decrypt this user, log them out.
       */
      if(!OPrime.getCookie("token")){
        this.logout();
        return;
      }
      var userString = this.get("confidential").decrypt(encryptedUserString);

      /* Switch user to the new dev servers if they have the old ones */
      userString = userString.replace(/authdev.fieldlinguist.com:3183/g,"authdev.lingsync.org");
      userString = userString.replace(/ifielddevs.iriscouch.com/g,"corpusdev.lingsync.org");


      /*
       * For debugging cors #838: Switch to use the corsproxy
       * corpus service instead of couchdb directly
       */
//      userString = userString.replace(/https/g,"http").replace(/6984/g,"3186");


      var u = JSON.parse(userString);
      var data = {};
      data.user = u;

      /* Upgrade chrome app user's to v1.38+ */
      if(OPrime.isChromeApp() && !localStorage.getItem(data.user.username+"lastUpdatedAtVersion") && data.user.username != "public" && data.user.username != "lingllama"){
        var week = data.user.appVersionWhenCreated.split(".")[1];
        console.log("The week this user was created: "+week);
        if(week <= 38){
          localStorage.setItem("username_to_update",data.user.username);
          alert("Hi! Your account was created before version 1.38, taking you to the backup page to ensure that any offline data you have currently is upgraded to v1.38 and up.");
          window.location.replace("backup_pouches.html");
          return;
        }
      }

      this.saveServerResponseToUser(data, callbackload);
    },

    loadPublicUser : function(callbackload){
      var mostRecentPublicUser = localStorage.getItem("mostRecentPublicUser") || OPrime.publicUserStaleDetails();
      mostRecentPublicUser = JSON.parse(mostRecentPublicUser);
      for(var x in mostRecentPublicUser){
        localStorage.setItem(x, mostRecentPublicUser[x]);
      }
      window.location.replace("index.html");
    },

    savePublicUserForOfflineUse: function(){
      var mostRecentPublicUser =  {
        token : "",
        encryptedUser : "",
        username : ""
      };
      for(var x in mostRecentPublicUser){
        mostRecentPublicUser[x] = localStorage.getItem(x);
      }
      localStorage.setItem("mostRecentPublicUser", JSON.stringify(mostRecentPublicUser));
    },

    saveAndEncryptUserToLocalStorage : function(callbacksaved){
      if (OPrime.debugMode) OPrime.debug("saveAndEncryptUserToLocalStorage");

      /* TODO Switch user to the new dev servers if they have the old ones */
//      userString = userString.replace(/authdev.fieldlinguist.com:3183/g,"authdev.lingsync.org");
//      userString = userString.replace(/ifielddevs.iriscouch.com/g,"corpusdev.lingsync.org");


      var u = this.get("confidential").encrypt(JSON.stringify(this.get("userPrivate").toJSON()));
      localStorage.setItem("encryptedUser", u);
      if(window.appView){
        window.appView.addSavedDoc(this.get("userPrivate").id);
//        window.appView.toastUser("Successfully saved user details.","alert-success","Saved!");
      }
      //Dont save the user public so often.
//      this.get("userPublic").saveAndInterConnectInApp(callbacksaved);
      if(typeof callbacksaved == "function"){
        callbacksaved();
      }

    },
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      this.saveAndEncryptUserToLocalStorage(successcallback);
    },
    /**
     * This function uses the quick authentication view to get the user's
     * password and authenticate them. The authenticate process brings down the
     * user from the server, and also gets their sesson token from couchdb
     * before calling the callback.
     *
     * If there is no quick authentication view it takes them either to the user
     * page (in the ChromeApp) or the public user page (in a couchapp) where
     * they dont have to have a corpus token to see the data, and log in
     *
     * @param callback
     *          a success callback which is called once the user has been backed
     *          up to the server, and their couchdb session token is ready to be
     *          used to contact the database.
     * @param corpusPouchName
     *          an optional corpus pouch name to redirect the user to if they
     *          end up geting kicked out of the corpus page
     */
    syncUserWithServer : function(callback, corpusPouchName){
      if(!corpusPouchName){
        corpusPouchName = "";
      }
      if(!window.appView){
        if(OPrime.isChromeApp()){
          /* take them to the user page, they can log in there */
          window.location.replace("user.html#login/"+corpusPouchName);
        }else{
          /* take them to the public user page, they can log in there */
          if(OPrime.isCouchApp()){
            var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin("public-firstcorpus");
            window.location.replace(optionalCouchAppPath+"user.html#login/"+corpusPouchName);
          }
        }
        return;
      }
      window.appView.authView.showQuickAuthenticateView(null, null, function(){
        //This happens after the user has been authenticated.
        if(typeof callback == "function"){
          callback();
        }
      });
    },
    fetchListOfUsersGroupedByPermissions : function(successcallback, failcallback){
      var dataToPost = {};
      var authUrl = "";
      if(this.get("userPrivate") != undefined){
        //Send username to limit the requests so only valid users can get a user list
        dataToPost.username = this.get("userPrivate").get("username");
        dataToPost.couchConnection = window.app.get("corpus").get("couchConnection");
        if(!dataToPost.couchConnection.path){
          dataToPost.couchConnection.path ="";
          window.app.get("corpus").get("couchConnection").path = "";
        }
        authUrl = this.get("userPrivate").get("authUrl");
      }else{
        return;
      }
      var self= this;
      OPrime.makeCORSRequest({
        type : "POST",
        url : authUrl + "/corpusteam",
        data : dataToPost,
        success : function(serverResults) {
          var userFriendlyErrors = serverResults.userFriendlyErrors || "";
          if (userFriendlyErrors) {
            window.appView.toastUser(userFriendlyErrors.join("<br/>")
                  , "alert-warning","Error connecting to populate corpus permissions:");
            if (typeof failcallback == "function") {
              failcallback(userFriendlyErrors.join("<br/>"));
            }
          } else if (serverResults.users != null) {
            if (typeof successcallback == "function") {
              serverResults.users.timestamp = Date.now();
              localStorage.setItem(dataToPost.pouchname+"Permissions", JSON.stringify(serverResults.users));
              successcallback(serverResults.users);
            }
          }
        },//end successful fetch
        error: function(e){
          if (OPrime.debugMode) OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying) (or server might have crashed before replying).", e);

          if (typeof failcallback == "function") {
            failcallback("There was an error in contacting the authentication server to get the list of users on your corpus team. Maybe you're offline?");
          }
        },
        dataType  : ""
      });
    },
    addCorpusRoleToUser : function(role, userToAddToCorpus, successcallback, failcallback){
      var self = this;
      $("#quick-authenticate-modal").modal("show");
      if( this.get("userPrivate").get("username") == "lingllama" ){
        $("#quick-authenticate-password").val("phoneme");
      }
      window.hub.subscribe("quickAuthenticationClose",function(){

        //prepare data and send it
        var dataToPost = {};
        var authUrl = "";
        if(this.get("userPrivate") != undefined){
          //Send username to limit the requests so only valid users can get a user list
          dataToPost.username = this.get("userPrivate").get("username");
          dataToPost.password = $("#quick-authenticate-password").val();
          dataToPost.couchConnection = window.app.get("corpus").get("couchConnection");
          if(!dataToPost.couchConnection.path){
            dataToPost.couchConnection.path ="";
            window.app.get("corpus").get("couchConnection").path = "";
          }
          dataToPost.roles = [role];
          dataToPost.userToAddToRole = userToAddToCorpus.username;

          authUrl = this.get("userPrivate").get("authUrl");
        }else{
          return;
        }
        OPrime.makeCORSRequest({
          type : "POST",
          url : authUrl + "/addroletouser",
          data : dataToPost,
          success : function(serverResults) {
            if (serverResults.userFriendlyErrors != null) {
              if (OPrime.debugMode) OPrime.debug("User "+userToAddToCorpus.username+" not added to the corpus as "+role);
              if (typeof failcallback == "function") {
                failcallback(serverResults.userFriendlyErrors.join("<br/>"));
              }
            } else if (serverResults.roleadded != null) {
              if (OPrime.debugMode) OPrime.debug("User "+userToAddToCorpus.username+" added to the corpus as "+role);
              if (typeof successcallback == "function") {
                successcallback(userToAddToCorpus);
              }
            }
          },//end successful fetch
          error: function(e){
            if (OPrime.debugMode) OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying).", e);

            if (typeof failcallback == "function") {
              failcallback("There was an error in contacting the authentication server to add "+userToAddToCorpus.username+" on your corpus team. Maybe you're offline?");
            }
          },
          dataType : ""
        });
        //end send call

        //Close the modal
        $("#quick-authenticate-modal").modal("hide");
        $("#quick-authenticate-password").val("");
        window.hub.unsubscribe("quickAuthenticationClose", null, this);
      }, self);
    }

  });

  return Authentication;
});
