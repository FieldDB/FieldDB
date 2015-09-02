function groupedCount(keys, values, rereduce) {
  var uniqueHash = {},
    uniqueValues = [];

  // console.log("inside of groupedCount");

  var countUniqueValues = function(tags) {
    var tagIndex,
      tagsCount = tags.length;
   // console.log("countUniqueValues", tags);

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
   // console.log("uniqueHash", uniqueHash);

    // Add unique items into an array
    for (tagIndex in uniqueHash) {
      if (uniqueHash.hasOwnProperty(tagIndex)) {
        uniqueValues.push({
          key: tagIndex,
          value: uniqueHash[tagIndex]
        });
      }
    }
   // console.log("uniqueValues", uniqueValues);
    // Sort the items by frequency
    return uniqueValues.sort(function(a, b) {
      return b.value - a.value;
    });
  };


  if (rereduce) {
   // console.log("rereducing in custom reduce: ", values)
    return values.map(function(row) {
      return row.key + ":::" + row.value;
    });
  } else {
   // console.log("reducing in custom reduce: ", keys)

    // If the values havent been uniqued, unique them
    // if (values && values.length && !values[0].key) {
    //   var all = [];
    //   values.map(function(theseValues) {
    //     all = all.concat(theseValues);
    //   });
    //   console.log("reducing in custom reduce: all: ", all)
    //   return countUniqueValues(all);
    // }
   // console.log("reducing in custom reduce: values: ", values)
    return countUniqueValues(values);
  }
}


try {
  exports.groupedCount = groupedCount;
} catch (e) {
  //  // DEBUG console.log("not in a node context")
}
