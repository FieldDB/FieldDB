define([ 
         "backbone",
         "handlebars", 
         "permission/Permission",
         "user/UserMask"
  ], function(
      Backbone, 
      Handlebars,
      Permission,
      UserMask
) {
  var PermissionEditView = Backbone.View.extend(
  /** @lends PermissionEditView.prototype */
  {
    /**
     * @class This is the view of the Permission Model. The Permission is a
     *        textarea that includes a username and a timestamp.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("PERMISSION EDIT VIEW init");
    },
    
    /**
     * The underlying model of the PermissionEditView is a Permission.
     */
    model : Permission,
    
    /**
     * Events that the PermissionEditView is listening to and their handlers.
     */
    events : {
      /*
       * TODO test this
       */
      "click .add-user-to-permission-role" : function(e){
        if(e){
          e.preventDefault();
        }
        var user = {};
        var usernameToAdd = $(this.el).find(".choose-add-permission-username").val() || "";
        if(usernameToAdd.trim().length < 1){
          return;
        }
        user.username = usernameToAdd;
        for(u in this.model.get("potentialusers")){
          if(usernameToAdd.indexOf(this.model.get("potentialusers")[u].username) > -1){
            var gravatar = this.model.get("potentialusers")[u].gravatar;
            if(gravatar){
              user.gravatar = gravatar;
            }
//            var g = this.model.get("users");
//            g.add(user);
//            this.model.set("users", g);
            var userAsMask = new UserMask(user);
            userAsMask.set("status","user-permission-pending");
            this.model.get("users").add(userAsMask);
            $(this.el).find(".choose-add-permission-username").val("");
            var permisionviewself = this;
            window.app.get("authentication").addCorpusRoleToUser(
                this.model.get("role"), user, 
                /*success */function(returneduser) {
                  //do nothing?
                  userAsMask.set("status","user-permission-confirmed");
                  permisionviewself.render();

                  window.app.addActivity(
                      {
                        verb : "added",
                        verbicon: "icon-plus",
                        directobjecticon : "",
                        directobject : "<img class='gravatar-small' src='https://secure.gravatar.com/avatar/"+userAsMask.get("gravatar")+"?d=identicon'/> "+user.username,
                        indirectobject : "as a <i class='icon-group'></i> "+permisionviewself.model.get("role")+" on <i class='icon-cloud'></i><a href='#corpus/"+window.app.get("corpus").id+"'>this corpus</a>",
                        teamOrPersonal : "team",
                        context : " via Offline App."
                      });
                  
                  window.app.addActivity(
                      {
                        verb : "added",
                        verbicon: "icon-plus",
                        directobjecticon : "icon-group",
                        directobject : "<img class='gravatar-small' src='https://secure.gravatar.com/avatar/"+userAsMask.get("gravatar")+"?d=identicon'/> "+user.username,
                        indirectobject : "as a <i class='icon-group'></i> "+permisionviewself.model.get("role")+" on <i class='icon-cloud'></i><a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                        teamOrPersonal : "personal",
                        context : " via Offline App."
                      });
                }, 
                /* failure */ function(errors){
                  window.appView.toastUser("Error adding user <strong>"
                      +user.username+"</strong> to corpus permissions. "
                      +errors 
                      , "alert-warning","Permissions:");
                  permisionviewself.model.get("users").remove(user);
                  permisionviewself.render();
                });
            this.render();
            return;
          }
        }
      }
    },

    /**
     * The Handlebars template rendered as the PermissionEditView.
     */
    template : Handlebars.templates.permissions_edit_embedded,
    
    /**
     * Renders the DatumFieldView.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("PERMISSION EDIT VIEW render");
      var jsonToRender = this.model.toJSON();
      jsonToRender.users = this.model.get("users").toJSON();
      $(this.el).html(this.template(jsonToRender));
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updatePermission : function() {
      //TODO
    }
  });

  return PermissionEditView;
});