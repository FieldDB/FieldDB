if(OPrime){
  OPrime.debug("Loading OPrime.services");
}else{
  console.log("Loading  OPrime.services");
}

/* pubsub - based on https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js*/
  angular.module("OPrime.services", []).factory('pubsub', function() {
    var cache = {};
    return {
      publish: function(topic, args) { 
        cache[topic] && $.each(cache[topic], function() {
          this.apply(null, args || []);
        });
      },

      subscribe: function(topic, callback) {
        if(!cache[topic]) {
          cache[topic] = [];
        }
        cache[topic].push(callback);
        return [topic, callback]; 
      },

      unsubscribe: function(handle) {
        var t = handle[0];
        cache[t] && d.each(cache[t], function(idx){
          if(this == handle[1]){
            cache[t].splice(idx, 1);
          }
        });
      }
    };
  });