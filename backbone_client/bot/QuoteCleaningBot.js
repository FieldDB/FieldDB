/* Depends on jquery couch  */

/**
 */

Array.prototype.getUnique = function() {
	var u = {}, a = [];
	for (var i = 0, l = this.length; i < l; ++i) {
		if (u.hasOwnProperty(this[i])) {
			continue;
		}
		a.push(this[i]);
		u[this[i]] = 1;
	}
	return a;
};

var Bot = function(dbname, corpusid, corpustitle, optionalDataListForReviewBeforeRunning) {
	if (!dbname || !corpusid || !corpustitle) {
		throw ("You must create this bot with a database name, a corpus id and a corpus title. ");
	}
	var stopAt = 10;


	var activities = $.couch.db(dbname + "-activity_feed");
	var database = $.couch.db(dbname);

	var name = "quotecleaningbot";
	var gravatar = "968b8e7fb72b5ffe2915256c28a9414c";

	var cleaningFunction = function(datum, saveFunction) {
		if (!datum.collection || datum.collection !== "datums") {
			console.log("This isnt a new datum.");
			if (!datum.audioVideo) {
				console.log("This isnt a old datum.");
				return;
			}
		}

		var changes = [];
		for (var field = datum.fields.length - 1; field > 0; field--) {
			var previousMask = datum.fields[field].mask;
			var previousValue = datum.fields[field].value;
			datum.fields[field].mask = previousMask.replace(/[â]/g, "'").replace(/''/g,"'");
			if (datum.fields[field].label === "translation") {
				datum.fields[field].mask = datum.fields[field].mask.replace(/OM/g,"om");
				datum.fields[field].mask = datum.fields[field].mask.trim().replace(/' +`/g," ").replace(/['"]$/g, "").replace(/^['`"]/g, "");
			}
			if (previousMask !== datum.fields[field].mask) {
				changes.push(" quote encoding problems " + previousMask + " -> " + datum.fields[field].mask);
			}

			datum.fields[field].value = previousValue.replace(/[â]/g, "'").replace(/''/g,"'");
			if (datum.fields[field].label === "translation") {
				datum.fields[field].value = datum.fields[field].value.replace(/OM/g,"om");
				datum.fields[field].value = datum.fields[field].value.trim().replace(/' +`/g," ").replace(/['"]$/g, "").replace(/^['`"]/g, "");
			}
			if (previousValue !== datum.fields[field].value) {
				changes.push(" quote encoding problems " + previousValue + " -> " + datum.fields[field].value);
			}

		}

		if (changes.length === 0) {
			console.log("No changes on " + datum._id);
			return;
		}

		var timestamp = Date.now();
		/* Record this event in the comments */
		var changeDescription = changes.getUnique().join("\n * ");
		console.log(changeDescription);
		datum.comments.push({
			"text": "Hi\nJust a quick note to say that I automatically cleaned this datum. \n\nChanges:\n * " + changeDescription + "\n\nExplanation: I was asked by lingllama to come by and standardize quotes today. According to his corpus' convention, we don't need quotes in the translation field.",
			"username": name,
			"timestamp": timestamp,
			"gravatar": gravatar,
			"timestampModified": timestamp
		});
		window.comments = datum.comments;


		if (typeof saveFunction === "function") {
			saveFunction(datum, changeDescription);
		}

	};

	var cleaningDataList;
	var addThisDatumToCleaningDataList = function(datumid, directobject) {
		if (!datumid || !cleaningDataList) {
			return;
		}
		cleaningDataList.datumIds.push(datumid);

		var timestamp = Date.now();
		cleaningDataList.comments.push({
			"text": "I could clean this automatically:\n * " + directobject,
			"username": name,
			"timestamp": timestamp,
			"gravatar": gravatar,
			"timestampModified": timestamp
		});

		var activity = {
			"verb": "<a target='_blank' href='#diff/oldrev/" + cleaningDataList._rev + "/newrev/" + cleaningDataList._rev + "'>updated</a> ",
			"verbicon": "icon-comment",
			"directobjecticon": "icon-list",
			"directobject": "<a target='_blank' href='#data/" + cleaningDataList._id + "'>Commented: I could clean this automatically:\n * " + directobject+"...</a> ",
			"indirectobject": "in <a target='_blank' href='#corpus/" + corpusid + "'>" + corpustitle + "</a>",
			"teamOrPersonal": "team",
			"context": " via Futon Bot.",
			"user": {
				"gravatar": gravatar,
				"username": name,
				"_id": name,
				"collection": "bots",
				"firstname": "Cleaner",
				"lastname": "Bot",
				"email": ""
			},
			"timestamp": Date.now(),
			"dateModified": JSON.parse(JSON.stringify(new Date()))
		};
		activities.saveDoc(activity, {
			success: function(message) {
				console.log("Saved activity", activity, message);
			},
			error: function(error) {
				console.log("Problem saving " + JSON.stringify(activity), error);
			}
		});
	};
	var saveCleaningDataList = function() {
		if (!cleaningDataList) {
			throw 'You didnt specify an optional datalist to save the cleaning to, so I cant save it...';
			return;
		}
		database.openDoc(optionalDataListForReviewBeforeRunning, {
			success: function(datalist) {
				datalist.datumIds = cleaningDataList.datumIds;
				datalist.comments = cleaningDataList.comments;
				datalist.title = "Quote Cleaning DataList";
				datalist.description = "These are the datum which could be automatically cleaned by the cleaner bot (see comments for what was found by the bot).";
				database.saveDoc(datalist, {
					success: function(status) {
						console.log("Saved datalist which could be cleaned automatically ", datalist, status);
						var activity = {
							"verb": "<a target='_blank' href='#diff/oldrev/" + datalist._rev + "/newrev/" + status.rev + "'>updated</a> ",
							"verbicon": "icon-pencil",
							"directobjecticon": "icon-list",
							"directobject": "<a target='_blank' href='#data/" + datalist._id + "'>Updated the quote cleaning data list</a> ",
							"indirectobject": "in <a target='_blank' href='#corpus/" + corpusid + "'>" + corpustitle + "</a>",
							"teamOrPersonal": "team",
							"context": " via Futon Bot.",
							"user": {
								"gravatar": gravatar,
								"username": name,
								"_id": name,
								"collection": "bots",
								"firstname": "Cleaner",
								"lastname": "Bot",
								"email": ""
							},
							"timestamp": Date.now(),
							"dateModified": JSON.parse(JSON.stringify(new Date()))
						};
						activities.saveDoc(activity, {
							success: function(message) {
								console.log("Saved activity", activity, message);
							},
							error: function(error) {
								console.log("Problem saving " + JSON.stringify(activity), error);
							}
						});
					},
					error: function(error) {
						console.log("Problem saving " + JSON.stringify(datalist), error);
					}
				});
			},
			error: function(error) {
				console.log("Error opening your doc ", error);
			}
		});
	};

	if (optionalDataListForReviewBeforeRunning) {
		database.openDoc(optionalDataListForReviewBeforeRunning, {
			success: function(datalist) {
				/* clear the datum ids in preparation for cleaning run. */
				datalist.previousCleaningRuns = datalist.previousCleaningRuns || [];
				datalist.previousCleaningRuns.push(datalist.datumIds.getUnique());
				datalist.datumIds = [];
				datalist.comments = [];
				cleaningDataList = datalist;
			},
			error: function(error) {
				console.log("Error opening your doc ", error);
			}
		});
	}

	var saveDocBackToCouchDB = function(cleanedDoc, directobjectMessage) {

		(function(modifiedDoc, oldrev, directobject) {

			if (optionalDataListForReviewBeforeRunning) {
				console.log("Here is what we would save ", modifiedDoc.comments);
				console.log("Adding this to the quotecleaning datalist.");
				addThisDatumToCleaningDataList(modifiedDoc._id, directobject);
			} else {
				console.log("Here is what we would save ", modifiedDoc.comments);
				return;
				database.saveDoc(modifiedDoc, {
					success: function(status) {
						console.log("Saved ", modifiedDoc, status);
						var activity = {
							"verb": "<a target='_blank' href='#diff/oldrev/" + oldrev + "/newrev/" + status.rev + "'>updated</a> ",
							"verbicon": "icon-pencil",
							"directobjecticon": "icon-list",
							"directobject": "<a target='_blank' href='#data/" + modifiedDoc._id + "'>Cleaned " + directobject + "</a> ",
							"indirectobject": "in <a target='_blank' href='#corpus/" + corpusid + "'>" + corpustitle + "</a>",
							"teamOrPersonal": "team",
							"context": " via Futon Bot.",
							"user": {
								"gravatar": gravatar,
								"username": name,
								"_id": name,
								"collection": "bots",
								"firstname": "Cleaner",
								"lastname": "Bot",
								"email": ""
							},
							"timestamp": Date.now(),
							"dateModified": JSON.parse(JSON.stringify(new Date()))
						};
						activities.saveDoc(activity, {
							success: function(message) {
								console.log("Saved activity", activity, message);
							},
							error: function(error) {
								console.log("Problem saving " + JSON.stringify(activity), error);
							}
						});
					},
					error: function(error) {
						console.log("Problem saving " + JSON.stringify(modifiedDoc), error);
					}
				});
			}


		})(cleanedDoc, cleanedDoc._rev, directobjectMessage);
	};

	return {
		gravatar: gravatar,
		name: name,
		description: cleaningFunction,
		save: saveDocBackToCouchDB,
		saveCleaningDataList: saveCleaningDataList,
		run: function() {
			/* dont run until youre sure you want to */
			var count = 0;
			database.allDocs({
				success: function(result) {
					//console.log(result);
					var data = result.rows;
					for (var couchdatum in data) {
						count++;
						if (count > stopAt) {
							return;
						}
						database.openDoc(data[couchdatum].id, {
							success: function(originalDoc) {

								/* transliterate the utterance line into romanized, then save the data back to the db */
								cleaningFunction(originalDoc, saveDocBackToCouchDB);

							},
							error: function(error) {
								console.log("Error opening your docs ", error);
							}
						});
					}
				},
				error: function(error) {
					console.log("Error opening the database ", error);
				}
			});
		}
	}
}
