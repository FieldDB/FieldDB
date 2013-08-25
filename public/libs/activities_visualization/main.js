function generateFeedTable(user) {
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

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // var data = {"rows":[{"key":{"action":"added","week":50},"value":77},{"key":{"action":"added","week":21},"value":1},{"key":{"action":"added","week":22},"value":1},{"key":{"action":"attempted","week":12},"value":1},{"key":{"action":"commented","week":12},"value":21},{"key":{"action":"downloaded","week":4},"value":6},{"key":{"action":"imported","week":12},"value":31},{"key":{"action":"modified","week":26},"value":7},{"key":{"action":"updated","week":4},"value":10},{"key":{"action":"updated","week":12},"value":13},{"key":{"action":"updated","week":21},"value":51},{"key":{"action":"updated","week":22},"value":1},{"key":{"action":"updated","week":26},"value":64},{"key":{"action":"uploaded","week":4},"value":3}]};

  $.ajax({url: '/activity/' + user, method: 'GET', success: function(data) {
    var matrix = {};
    var weeknow = new Date().getWeek();

    for (var row in data.rows) {
      matrix[data.rows[row].key.action] = matrix[data.rows[row].key.action] || [];
      if (data.rows[row].key.week <= weeknow) { //move dates to last week and before
        var diff = 52 - weeknow;
        matrix[data.rows[row].key.action][data.rows[row].key.week + diff] = data.rows[row].value;
      } else { //move dates to beginning of table
        matrix[data.rows[row].key.action][53 - data.rows[row].key.week] = data.rows[row].value;
      }
    }

    // console.log(matrix);

    var s = '<table style="table-layout:fixed !important;border-collapse:separate !important;border-spacing:2px !important;width:675px !important;font-family:monospace !important;font-size:0.75em !important;line-height:1.2em !important">';

    // Set up the 53 data columns
    s += '<col style="width:80px !important">';
    for (var i = 1; i < 53; i++) {
      s += '<col style="width:1.1em !important">';
    }

    // Add bi-monthly column descriptors
    // 2627994240 = appx 1 month in milliseconds
    s += '<tr><td>';
    var now = new Date();
    for (var i = 11; i >= 0; i--) {
      if (i % 3 === 0) {
        s += '<td colspan=5 style="text-align:right !important">';
      } else {
        s += '<td colspan=4 style="text-align:right !important">';
      }
      s += months[new Date(now.getTime() - 2627994240 * i).getMonth()] + ' ';
      s += (new Date(now.getTime() - 2627994240 * i).getFullYear() + '').slice(-2);
    }

    // Fill in data squares in either blanks, or three shades of red:
    // Darker = more transactions.
    for (var verb in matrix) {
      s += '<tr><td style="text-align:right !important;height:1em !important">' + verb;
      for (var i = 1; i < 53; i++) {
        if (matrix[verb][i] === undefined) {
          s += '<td style="background:whitesmoke !important;height:1em !important">';
        } else {
          var counts = matrix[verb][i];
          if (counts <= 10) {
            s += '<td title="' + counts + '" style="background-color:#FCC !important;height:1em !important">';
          }
          if (counts > 10 && counts <= 50) {
            s += '<td title="' + counts + '" style="background-color:#F66 !important;height:1em !important">';
          }
          if (counts > 50) {
            s += '<td title="' + counts + '" style="background-color:#C00 !important;height:1em !important">';
          }
        }
      }
    }

    s += '</table>';
    $('body').append(s);
  }});

}

$(document).ready(function() {
  var database = window.location.search.replace('?', '');
  generateFeedTable(database);
});
