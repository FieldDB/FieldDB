define(["use!backbone",
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
			if(this.get("wordsIndex").length >0 &&
					this.get("morphemesIndex").length &&
//					this.get("allomorphsIndex").length &&
					this.get("glossesIndex").length &&
					this.get("translationsIndex").length
					){
				//If the lexicon is already built, then don't build it.
				
			}else{
				this.clearLexiconLocalStorage();
				this.findWords();
				this.findMorphemes();
				this.findGlosses();
				this.findTranslations();
			}
		},
		defaults: {
			wordsIndex: JSON.parse(localStorage.getItem("wordsIndex")) || [],
			morphemesIndex: JSON.parse(localStorage.getItem("morphemesIndex")) || [],
			allomorphsIndex: JSON.parse(localStorage.getItem("allomorphsIndex")) || [],
			glossesIndex: JSON.parse(localStorage.getItem("glossesIndex")) || [],
			translationsIndex: JSON.parse(localStorage.getItem("translationsIndex")) || []
		},
		clearLexiconLocalStorage: function(){
			for(i in this.get("wordsIndex")){
				localStorage.removeItem(this.get("wordsIndex")[i]);
			}
			for(i in this.get("morphemesIndex")){
				localStorage.removeItem(this.get("morphemesIndex")[i]);
			}
			for(i in this.get("glossesIndex")){
				localStorage.removeItem(this.get("glossesIndex")[i]);
			}
			for(i in this.get("translationsIndex")){
				localStorage.removeItem(this.get("translationsIndex")[i]);
			}
		},
		addEdge: function(start, end){
			var startNode = JSON.parse(localStorage.getItem("start"));
			if(value != null && startNode.value.indexOf(end) == -1){
				startNode.value.push(end);
			}
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
					value = {value: [], data: [w]};
					this.get("wordsIndex").push(key);
				}else{
					value = JSON.parse(value);
					if ( value.data.indexOf(w) == -1 ){
						value.data.push(w);
					}
				}
				localStorage.setItem(key,JSON.stringify(value));
			}
			localStorage.setItem("wordsIndex",JSON.stringify(this.get("wordsIndex")));
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
					value = {value: [], data: [w]};
					this.get("morphemesIndex").push(key);
				}else{
					value = JSON.parse(value);
					if ( value.data.indexOf(w) == -1 ){
						value.data.push(w);
					}
				}
				localStorage.setItem(key,JSON.stringify(value));
			}
			localStorage.setItem("morphemesIndex", JSON.stringify(this.get("morphemesIndex")));
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
					value = {value: [], data: [w]};
					this.get("glossesIndex").push(key);
				}else{
					value = JSON.parse(value);
					if ( value.data.indexOf(w) == -1 ){
						value.data.push(w);
					}
				}
				localStorage.setItem(key,JSON.stringify(value));
			}
			localStorage.setItem("glossesIndex",JSON.stringify(this.get("glossesIndex")));
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
					value = {value: [], data: [w]}
					this.get("translationsIndex").push(key);
				}else{
					value = JSON.parse(value);
					if ( value.data.indexOf(w) == -1 ){
						value.data.push(w);
					}
				}
				localStorage.setItem(key,JSON.stringify(value));
			}
			localStorage.setItem("translationsIndex",JSON.stringify(this.get("translationsIndex")));
		}
	
	}); 
	
	return Lexicon; 
	
}); 
