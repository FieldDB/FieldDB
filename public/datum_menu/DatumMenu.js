var DatumMenu = Backbone.Model.extend(
/** @lends DatumMenu.prototype */
{
   /**
    * @class <The DatumMenu is a set of functions that are associated with an individual datum.  This menu appears on the datum widget in addition to the list view where the user can apply Datum functions (such as star) in bulk. >
    *
    *
    * @description <The initialize function brings up the menu.>
    * @extends Backbone.Model
    * @constructs
    */
   initialize: function() {
      this.bind('error', function(model, error) {
         // TODO Handle validation errors
      });

      // TODO Set up any other bindings (i.e. what to do when certain Events 
      //      happen). Example:
      // this.bind("change:someAttribute", function() {
      //    console.log("We just changed someAttribute");
      // });
     
   },
   
   
   //the following functions correspond the menu bar below the datum



    /**
    * <The status function will allow users to mark the status of a given datum, i.e. checked or needs verification.>
   */
   status: function() {
   },
   
   /**
    * <The LaTeXiT function automatically mark-ups an example in LaTeX code (\exg. \"a) and then copies it on the clipboard so that when the user switches over to their LaTeX file they only need to paste it in.  >
    */
   laTeXiT: function() {
   },
   
   /**
    * <The addAudio function is a drop box in which the user can drag an audio file and link it to the relevant datum.>
    */
   addAudio: function() {
   },
   
 /**
    * <The playDatum function appears when the audio has already been added and allows the user to play the associated audio file.>
    */
    
   playDatum: function() {
   },


   /**
    * <The copyDatum function copies all datum fields to the clipboard.>
    */
   copyDatum: function() {
   },
   
   /**
    * <The starDatum function allows the user bookmark favorite data.  Adds an additional way for user's to search data without a single search term.  For instance, if the user wants to keep track of the data used in their thesis, or data that's good for their analsysis. >
    */
   starDatum: function() {
   },

    /**
    <The duplicateDatum function opens a new datum field set with the fields already filled exactly like the previous datum so that the user can minimally edit the datum.>
    */
   duplicateDatum: function() {
   },



});
















           














