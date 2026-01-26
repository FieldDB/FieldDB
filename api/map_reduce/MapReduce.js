var debugMode = false;
/*jslint evil: true */
var MapReduceFactory = function(options) {
  options = options || {
    filename: "",
    map: null,
    reduce: null
  };
  options.rows = options.rows || [];

  var debug = function() {
    // console.log(arguments);
  };

  var sum = function(values) {
    debug("summing ", values);
    if (!values || !values.reduce) {
      debug("this isn't an array");
      return values;
    }
    if (values && typeof values[0] !== "number") {
      debug("using number of values " + values.length);
      return values.length;
    }
    return values.reduce(function(a, b) {
      debug("adding " + a + " " + b);
      return a + b;
    });
  };
  var count = function(keys, values, rereduce) {
    debug("counting" + keys);
    if (rereduce) {
      debug("suming " + values);
      return sum(values);
    } else {
      debug("count  " + values.length);
      return values.length;
    }
  };

  options.emit = options.emit || function(key, val) {
    if (debugMode) {
      debug(options);
    }
    options.rows.push({
      key: key,
      value: val
    });
  };
  options._count = options._count || count;

  options.group = options.group || function(rows) {
    if (debugMode) {
      debug(options);
    }
    options.reduce = options.reduce || options._count;
    rows = rows || options.rows;

    // Group all rows by their key
    var rowsGroupedById = {};
    rows.map(function(row) {
      var key = row.key;
      var value = row.value;
      if (typeof key !== "string") {
        key = JSON.stringify(key);
      }
      if (typeof value !== "string") {
        value = JSON.stringify(value);
      }
      if (!rowsGroupedById[key]) {
        rowsGroupedById[key] = [value];
      } else {
        rowsGroupedById[key].push(value);
      }
    });
    debug("regrouped ", rowsGroupedById);

    // Reduce all grouped items
    var rereduceMode = false;
    var reducedRows = [];
    for (var key in rowsGroupedById) {
      if (rowsGroupedById.hasOwnProperty(key)) {
        reducedRows.push({
          key: key,
          value: options.reduce(key, rowsGroupedById[key], rereduceMode)
        });
      }
    }
    debug("reduced ", reducedRows);

    // Re-reduce all grouped items
    if (Object.prototype.toString.call(reducedRows.value) === "[object Array]") {
      rereduceMode = true;
      reducedRows = reducedRows.map(function(groupedRow) {
        groupedRow.value = options.reduce(null, groupedRow.value, rereduceMode);
        return groupedRow;
      });
    }

    debug("re-reduced ", reducedRows);

    return {
      rows: reducedRows.sort(function(a, b) {
        return a.key - b.key;
      })
    };
  };

  options.customMap = function(doc, emit, rows) {
    rows = rows || options.rows || [];
    if (emit) {
      try {
        // ugly way to make sure references to 'emit' in map/reduce bind to the above emit at run time
        eval("options.map = " + options.map.toString() + ";");
        options.mustRescopeEmit = true;
        debug("customizing emit");
      } catch (e) {
        console.warn("Probably running in a Chrome app or other context where eval is not permitted. Using global emit and results for options");
      }
    }

    options.map(doc);

    if (options.mustRescopeEmit) {
      try {
        emit = options.emit;
        // ugly way to make sure references to 'emit' in map/reduce bind to the above emit at run time
        eval("options.map = " + options.map.toString() + ";");
        options.mustRescopeEmit = false;
        debug("rescoped emit");
      } catch (e) {
        console.warn("Probably running in a Chrome app or other context where eval is not permitted. Using global emit and results for options");
      }
    } else {
      debug("not rescoping emit, already using the default");
    }

    return {
      rows: rows
    };
  };

  // Acccept a file path
  if (!options.map && options.mapFilePath) {
    try {
      options.mapString = require(options.mapFilename)[options.filename];
    } catch (exception) {
      debug("Unable to load the map reduce " + options.mapFilePath, exception.stack);
    }
  }

  // Acccept a string
  if (!options.map && options.mapString) {
    try {
      /* jshint ignore:start */
      var emit = options.emit;
      /* jshint ignore:end */

      // ugly way to make sure references to 'emit' in map/reduce bind to the above emit
      /*jslint evil: true */
      eval("options.map = " + options.mapString.toString() + ";");
    } catch (exception) {
      console.log("Unable to parse the map reduce in this context, most likely eval is not permitted. (The app will function normally, you just can't run the map reduces in a custom scope.) ");
      options.map = function() {
        options.emit("error", "unable to load map reduce");
      };
    }
  }
  if (!options.reduce && options.reduceString) {
    try {
      // ugly way to make sure references to 'emit' in reduce/reduce bind to the above emit
      /*jslint evil: true */
      eval("options.reduce = " + options.reduceString.toString() + ";");
    } catch (exception) {
      console.log("Unable to parse the map reduce in this context, most likely eval is not permitted. (The app will function normally, you just can't run the map reduces in a custom scope.) ");
    }
  }
  return options;
};

exports.MapReduceFactory = MapReduceFactory;
