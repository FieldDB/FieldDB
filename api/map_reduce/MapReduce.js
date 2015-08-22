var MapReduceFactory = function(options) {
  options = options || {
    filename: "",
    map: null,
    reduce: null
  };
  options.rows = options.rows || [];
  options.emit = options.emit || function(key, val) {
    this.rows.push({
      key: key,
      value: val
    });
  };

  // Acccept a file path
  if (!options.map && options.mapFilePath) {
    try {
      options.mapString = require(options.mapFilename)[options.filename];
    } catch (exception) {
      console.log("Unable to load the map reduce " + options.mapFilePath, exception.stack);
    }
  }

  // Acccept a string
  if (!options.map && options.mapString) {
    try {
      var emit = options.emit;
      // ugly way to make sure references to 'emit' in map/reduce bind to the above emit
      /*jslint evil: true */
      eval("options.map = " + options.mapString.toString() + ";");
    } catch (exception) {
      console.log("Unable to parse the map reduce ", exception.stack);
      var emit = options.emit;
      options.map = function() {
        emit("error", "unable to load map reduce");
      };
    }
  }
  return options;
};

exports.MapReduceFactory = MapReduceFactory;
