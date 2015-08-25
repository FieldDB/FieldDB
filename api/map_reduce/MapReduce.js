var debugMode = false;
/*jslint evil: true */
var MapReduceFactory = function(options) {
  options = options || {
    filename: "",
    map: null,
    reduce: null
  };
  options.rows = options.rows || [];

  var sum = function(values) {
    console.log("summing ", values);
    if (!values || !values.reduce) {
      return values;
    }
    return values.reduce(function(a, b) {
      return a + b;
    });
  };
  var count = function(keys, values, rereduce) {
    if (rereduce) {
      return sum(values);
    } else {
      return values.length;
    }
  };

  options.emit = options.emit || function(key, val) {
    if (debugMode) {
      console.log(options);
    }
    options.rows.push({
      key: key,
      value: val
    });
  };
  options._count = options._count || count;

  options.group = options.group || function(rows) {
    if (debugMode) {
      console.log(options);
    }
    options.reduce = options.reduce || options._count;
    rows = rows || options.rows;

    // Group all rows by their key
    var rowsGroupedById = {};
    rows.map(function(row) {
      var key = row.key;
      if (typeof key !== "string") {
        key = JSON.stringify(row.key);
      }
      if (!rowsGroupedById[key]) {
        rowsGroupedById[key] = [row.value];
      } else {
        rowsGroupedById[key].push(row.value);
      }
    });
    // DEBUG console.log("regrouped ", rowsGroupedById);

    // Reduce all grouped items
    var reducedRows = [];
    for (var key in rowsGroupedById) {
      if (rowsGroupedById.hasOwnProperty(key)) {
        reducedRows.push({
          key: key,
          value: options.reduce(key, rowsGroupedById[key], true)
        });
      }
    }
    // DEBUG console.log("reduced ", reducedRows);

    // Re-reduce all grouped items
    reducedRows = reducedRows.map(function(groupedRow) {
      groupedRow.value = options.reduce(null, groupedRow.value, false);
      return groupedRow;
    });
    // DEBUG console.log("re-reduced ", reducedRows);

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
        console.log("customizing emit");
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
        console.log("rescoped emit");
      } catch (e) {
        console.warn("Probably running in a Chrome app or other context where eval is not permitted. Using global emit and results for options");
      }
    } else {
      console.log("not rescoping emit, already using the default");
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
      console.log("Unable to load the map reduce " + options.mapFilePath, exception.stack);
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
      console.log("Unable to parse the map reduce ", exception.stack);
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
      console.log("Unable to parse the map reduce ", exception.stack);
    }
  }
  return options;
};

exports.MapReduceFactory = MapReduceFactory;
