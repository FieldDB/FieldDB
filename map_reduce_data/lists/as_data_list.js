/* source: https://gist.github.com/xalakox/3026004
This function itterates through the data and returns a data list containing the doc ids which were sent
*/
function(head, req) {
  start({
    "headers": {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  var buildDatalist = function(groupedByKey, dataListTitle, docIds) {
    var timestamp = Date.now();
    groupedByKey = groupedByKey || "empty";
    dataListTitle = dataListTitle || "";
    var datalist = {
      title: dataListTitle + " on " + new Date(timestamp),
      description: "All " + dataListTitle + " data as of " + new Date(timestamp),
      docIds: docIds,
      collection: "datalists",
      username: "datalistbot",
      timestamp: timestamp
    };
    log('datalist');
    log(datalist);
    return datalist;
  };

  var row;
  var hash = {};
  var groupedByKey;

  while (row = getRow()) {
    log('row is');
    log(row.key);
    groupedByKey = row.key;
    hash[groupedByKey] = hash[groupedByKey] || [];
    hash[groupedByKey].push(row.value);
  }

  for (var item in hash) {
    log("item is ");
    log(item);
    if (hash.hasOwnProperty(item)) {
      hash[item] = buildDatalist(item, item, hash[item].map(function(minimalDatum) {
        log("minimalDatum");
        log(minimalDatum);
        return minimalDatum[1];
      }));
    }
  }
  send(JSON.stringify(hash));
  return "";
}
