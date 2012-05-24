define("lexicon/Lexicon", 
		["use!backbone",
		 "text!sample_data/orthography.txt",
		 "text!sample_data/morphemes.txt",
		 "text!sample_data/gloss.txt",
		 "text!sample_data/translation.txt",
		 "lexicon/LexiconNode",
		 "lexicon/LexiconNodes"],
		function(Backbone, orthography, morphemes, gloss, translation, LexiconNode, LexiconNodes) {
	
	var Lexicon = Backbone.Model.extend(
			
		/** @lends Lexicon.prototype */ 
				
		{
			/**
			 * @class Lexicon is directed graph (triple store) between morphemes and
			 *        their allomorphs and glosses. It allows the search to index
			 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
			 * 
			 * @description
			 * 
			 * @extends Backbone.Model
			 * 
			 * @constructs
			 * 
			 */
	
		initialize : function(){
			this.findWords();
			this.findMorphemes();
			this.findGlosses();
			this.findTranslations();
			
		},
		defaults: {
		},
		findWords: function(text){
			if(!text){
				text = orthography;
			}
			words = text.toLowerCase().replace(/[,.*#()\n]/g," ").replace(/ +/g," ").split(" ");
			for (w in words){
				var key = words[w]+"|ortho";
				var value = localStorage.getItem(key);
				if ( value == null){
					value = {value: "", data: [w]}
				}else{
					value = JSON.parse(value);
					if ( value.data.indexOf(w) == -1 ){
						value.data.push(w);
					}
				}
				localStorage.setItem(key,JSON.stringify(value));
			}
		}
		,
		findMorphemes: function(text){
			if(!text){
				text = morphemes;
			}
			morphemes = text.toLowerCase().replace(/[,.*#()\n-]/g," ").replace(/ +/g," ").split(" ");
			for (w in morphemes){
				var key = morphemes[w]+"|morpheme";
				var value = localStorage.getItem(key);
				if ( value == null){
					value = {value: "", data: [w]}
				}else{
					value = JSON.parse(value);
					if ( value.data.indexOf(w) == -1 ){
						value.data.push(w);
					}
				}
				localStorage.setItem(key,JSON.stringify(value));
			}
		},
		findGlosses: function(text){
			if(!text){
				text = gloss;
			}
			glosses = text.toLowerCase().replace(/[,.*#()\n-]/g," ").replace(/ +/g," ").split(" ");
			for (w in glosses){
				var key = glosses[w]+"|gloss";
				var value = localStorage.getItem(key);
				if ( value == null){
					value = {value: "", data: [w]}
				}else{
					value = JSON.parse(value);
					if ( value.data.indexOf(w) == -1 ){
						value.data.push(w);
					}
				}
				localStorage.setItem(key,JSON.stringify(value));
			}
		},
		findTranslations: function(text){
			if(!text){
				text = translation;
			}
			translations = text.toLowerCase().replace(/[,.*#()\n`'’]/g," ").replace(/ +/g," ").split(" ");
			for (w in translations){
				var key = translations[w]+"|transl";
				var value = localStorage.getItem(key);
				if ( value == null){
					value = {value: "", data: [w]}
				}else{
					value = JSON.parse(value);
					if ( value.data.indexOf(w) == -1 ){
						value.data.push(w);
					}
				}
				localStorage.setItem(key,JSON.stringify(value));
			}
		}
	
	}); 
	
	return Lexicon; 
	
}); 
