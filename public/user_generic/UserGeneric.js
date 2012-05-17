var UserGeneric = Backbone.Model
		.extend(

		/** @lends UserGeneric.prototype */
		{
			/**
			 * @class A generic user has a repository and permission groups
			 *        (read, write, admin). It can not login.
			 * 
			 * @property {String} username This is a username used when login.
			 * @property {String} password This is a password used when login
			 * @property {String} email This is user's email
			 * @property {Url} gravatar This is user's gravatar
			 * @property {String} researchInterest This is user's field of
			 *           interest (eg. semantics etc)
			 * @property {String} affiliation This is user's affiliation
			 * @property {Array} corpora Corpora are projects, they are a
			 *           complete collection of datum. A user is associated with
			 *           projects/corpora.
			 * @property {Array} dataLists Datalists are selected parts of
			 *           corpora (eg. passives; data to be checked week etc).
			 * @property {Preference} prefs This is where we'll have things like
			 *           background/skin.
			 * 
			 * @description The initialize function probably checks to see if
			 *              the user is existing or new and creates a new
			 *              account if it is new.
			 * 
			 * @extends Backbone.Model
			 * @constructs
			 */

			// This is the constructor. It is called whenever you make a new
			// User.
			initialize : function() {
//				this.bind('error', function(model, error) {
//					// TODO Handle validation errors
//				});

			},

			// This is an list of attributes and their default values
			defaults : {
				// TODO set up attributes and their defaults. Example:
				// someAttribute: 5,
				// someAttribute2: 'Hello world',
				// someAttribute3: []
				username : "",
				password : "",
				email : "",
				gravatar : "http://imgs.abduzeedo.com/files/best_week/coderdojo-octocat3.jpeg",
				researchInterest : "",
				affiliation : "",
				description : "",
				// Corpora are projects. They are a complete collection of
				// datum.
				corpora : [],
				// Datalists are selected parts of corpora (favourites, for
				// example: passives, or data to be checked next week).
				dataLists : [],
				// Preferences are where we'll have things like background/skin
				// options.
				prefs : new Preference()
				
			},

			/**
			 * Describe the validation here.
			 * 
			 * @param {Object}
			 *            attributes The set of attributes to validate.
			 * 
			 * @returns {String} The validation error if there is one. Otherwise
			 *          doesn't return anything.
			 */

			validate : function(attributes) {

			}

		});
