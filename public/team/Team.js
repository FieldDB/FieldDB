   var Team = Backbone.Collection.extend({
        model: User
    });
    
    var t1 = new User({ teamid: "123", teamname: "OMC" });
    var t2 = new User({ teamid: "456", teamname: "ABC" });
    var t3 = new User({ teamid: "789", teamname: "DEF" });
    
   var myTeam = new Team([ t1 , t2, t3]);
    console.log( myTeam.models );
    





// var Teammate = User.extend({
//	initialize: function(attributes) {
//		Teammate.__super__.initialize.call(this, attributes);
//		 this.set("teamid" , ""),
//		 this.set("teamname" , "");
//	   }
//    });
    

    