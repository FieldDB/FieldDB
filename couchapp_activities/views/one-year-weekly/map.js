Date.prototype.getWeek = function(dowOffset) {
  dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0;
  var newYear = new Date(this.getFullYear(), 0, 1);
  var day = newYear.getDay() - dowOffset;
  day = (day >= 0 ? day : day + 7);
  var daynum = Math.floor((this.getTime() - newYear.getTime() -
    (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
  var weeknum;
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      nYear = new Date(this.getFullYear() + 1, 0, 1);
      nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      weeknum = nday < 4 ? 1 : 53;
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
};

var yearagoms = new Date().getTime() - 31557600000;
var r1 = /(<([^>]+)>)/ig;
var r2 = /[ \t]+$/;

function (doc) {
  if (doc.collection == 'activities' || doc.teamOrPersonal) {
    var thistime = new Date(doc.timestamp);
    if (thistime >= yearagoms) {
      var wk = thistime.getWeek();
      if(doc.verb.indexOf("attempt") > -1){
        return;
      } else if(doc.verb.indexOf("updated") > -1){
        //v1.90 uses modified instead
         emit({action: "modified", week: wk}, 1);
      } else {
        emit({action: doc.verb.replace(r1, '').replace(r2, ''), week: wk}, 1);
      }

    }
  }
}
