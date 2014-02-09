define( [ 
    "backbone", 
    "../datum/Datum", 
    "recording/Recording",
    "recordings/Recordings"
//    "../user/User"
], function(
    Backbone,
    Datum, 
    Recording, 
    Recordings
//    User
    ) {
  var Exercise = Datum.extend(
   {
    /**
     * @class An Exercise is a type of Datum. It has the same information as a Datum plus extra,
     * but we want some info (e.g. recordings) to be kept confidential.
     *
     * @name { String :Exercise}
     * @property {String} timesListened This is number of times the whole AudioVideo has been listened to by a specific user
     * 
     * @property {Date} lastListened This is the date of the last time the student listened to this Exercise
     * 
     * @property {RecordArray} recordings This is the array of all the recordings made by the student
     * each recording will have an accuracyRating (a percentage saying how close to the student's recording is compared to the Datum's sound)
     * each recording will have privacy settings to be determined by the student
     * each recording will say who recorded it
     * each recording will say what date it was recorded
     * the RecordArray will tell us how many recordings it has in it.
     * 
     * @property {User} To be replaced by either student or teacher, but for the moment we just use User to get its ID.
	 * maybe we don't need User because it'd be in Session, which is in Datum.
	 * ? @property {String} student This is the ID of the student whose progress we're tracking
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function() {
//      Exercise.__super__.initialize.call(this,);

//      this.set("user", "");
      this.set("lastListened", new Date(JSON.parse(t)));
      this.set("timesListened", "");
      //make the array of recordings
      
    },
    
    internalModels : {
      // recordAudio  :  RecordAudio
      // compareAudio  :  CompareAudio
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return Exercise;
}); 



