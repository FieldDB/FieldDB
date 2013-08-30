/*
TODO this function is a quick and dirty transliterator for inuktitut written by louisa and josh in their hack today, it gets the job done! 
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
  for (var field in datum.datumFields) {
    if (field.label == "utterance") {
      /* we found the utterance */
      var utteranceField = field;
      var orthoField = {};
      /* copy the utterance field to an orthography field, because it was in inuktitut sylabics */
      jQuery.extend(orthoField, field);
      orthoField.label = "orthography";
      utteranceField.value = transliterateSylabics(utteranceField.value);
      utteranceField.mask = transliterateSylabics(utteranceField.mask);
      console.log("Saved " + utteranceField.value);
      if(typeof saveFunction == "function"){
        saveFunction(datum);
      }
      /* Dont need to process the other fields, we found and modified the utterance to put it into the orthography, so continue the loop */
      return;
    }
  }
};
