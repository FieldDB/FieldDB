var Import = Backbone.Model.extend(
/** @lends Comment.prototype */
{
	/**
	 * @class The import class helps import csv, xml and raw text data into a corpus, or create a new corpus. 
	 *
	 * @property {FileList} files These are the file(s) that were dragged in.
	 * @property {String} corpusid This is the corpusid where the data should be imported
	 * @property {Array} fields The fields array contains titles of the data columns.
	 * @property {Collection} datalist the datalist imported, to hold the data before it is saved.
	 * @property {Event} event The drag/drop event.
	 * 
	 * @description The intialize serves to bind import to all drag and drop events. 
	 *
	 * @extends Backbone.Model
	 * @constructs
	 */
	initialize : function() {
		var output = [];
		var files = this.get("files");
		debug(files);
		for ( var i = 0, f; f = files[i]; i++) {
			output.push('<li><strong>', escape(f.name), '</strong> (', f.type
					|| 'n/a', ') - ', f.size, ' bytes, last modified: ',
					f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString()
							: 'n/a', '</li>');
		}
		var status = document.getElementById('status');
		if( status == null){
			status = document.createElement("div");
		}
		status.innerHTML += '<ul>' + output.join('') + '</ul>';
		
		this.on('all', function(e) {
			debug("Import event: " + e);
		});
	},

	// This is an list of attributes and their default values
	defaults : {
		corpusid : "",
		files : [],
		fields : [],
		dataList : []
	},

	/**
	 * Describe the validation here.
	 *
	 * @param {Object} attributes The set of attributes to validate.
	 *
	 * @returns {String} The validation error, if there is one. Otherwise, doesn't
	 * return anything.
	 */
	validate : function(attributes) {

	},
	importCSV : function() {

	},
	importXML : function() {

	},
	importText : function() {

	}
});
