/* updated to be compatible with pre-1.38 databases */
function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    if (doc.fieldDBtype === "SubExperimentDataList" && doc.results) {
      var date = doc.dateModified || doc.dateCreated;

      var experimentLabel = doc._id;
      experimentLabel = experimentLabel.replace(/[0-9]*/g, "");

      var prime;
      var target;
      var participant = doc.participant;
      var experimenter = doc.experimenter;
      var response;
      var score;

      var results = doc.results.map(function(subexperiment) {
        var responses = subexperiment.results.map(function(stimulus) {
          prime = stimulus.prime;
          target = stimulus.target;
          response = stimulus.responses[stimulus.responses.length - 1];
          score = response.score;
          stimulusId = stimulus.relatedData[0].URI.split("?rev=")[0];
          stimulusRev = stimulus.relatedData[0].URI.split("?rev=")[1];
          emit(stimulusId, [date, {
            participant: participant,
            experimenter: experimenter,
            stimulusId: stimulusId,
            stimulusRev: stimulusRev,
            prime: prime,
            target: target,
            response: response,
            score: score
          }]);

          return stimulus.responses;
        });
      });

    }
  } catch (e) {
    emit(e, 1);
  }
}
