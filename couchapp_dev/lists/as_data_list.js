/* source: https://gist.github.com/xalakox/3026004
This function itterates through the data and returns a data list containing the doc ids which were sent
*/
function(head, req) {
  start({
    "headers": {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  var buildDatalist = function(groupedByKey, dataListTitle, datumIds) {
    var timestamp = Date.now();
    groupedByKey = groupedByKey || "empty";
    dataListTitle = dataListTitle || "Empty list ";
    var datalist = {
      title: dataListTitle + " on " + new Date(timestamp),
      description: "All the data in " + dataListTitle + " (" + groupedByKey + ") as of " + new Date(timestamp),
      datumIds: datumIds,
      collection: "datalists",
      username: "datalistbot",
      timestamp: timestamp
    };
    return datalist;
  };

  var row;
  var hash = {};
  var groupedByKey;

  while (row = getRow()) {
    groupedByKey = row.key;
    hash[groupedByKey] = hash[groupedByKey] || [];
    hash[groupedByKey].push(row.value);
  }
  for (var item in hash) {
    if (hash.hasOwnProperty(item)) {
      hash[item] = buildDatalist(item, hash[item][0].dataListTitle, hash[item].map(function(minimalDatum) {
        return minimalDatum.datumId;
      }));
    }
  }
  send(JSON.stringify(hash));
  return "";
}
