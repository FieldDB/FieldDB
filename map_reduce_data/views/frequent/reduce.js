function groupedCount(keys, values, rereduce) {
  var uniqueHash = {},
    uniqueValues = [];

  var countUniqueValues = function(tags) {
    var tagIndex,
      tagsCount = tags.length;

    // Build index of unique items
    for (tagIndex = 0; tagIndex < tagsCount; tagIndex += 1) {
      var key = tags[tagIndex].key || tags[tagIndex];
      var count = tags[tagIndex].value || 1;
      if (!uniqueHash[key]) {
        uniqueHash[key] = count;
      } else {
        uniqueHash[key] += count;
      }
    }

    // Add unique items into an array
    for (tagIndex in uniqueHash) {
      if (uniqueHash.hasOwnProperty(tagIndex)) {
        uniqueValues.push({
          key: tagIndex,
          value: uniqueHash[tagIndex]
        });
      }
    }

    // Sort the items by frequency
    return uniqueValues.sort(function(a, b) {
      return b.value - a.value;
    });
  };

  // If the values havent been uniqued, unique them
  if (values && values.length && !values[0].key) {
    var all = [];
    values.map(function(theseValues) {
      all = all.concat(theseValues);
    });
    return countUniqueValues(all);
  }

  if (rereduce) {
    return values.map(function(row) {
      return row.key + ":::" + row.value;
    });
  } else {
    return countUniqueValues(values);
  }
}


try {
  exports.groupedCount = groupedCount;
} catch (e) {
  //  // DEBUG console.log("not in a node context")
}
