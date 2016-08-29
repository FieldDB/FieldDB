/* globals __dirname */
var Q = require("q");
var childProcess = require("child_process");
var serverInternalPath = new RegExp(__dirname.replace(/lib$/g, "") + "[^.]*/", "g");

exports.execute = function(command) {
	var deferred,
		localProcess;

	// console.log(command);
	deferred = Q.defer();
	localProcess = childProcess.exec(command, function(error, stdout, stderr) {
		// console.log("in result childProcess");
		if (error !== null) {
			// console.log("rejecting childProcess error", error);
			// console.log(error.message)
			var message = error.message.replace(serverInternalPath, "");
			// console.log("message", message)
			deferred.reject(new Error(message));
		} else {
			// console.log("resolving childProcess stdout", stdout);
			deferred.resolve(stdout);
		}
	});

	return deferred.promise;
};
