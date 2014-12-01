/* generalize this to work on more langauges and bidirectionally.
currently this function is a quick and dirty transliterator prototype for
inuktitut written by  one of the interns for javascript practice, it sucessfully
transliterates from syllabics to romanized.
it wouldnt work for multiple langauges but it currently has more coverage
than benoit's transliterator which is currently down.
*/
var transliterateInuktitut = function(userInputString) {

  var characterIndex = ["ᐃ", "i", "ᐄ", "ii", "ᐅ", "u", "ᐆ", "uu", "ᐊ", "a", "ᐋ", "aa", "ᐱ", "pi", "ᐲ", "pii", "ᐳ", "pu", "ᐴ", "puu", "ᐸ", "pa", "ᐹ", "paa", "ᑎ", "ti", "ᑏ", "tii", "ᑐ", "tu", "ᑑ", "tuu", "ᑕ", "ta", "ᑖ", "taa", "ᑭ", "ki", "ᑮ", "kii", "ᑯ", "ku", "ᑰ", "kuu", "ᑲ", "ka", "ᑳ", "kaa", "ᒋ", "gi", "ᒌ", "gii", "ᒍ", "gu", "ᒎ", "guu", "ᒐ", "ga", "ᒑ", "gaa", "ᒥ", "mi", "ᒦ", "mii", "ᒧ", "mu", "ᒨ", "muu", "ᒪ", "ma", "ᒫ", "maa", "ᓂ", "ni", "ᓃ", "nii", "ᓄ", "nu", "ᓅ", "nuu", "ᓇ", "na", "ᓈ", "naa", "ᓯ", "si", "ᓰ", "sii", "ᓱ", "su", "ᓲ", "suu", "ᓴ", "sa", "ᓵ", "saa", "ᓕ", "li", "ᓖ", "lii", "ᓗ", "lu", "ᓘ", "luu", "ᓚ", "la", "ᓛ", "laa", "ᔨ", "ji", "ᔩ", "jii", "ᔪ", "ju", "ᔫ", "juu", "ᔭ", "ja", "ᔮ", "jaa", "ᕕ", "vi", "ᕖ", "vii", "ᕗ", "vu", "ᕘ", "vuu", "ᕙ", "va", "ᕚ", "vaa", "ᕆ", "ri", "ᕇ", "rii", "ᕈ", "ru", "ᕉ", "ruu", "ᕋ", "ra", "ᕌ", "raa", "ᕿ", "qi", "ᖀ", "qii", "ᖁ", "qu", "ᖂ", "quu", "ᖃ", "qa", "ᖄ", "qaa", "ᖏ", "ngi", "ᖐ", "ngii", "ᖑ", "ngu", "ᖒ", "nguu", "ᖓ", "nga", "ᖔ", "ngaa", "ᙱ", "nngi", "ᙲ", "nngii", "ᙳ", "nngu", "ᙴ", "nnguu", "ᙵ", "nnga", "ᙶ", "nngaa", "ᖠ", "łi", "ᖡ", "łii", "ᖢ", "łu", "ᖣ", "łuu", "ᖤ", "ła", "ᖥ", "łaa", "ᖦ", "ł", "ᐦ", "h", "ᑉ", "p", "ᑦ", "t", "ᒃ", "k", "ᒡ", "g", "ᒻ", "m", "ᓐ", "n", "ᔅ", "s", "ᓪ", "l", "ᔾ", "j", "ᕝ", "v", "ᕐ", "r", "ᖅ", "q", "ᖕ", "ng", "ᖖ", "nng", "ᐂ", "aai", "ᓁ", "naai", "ᑍ", "taai", "ᐰ", "paai", "ᑬ", "kaai", "ᒤ", "maai", "ᓮ", "saai", "ᓔ", "laai", "ᔧ", "yaai", "ᒊ", "caai", "ᕔ", "faai", "ᕅ", "raai", "ᕾ", "qaai", "ᖎ", "ngaai", "ᑌ", "tai", "ᒉ", "gai", "ᙰ", "ngai", "ᐯ", "pai", "ᐁ", "ai", "ᑫ", "kai", "ᒣ", "mai", "ᓀ", "nai", "ᓭ", "sai", "ᓓ", "lai", "ᔦ", "jai", "ᕓ", "vai", "ᕃ", "rai", "ᙯ", "qai", "ᕼ", "h"];
  var newString = ""; //Will be returned to the user when finished.

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


