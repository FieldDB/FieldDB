/*
 * A corpus is like a git repository, 
 * it has a remote, a name a description and perhaps a readme
 * When the user hits sync their "branch" of the corpus will be pushed to the
 * central remote, and we will show them a "diff" of what has changed.
 * 
 * The Corpus may or may not be a git repository, so this class is to abstract the functions we would expect 
 * the corpus to have, regardless of how it is really stored on the disk.
 */ 

var Corpus = function(){
	debug("Creating a new empty Corpus item.");
	this.name = "";
	this.description = "";
	this.remote = "";
	this.localFolder = "";
	this.changedDatumList = [];
	this.autoincrement = 0;
};

Corpus.prototype.initialize = function(name, description, remote){
	debug("Initializing the corpus with the paramaters passed in. name: "+name+" description: "+description+" remote url: "+remote);
	this.name = name;
	this.description = description;
	this.remote = remote;
};
Corpus.prototype.insertDatum = function(datum){
	debug("Getting this datum's id from the corpus, and adding it to the list of changed datum that must be synced. "+JSON.stringify(datum));
	datum.id = this.autoincrement;
	this.changedDatumList.push(datum);
	this.autoincrement++;
};
Corpus.prototype.updateDatum = function(datum){
	debug("Telling the corpus that this datum has changed "+ JSON.stringify(datum));
	this.changedDatumList.push(datum);
};
Corpus.prototype.push = function(){
	debug("Attempting to connect to the internet, contacting remote and sending changed datum list");
};

Corpus.prototype.pull = function(){
	debug("Attempting to connect to the internet, contacting remote and pulling down the files which have changed.");
};

Corpus.prototype.merge = function(){
	debug("The user has clicked okay, the newer version of the corpus will be saved locally, or the user's branch will be merged remotely.");
};

Corpus.prototype.diff = function(){
	debug("Showing the user the diffs between their version of the corpus and the remote version.");
};

Corpus.prototype.createSample = function(){
	this.name = "Sample Quechua Corpus";
	this.description = "This is a corpus which will let you explore the app and see how it works. \nIt contains some data from one of our trips to Cusco, Peru.";
	this.remote = "git@github.com:iLanguage/SampleFieldLinguisticsCorpus.git";
	this.localFolder= "SampleFieldLinguisticsCorpus";
};


