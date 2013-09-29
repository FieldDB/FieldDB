/* Depends on jquery couch  */

/**
*/
var Bot = function(pouchname, corpusid, corpustitle){
	if(!pouchname || !corpusid ||!corpustitle){
		throw("You must create this bot with a database name, a corpus id and a corpus title. ");
	}
	var stopAt = 10;
	
	var activities = $.couch.db(pouchname+"-activity_feed");
	var database = $.couch.db(pouchname);

	var name = "inuktitutcleaningbot";
	var gravatar = "968b8e7fb72b5ffe2915256c28a9414c";
	
	var cleaningFunction = function(datum, saveFunction){
		if(!datum.collection || datum.collection !== "datums"){
			console.log("This isnt a datum.");
			return;
		}

		/* new fields */
		var userField = {
			label: "enteredByUser",
			value: "MultilingualCorporaExtractor",
			mask: "MultilingualCorporaExtractor",
			encrypted: "",
			shouldBeEncrypted: "",
			help: "The user who originally entered the datum",
			showToUserTypes: "all",
			readonly: true,
			userchooseable: "disabled"
		};
		var modifiedByUser = {
			label: "modifiedByUser",
			value: name,
			mask: name,
			encrypted: "",
			shouldBeEncrypted: "",
			help: "An array of users who modified the datum",
			showToUserTypes: "all",
			readonly: true,
			users: [{
				gravatar: gravatar,
				username: name,
				collection: "users",
				firstname: "Cleaner",
				lastname: "Bot"
			}],
			userchooseable: "disabled"
		};


		var changes = [];
		var utterance = "";
		var allomorphsField = {};
		/* clean other things */
		for(var field in datum.datumFields){
			if(datum.datumFields[field].value && datum.datumFields[field].value.indexOf("gen:") > -1){
				var oldValue = datum.datumFields[field].value;
				datum.datumFields[field].value = datum.datumFields[field].value.replace(/^gen:\d\d*:\d\d* /g, "");
				var removed = oldValue.replace(datum.datumFields[field].value, "");
				datum.datumFields[field].mask = datum.datumFields[field].value;
				changes.push("Removed "+ removed);
			}
			datum.datumFields[field].value = datum.datumFields[field].value.trim();
			datum.datumFields[field].mask = datum.datumFields[field].mask.trim();
			if(datum.datumFields[field].label === "utterance"){
				utterance = datum.datumFields[field].value;
			}
			if(datum.datumFields[field].label === "Verse number from Bible Book Chapter"){
				datum.datumFields[field].label = "verse";
				datum.datumFields[field].help = "This is the bible verse number from the original source, for the book see the sessionFields";
			}
			if(datum.datumFields[field].label === "enteredByUser"){
				datum.datumFields[field].value = userField.value;
				datum.datumFields[field].mask = userField.mask;
				userField = null;
			}
			if(datum.datumFields[field].label === "modifiedByUser"){
				datum.datumFields[field].value = datum.datumFields[field].value  + ", "+ modifiedByUser.value;
				datum.datumFields[field].mask =  datum.datumFields[field].mask  + ", "+ modifiedByUser.mask;
				datum.datumFields[field].users.push(modifiedByUser.users[0]);
				modifiedByUser = null;
			}
			if(datum.datumFields[field].label === "morphemes"){
				/* copy the old morphemes field to a new field for allomorphs */
				$.extend(allomorphsField, datum.datumFields[field]);
				allomorphsField.label = "allomorphs";
				allomorphsField.help = "We have decided to have an explicit allomorphs line for Inuktitut since the writing trandition uses allomorphs rather than morphemes, it is usually very hard to semi-automatically segment the words without an intermediary allomorph step.";
			}


		}
		/* put it below the utterance line after all the fields have been cleaned*/
		datum.datumFields.splice(2,0, allomorphsField);
		/* put in the user and modified by user if they werent already there */
		if(userField){
			datum.datumFields.push(userField);
		}
		if(modifiedByUser){
			datum.datumFields.push(modifiedByUser);
		}

		for(var field in datum.session.sessionFields){
			if(datum.session.sessionFields[field].label === "Bible Book"){
				datum.session.sessionFields[field].label = "book";
				datum.session.sessionFields[field].help = "This is the bible book where this session came from.";
			}
			if(datum.session.sessionFields[field].label === "Bible Book Chapter"){
				datum.session.sessionFields[field].label = "chapter";
				datum.session.sessionFields[field].help = "This is the bible book chapter number where this datum came from.";
			}
		}
		/* move the chapter field to the datum */
		var chapterField = datum.session.sessionFields.pop();
		datum.datumFields.push(chapterField);

		var timestamp = Date.now();
		/* Record this event in the comments */
		var changeDescription = changes.join(", ") + " so that the IGT lines would line up again, and added an allomorphs line.";
		datum.comments.push({
			"text": changeDescription, 
			"username": name,
			"timestamp": timestamp, 
			"gravatar": gravatar, 
			"timestampModified": timestamp
		});
		

		if (typeof saveFunction == "function") {
			saveFunction(datum, changeDescription);
		}
		
	};

	var saveDocBackToCouchDB = function(cleanedDoc, directobjectMessage){
		console.log("Here is what we would save ",modifiedDoc);
		return ;
		(function(modifiedDoc, oldrev, directobject){

			database.saveDoc(modifiedDoc, {success: function(status){
				console.log("Saved ", modifiedDoc, status);
				var activity = {
					"verb": "<a target='_blank' href='#diff/oldrev/"+oldrev+"/newrev/"+status._rev+"'>updated</a> ",
					"verbicon": "icon-pencil",
					"directobjecticon": "icon-list",
					"directobject": "<a target='_blank' href='#data/"+modifiedDoc._id+"'>"+directobject+"</a> ",
					"indirectobject": "in <a target='_blank' href='#corpus/"+corpusid+"'>"+corpustitle+"</a>",
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
				activities.saveDoc(activity, {success: function(message){
					console.log("Saved activity" , activity, message);
				},error : function(error){
					console.log("Problem saving "+ JSON.stringify(activity));
				}});
			},error : function(error){
				console.log("Problem saving "+ JSON.stringify(modifiedDoc));
			}});

		})(cleanedDoc, cleanedDoc._rev, directobjectMessage);
};

return {
	gravatar: gravatar,
	name: name,
	description: cleaningFunction,
	save: saveDocBackToCouchDB,
	run: function(){
		/* dont run until youre sure you want to */
		var count = 0;
		database.allDocs({
			success: function(result){
				    //console.log(result);
				    var data = result.rows;
				    for (var couchdatum in data) {
				    	count++;
				    	if(count > stopAt){
				    		return;
				    	}
				    	database.openDoc(data[couchdatum].id,{
				    		success: function(originalDoc){

				    			// console.log(originalDoc._rev);
				    			var id = originalDoc._id;
				    			var oldrev= originalDoc._rev;
				    			
				    			/* transliterate the utterance line into romanized, then save the data back to the db */
				    			cleaningFunction(originalDoc, saveDocBackToCouchDB);

				    		},
				    		error: function(error){
				    			console.log("Error opening your docs ", error);
				    		}
				    	}); 
				    }
				},
				error: function(error){
					console.log("Error opening the database ", error);
				}
			});
	}
}
}
