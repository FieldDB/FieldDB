var express = require('express');
var fs = require('fs');
var _ = require('underscore');
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;

var app = express.createServer(express.logger());

app.get('/',function(req,res){ 
 	res.redirect('/dashboard/dashboard.html');
});

app.use(express.static(__dirname + '/public'));

passport.use(new LocalStrategy(
		  function(username, password, done) {
		    User.findOne({ username: username }, function (err, user) {
		      if (err) { return done(err); }
		      if (!user) {
		        return done(null, false, { message: 'Unknown user' });
		      }
		      if (!user.validPassword(password)) {
		        return done(null, false, { message: 'Invalid password' });
		      }
		      return done(null, user);
		    });
		  }
		));

var port = process.env.PORT || 3001;
app.listen(port, function() {
  console.log("Listening on " + port);
});

