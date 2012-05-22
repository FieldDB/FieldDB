define( [
    "use!backbone",
    "user/User"
], function(Backbone, User) {
    var Authentication = Backbone.Model.extend(
    /** @lends Authentication.prototype */
    {
        /**
         * @class The Authentication Model handles login and logout and authentication locally or remotely. 
         * 
         * @extends Backbone.Model
         * @constructs
         */
        initialize : function() {
            this.bind('error', function(model, error) {
                console.log("Error in Authentication  : "+ error);
            });
            this.authenticatePreviousUser();
        },

        defaults : {
        	
        },
        logout : function(){
        	$("#logout").hide();
         	$("#login").show();
        	window.user = null;
        	localStorage.removeItem("user");
        },
        login : function(){
        	window.user = new User({"username": document.getElementById("username").value,"password": document.getElementById("password").value});
        	localStorage.setItem("user",JSON.stringify(user.toJSON()) );
        	$("#logout").show();
         	$("#login").hide();
        	
        },
        authenticatePreviousUser : function(){
        	window.user = new User({"username":"sapir","password":"wharf","firstname":"Ed","lastname":"Sapir"});
            if(localStorage.getItem("user")){
            	window.user = new User(JSON.parse(localStorage.getItem("user")) );
            }else{
            	localStorage.setItem("user",JSON.stringify(user.toJSON() ));
            }
            $("#logout").show();
         	$("#login").hide();
        	
        }
        


    });

    return Authentication;
});
