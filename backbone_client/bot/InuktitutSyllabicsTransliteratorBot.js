/* Depends on jquery couch  */

/**
*/
var Bot = function(dbname, corpusid, corpustitle){
	if(!dbname || !corpusid ||!corpustitle){
		throw("You must create this bot with a database name, a corpus id and a corpus title. ");
	}
	var stopAt = 10;

	var activities = $.couch.db(dbname+"-activity_feed");
	var database = $.couch.db(dbname);

	var name = "inuktituttransliterationbot";
	var gravatar = "968b8e7fb72b5ffe2915256c28a9414c";

	/*
	use a small part of underscore
	*/
	var  nativeMap  = Array.prototype.map;
	var _ = {};
	_.map = function(obj, iterator, context) {
		var results = [];
		if (obj == null) return results;
		if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
		each(obj, function(value, index, list) {
			results.push(iterator.call(context, value, index, list));
		});
		return results;
	};

	_.pluck = function(obj, key) {
		return _.map(obj, function(value){ return value[key]; });
	};

	/*
	TODO generalize this to work on more langauges and bidirectionally.
	currently this function is a quick and dirty transliterator prototype for
	inuktitut written by  one of the interns for javascript practice, it sucessfully
	transliterates from syllabics to romanized.
	it wouldnt work for multiple langauges but it currently has more coverage
	than benoit's transliterator which is currently down.
	*/
	var transliterateInuktitut = function(userInputString) {

		var characterIndex = ['ᐃ','i','ᐄ','ii','ᐅ','u','ᐆ','uu','ᐊ','a','ᐋ','aa','ᐱ','pi','ᐲ','pii','ᐳ','pu','ᐴ','puu','ᐸ','pa','ᐹ','paa','ᑎ','ti','ᑏ','tii','ᑐ','tu','ᑑ','tuu','ᑕ','ta','ᑖ','taa','ᑭ','ki','ᑮ','kii','ᑯ','ku','ᑰ','kuu','ᑲ','ka','ᑳ','kaa','ᒋ','gi','ᒌ','gii','ᒍ','gu','ᒎ','guu','ᒐ','ga','ᒑ','gaa','ᒥ','mi','ᒦ','mii','ᒧ','mu','ᒨ','muu','ᒪ','ma','ᒫ','maa','ᓂ','ni','ᓃ','nii','ᓄ','nu','ᓅ','nuu','ᓇ','na','ᓈ','naa','ᓯ','si','ᓰ','sii','ᓱ','su','ᓲ','suu','ᓴ','sa','ᓵ','saa','ᓕ','li','ᓖ','lii','ᓗ','lu','ᓘ','luu','ᓚ','la','ᓛ','laa','ᔨ','ji','ᔩ','jii','ᔪ','ju','ᔫ','juu','ᔭ','ja','ᔮ','jaa','ᕕ','vi','ᕖ','vii','ᕗ','vu','ᕘ','vuu','ᕙ','va','ᕚ','vaa','ᕆ','ri','ᕇ','rii','ᕈ','ru','ᕉ','ruu','ᕋ','ra','ᕌ','raa','ᕿ','qi','ᖀ','qii','ᖁ','qu','ᖂ','quu','ᖃ','qa','ᖄ','qaa','ᖏ','ngi','ᖐ','ngii','ᖑ','ngu','ᖒ','nguu','ᖓ','nga','ᖔ','ngaa','ᙱ','nngi','ᙲ','nngii','ᙳ','nngu','ᙴ','nnguu','ᙵ','nnga','ᙶ','nngaa','ᖠ','łi','ᖡ','łii','ᖢ','łu','ᖣ','łuu','ᖤ','ła','ᖥ','łaa','ᖦ','ł','ᐦ','h','ᑉ','p','ᑦ','t','ᒃ','k','ᒡ','g','ᒻ','m','ᓐ','n','ᔅ','s','ᓪ','l','ᔾ','j','ᕝ','v','ᕐ','r','ᖅ','q','ᖕ','ng','ᖖ','nng','ᐂ','aai','ᓁ','naai','ᑍ','taai','ᐰ','paai','ᑬ','kaai','ᒤ','maai','ᓮ','saai','ᓔ','laai','ᔧ','yaai','ᒊ','caai','ᕔ','faai','ᕅ','raai','ᕾ','qaai','ᖎ','ngaai','ᑌ','tai','ᒉ','gai','ᙰ','ngai','ᐯ','pai','ᐁ','ai','ᑫ','kai','ᒣ','mai','ᓀ','nai','ᓭ','sai','ᓓ','lai','ᔦ','jai','ᕓ','vai','ᕃ','rai','ᙯ','qai','ᕼ','h'];
	  var newString = ''; //Will be returned to the user when finished.

	  for (var i = 0; i < userInputString.length; i++) {

		  //first, find index of current character
		  var currentChar = userInputString.substr(i, 1);
	    var indexNumber = characterIndex.indexOf(currentChar);

	    if ((indexNumber !== -1) && (indexNumber % 2 === 0)) {
	      //If the current character is Inuktitut,
	  	  //return that character's latin representation from array
	  	  //and add it to the end of our new string
	      newString += characterIndex[characterIndex.indexOf(currentChar) + 1];
	    } else {
	      //The character is not Inuktitut, so just add it to the new string
	      //and move on to the next one.
	      newString += currentChar;
	    }

	  }

	  return newString;

	};

	var transliterateUtterancesIntoRomanized = function(datum, saveFunction){
		if(!datum.collection || datum.collection != "datums"){
			console.log("This isnt a datum.");
			return;
		}

		var fieldLabels = _.pluck(datum.datumFields, "label");
		// console.log("Fields in this datum " + fieldLabels);

		var utteranceFieldIndex = fieldLabels.indexOf("utterance");
		var orthographyFieldIndex = fieldLabels.indexOf("orthography");
		var syllabicsOrthographyFieldIndex = fieldLabels.indexOf("syllabicsOrthography");
		if(utteranceFieldIndex == -1) {
			console.log("This datum didn't have an utterance field, that's really odd." + JSON.stringify(datum));
			return;
		}
		var utteranceField = datum.datumFields[utteranceFieldIndex];
		/* dont need to process empty data */
		if (!utteranceField.value) {
			return;
		}
		/* dont process this datum if the utterance is already romainzed */
		var transliterized = transliterateInuktitut(utteranceField.value)
		if(transliterized == utteranceField.value){
			console.log("This data was already transliterated.");
			return;
		}
		var syllabicsField = null;

		/* look to see if we already have an orthography field */
		var orthoField = null;
		if(orthographyFieldIndex > -1){
			orthoField = datum.datumFields[orthographyFieldIndex];
			console.log("orthoField ", orthoField);
		}
		/* if we do, don't modify it, use a syllabicsOrthography field instead */
		if (orthoField) {
			if(transliterateInuktitut(orthoField.value) == transliterized){
				console.log("This data was already transliterated.");
				return;
			}
			/*  look to see if we already have a syllabics field */
			if (syllabicsOrthographyFieldIndex > -1) {
				syllabicsField = datum.datumFields[syllabicsOrthographyFieldIndex];
			}
		}

		/* if we have syllabicsOrthography too, don't modify it, just tell the user we arent saving their utterance line. */
		if (syllabicsField) {
			console.log("There was already a syllabics field, " + syllabicsField.value + " we didnt over write it with " + utteranceField.value);
		} else {
			syllabicsField = {};
			/* copy the old utterance field to a new field for sylabics */
			jQuery.extend(syllabicsField, utteranceField);
			datum.datumFields.push(syllabicsField);
			/* if there was a field called orthography, call this one syllabicsOrthography, otherwise just use orthography */
			if (orthoField) {
				syllabicsField.label = "syllabicsOrthography";
			} else {
				syllabicsField.label = "orthography";
			}
			syllabicsField.help = "This field was from the original data source, it was transliterated using a script to create the utterance line.";
		}
		/* transliterate the utterance */
		var timestamp = Date.now();
		/* Record this event in the comments */
		datum.comments.push({
			"text": "Transliterated from: " + utteranceField.value + " to: " + transliterized,
			"username": name,
			"timestamp": timestamp,
			"gravatar": gravatar,
			"timestampModified": timestamp
		});
		utteranceField.value = transliterized;
		utteranceField.mask = transliterized;
		utteranceField.help = "This field is the common writing system for most Inuktitut speakers and may contain transliteration errors, see "+ syllabicsField.label + " for the original orthography of the data source.";

		console.log("Transliterated: " + utteranceField.value);

		/* clean other things */
		// var notesFieldIndex = fieldLabels.indexOf("notes");
		// var dialectFieldIndex = fieldLabels.indexOf("dialect");
		// var dateElicitedIndex = fieldLabels.indexOf("dateElicited");
		// var checkedWithConsultantIndex = fieldLabels.indexOf("checkedWithConsultant");
		// console.log("Deprecated fields : " + notesFieldIndex + dialectFieldIndex + checkedWithConsultantIndex);
		// if(dialectFieldIndex > -1){
		// 	datum.datumFields.splice(dialectFieldIndex,1);
		// }
		// if(checkedWithConsultantIndex > -1){
		// 	datum.datumFields.splice(checkedWithConsultantIndex,1);
		// }
		// if(notesFieldIndex > -1){
		// 	datum.datumFields.splice(notesFieldIndex,1);
		// }
		// if(dateElicitedIndex > -1){
		// 	datum.datumFields.splice(dateElicitedIndex,1);
		// }

		/* put chapter verse into another place */
		// var chapterVerse = transliterized.split(" ")[0];
		// var pieces = chapterVerse.split(":");
		// if(pieces.length == 3){
		// 	var bookField = {};
		// 	jQuery.extend(bookField, utteranceField);
		// 	bookField.label = "Bible Book";
		// 	bookField.value = "Genesis";
		// 	bookField.mask = "Genesis";
		// 	datum.session.sessionFields.push(bookField);

		// 	var chapterField = {};
		// 	jQuery.extend(chapterField, utteranceField);
		// 	chapterField.label = "Bible Book Chapter";
		// 	chapterField.value = pieces[1];
		// 	chapterField.mask = pieces[1];
		// 	datum.session.sessionFields.push(chapterField);

		// 	var verseField = {};
		// 	jQuery.extend(verseField, utteranceField);
		// 	verseField.label = "Verse number from Bible Book Chapter";
		// 	verseField.value = pieces[2];
		// 	verseField.mask = pieces[2];
		// 	datum.datumFields.push(verseField);
		// 	utteranceField.value = utteranceField.value.replace(chapterVerse, "");
		// 	utteranceField.mask = utteranceField.mask.replace(chapterVerse, "");
		// }

		if (typeof saveFunction == "function") {
			saveFunction(datum, transliterized);
		}

	};

	var saveDocBackToCouchDB = function(modifiedDoc, directobject){
		console.log("Here is what we would save ",modifiedDoc);
		return ;


		database.saveDoc(modifiedDoc, {success: function(status){
			console.log("Saved " + JSON.stringify(modifiedDoc), status);
			var activity = {
				"verb": "<a target='_blank' href='#diff/oldrev/"+oldrev+"/newrev/"+status._rev+"'>updated</a> ",
				"verbicon": "icon-pencil",
				"directobjecticon": "icon-list",
				"directobject": "<a target='_blank' href='#data/"+id+"'>"+directobject+"</a> ",
				"indirectobject": "in <a target='_blank' href='#corpus/"+corpusid+"'>"+corpustitle+"</a>",
				"teamOrPersonal": "team",
				"context": " via Futon Bot.",
				"user": {
					"gravatar": gravatar,
					"username": name,
					"_id": name,
					"collection": "bots",
					"firstname": "Inuktitut",
					"lastname": "Transliteration Bot",
					"email": ""
				},
				"timestamp": 1370794522819,
				"dateModified": JSON.parse(JSON.stringify(new Date()))
			};
			activities.saveDoc(activity, {success: function(message){
				console.log("Saved activity" + JSON.stringify(activity), message);
			},error : function(error){
				console.log("Problem saving "+ JSON.stringify(activity));
			}});
		},error : function(error){
			console.log("Problem saving "+ JSON.stringify(modifiedDoc));
		}});
};

return {
	gravatar: gravatar,
	name: name,
	description: transliterateUtterancesIntoRomanized,
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
				    			transliterateUtterancesIntoRomanized(originalDoc, saveDocBackToCouchDB);

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
