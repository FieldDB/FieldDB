//Set the RequireJS configuration

require.config({
	baseUrl : "",

	paths : {
		"Player" : "libs/jasmine/src/Player"
	},
	shim : {
		"Player" : {
			exports : "Player"
		}
	}

});

//Run the tests!
require([ "Player"

], function(Player) {
	player = new Player();

});
