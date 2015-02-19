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


function(key, values, rereduce) {
  var minimalDatums = [];
  var groupedByKey;
  var dataListTitle;
  if (!rereduce) {
    minimalDatums = values;
  } else {
    // do nothing on the rereduce step
  }
  var datumIdsByDateEntered = [];
  minimalDatums.sort(function(a, b) {
    dataListTitle = a.dataListTitle;
    groupedByKey = a.groupedByKey;
    return a.dateEntered - b.dateEntered;
  });
  for (var datum in minimalDatums) {
    datumIdsByDateEntered.push(minimalDatums[datum].datumId);
  }
  return buildDatalist(groupedByKey, dataListTitle, datumIdsByDateEntered)
}
