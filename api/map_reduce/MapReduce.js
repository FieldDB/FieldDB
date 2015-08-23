var debugMode = false;

var MapReduceFactory = function(options) {
  options = options || {
    filename: "",
    map: null,
    reduce: null
  };
  options.rows = options.rows || [];
  options.emit = options.emit || function(key, val) {
    if (debugMode) {
      console.log(options);
    }
    options.rows.push({
      key: key,
      value: val
    });
  };

  options.customMap = function(doc, emit, rows) {
    rows = rows || options.rows || [];
    if (!emit) {
      emit = options.emit;
    }

    try {
      // ugly way to make sure references to 'emit' in map/reduce bind to the
      // above emit at run time
      eval("options.map = " + options.map.toString() + ";");
    } catch (e) {
      console.warn("Probably running in a Chrome app or other context where eval is not permitted. Using global emit and results for options");
    }

    options.map(doc);

    return {
      rows: rows
    };
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
