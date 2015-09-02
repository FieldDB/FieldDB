function count(keys, values, rereduce) {
  if (rereduce) {
    return sum(values);
  } else {
    /** 
     * return only unique values
     */
    var slowIsOkay = true;
    var findUniqueValues = function() {
      var uniqueHash = {},
        valueIndex,
        valuesCount = values.length,
        uniqueValues = [];

      for (valueIndex = 0; valueIndex < valuesCount; valueIndex += 1) {
        uniqueHash[values[valueIndex]] = values[valueIndex];
      }

      for (valueIndex in uniqueHash) {
        if (uniqueHash.hasOwnProperty(valueIndex)) {
          uniqueValues.push(uniqueHash[valueIndex]);
        }
      }
      return uniqueValues;
    }

    // Normal behavior is count of values
    if (!slowIsOkay) {
      return values.length;
    }

    // Has to reduce faster
    return findUniqueValues(values).length;
  }
}

try {
  exports.count = count;
} catch (e) {
  //  // DEBUG console.log("not in a node context")
}
