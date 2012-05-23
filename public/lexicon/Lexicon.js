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
//			this.findWords();
//			this.findMorphemes();
//			this.findGlosses();
//			this.findTranslations();
			
		},
		defaults: {
		  words: new LexiconNodes(),
		  morphemes: new  LexiconNodes(),
		  glosses: new LexiconNodes(),
		  translations: new LexiconNodes(),
		},
		findWords: function(text){
			if(!text){
				text = orthography;
			}
			words = text.toLowerCase().replace(/[,.*#()\n]/g," ").replace(/ +/g," ").split(" ");
			for (w in words){
				this.get("words").push(new LexiconNode({key: words[w]+"|ortho"}));
			}
		}
		,
		findMorphemes: function(text){
			if(!text){
				text = morphemes;
			}
			morphemes = text.toLowerCase().replace(/[,.*#()\n-]/g," ").replace(/ +/g," ").split(" ");
			for (w in morphemes){
				this.get("morphemes").push(new LexiconNode({key: morphemes[w]+"|morpheme"}));
			}
		},
		findGlosses: function(text){
			if(!text){
				text = gloss;
			}
			glosses = text.toLowerCase().replace(/[,.*#()\n-]/g," ").replace(/ +/g," ").split(" ");
			for (w in glosses){
				this.get("glosses").push(new LexiconNode({key: glosses[w]+"|gloss"}));
			}
		},
		findTranslations: function(text){
			if(!text){
				text = translation;
			}
			translations = text.toLowerCase().replace(/[,.*#()\n`'’]/g," ").replace(/ +/g," ").split(" ");
			for (w in translations){
				this.get("translations").push(new LexiconNode({key: translations[w]+"|transl"}));
			}
		}
	
	}); 
	
	return Lexicon; 
	
}); 
