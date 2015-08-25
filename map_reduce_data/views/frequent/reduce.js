function unique(keys, values, rereduce) {
  var uniqueHash = {},
    uniqueValues = [];

  if (rereduce) {
    // return sum(values);
    return values.map(function(row) {
      if (!row || !row.key) {
        return row;
      }
      return row.key + ":::" + row.value;
    });
  } else {
    /** 
     * return only unique values
     */
    var slowIsOkay = true;

    var findUniqueValues = function(values) {
     
      var valueIndex,
        valuesCount = values.length;

      for (valueIndex = 0; valueIndex < valuesCount; valueIndex += 1) {
        var key = values[valueIndex].key || values[valueIndex];
        var count = values[valueIndex].value || 1;
        if (!uniqueHash[key]) {
          uniqueHash[key] = count;
        } else {
          uniqueHash[key] += count;
        }
      }

      for (valueIndex in uniqueHash) {
        if (uniqueHash.hasOwnProperty(valueIndex)) {
          if (uniqueValues && uniqueValues.length && uniqueHash[valueIndex] > uniqueValues[0].value) {
            // DEBUG console.log("more count " + uniqueHash[valueIndex] + " than " + uniqueValues[0].value)
            uniqueValues.unshift({
              key: valueIndex,
              value: uniqueHash[valueIndex]
            });
          } else {
            // DEBUG console.log("less count " + uniqueHash[valueIndex] + " than " , uniqueValues);
            uniqueValues.push({
              key: valueIndex,
              value: uniqueHash[valueIndex]
            });
          }
          // DEBUG console.log("uniqueValues", uniqueValues);

          // uniqueValues.push(padCountWithZeros(uniqueHash[valueIndex]) + ":::" + valueIndex);
        }
      }
      //  // DEBUG console.log("Unique values", uniqueValues);
      // return uniqueValues.map(function(row) {
      //   return row.text + ":::" + row.count;
      // });
      
      return uniqueValues;
    };

    // Normal behavior is count of values
    if (!slowIsOkay) {
      return values.length;
    }

    // Has to reduce faster
    return findUniqueValues(values);
  }
}


try {
  exports.unique = unique;
} catch (e) {
  //  // DEBUG console.log("not in a node context")
}
