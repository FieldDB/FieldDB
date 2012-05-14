var Datum = Backbone.Model.extend({
   // This is an list of attributes and their default values
   defaults: {
      // TODO set up attributes and their defaults. Example:
      // someAttribute: 5,
      // someAttribute2: 'Hello world',
      // someAttribute3: []
       

      //here are the attributes a datum minimally has to have, other fields can be added when the user designs their own fields later.
       utterance : "",
       gloss : "",
       translation : "",
       
       //not sure if this goes in default, but we need a way to link up the datum with the data from its parent, the session.
       sessionID : 0,
       
       //Preferences are where we'll have things like the extra fields the user wants.
       prefs : new Preference()
   },

   // This is the constructor. It is called whenever you make a new User.
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

   // This is used to validate any changes to the model. It is called whenever
   // user.set('someAttribute', __) is called, but before the changes are
   // actually made to someAttribute.
   validate: function(attributes) {
      // TODO Validation on the attributes. Returning a String counts as an error.
      //      Example:
      // if (attributes.someAttribute <= 0) {
      //    return "Must use positive numbers";
      // }
   },
   subtitle: function () {



   //I'm a little confused about this method....is this different from preferences?
   // TODO Add any other methods that will manipulate the User attributes.
   //      Example:
   // ,
   // addOne: function() {
   //    this.someAttribute++;
   // }
});


model = new Backbone.Model({
    data:[
        { text: "Google", href: "http://google.com" },
        { text: "Facebook", href: "http://facebook.com" },
        { text: "Youtube", href: "http://youtube.com" }
    ]
});
 
var View = Backbone.View.extend({
    initialize: function () {
        this.template = $('#list-template').children();
    },
    el: '#container',
    events: {
        "click button": "render"
    },
    render: function() {
        var data = this.model.get('data');
       
        for (var i=0, l=data.length; i<l; i++) {
            var li = this.template.clone().find('a').attr('href', data[i].href).text(data[i].text).end();
            this.$el.find('ul').append(li);
        }
    }
});
 
var view = new View({ model: model });










/**
 * Created with JetBrains WebStorm.
 * User: mdotedot
 * Date: 12-04-20
 * Time: 1:26 PM
 * To change this template use File | Settings | File Templates.
 */

/*

//TODO
If we're using backbone, does this mean that we won't be using these functions anymore?? 

var Datum = Datum || {};

Datum.render = function(divid){
           
};

Datum.update = function(){

};

Datum.create = function(){

};

Datum.delete = function(){

};

Datum.laTeXiT = function(){

};

Datum.addAudio= function(){

};

Datum.export= function(){

};

Datum.sync = function(){

}*/
