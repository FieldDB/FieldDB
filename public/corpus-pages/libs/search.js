function reindex(dbname) {
  var lexicon = {
    url: $('#searchCorpus').data('lexicon-url')
  };

  $('#innerProgressBar').width(0).html('&nbsp;');
  $('#progressBar').css('display', 'inline-block');
  $('#progressBar').show();
  var url = lexicon.url + '/search/' + dbname + '/index';
  var checks = 0;

  $.post(url, JSON.stringify({})).done(function(response) {
    var total = response.couchDBResult.rows.length;
    $('#innerProgressBar').width($('#progressBar').width());
    $('#innerProgressBar').html('<strong>' + total + '</strong> records indexed.&nbsp;&nbsp;');
    $('#progressBar').delay(9000).hide(600);
  }).fail(function(err) {
    $('#innerProgressBar').width($('#progressBar').width());
    $('#innerProgressBar').css('font-size', '.7em').html('<strong>' + err.statusText + ':</strong> 0 records indexed.&nbsp;&nbsp;');
    $('#progressBar').delay(9000).hide(600);
    console.log('Error from trainings ', err);
  });
}

function progress(percent, $element) {
  var progressBarWidth = percent * $element.width() / 100;
  $('#innerProgressBar').width(progressBarWidth).html(percent + '%&nbsp;');
}

function clearresults() {
  $('#dataresult').hide();
  $('#clearresults').hide();
}

var searchForm = $('#searchCorpus');
searchForm.submit(function() {

  var data = searchForm.serializeArray()[0];
  var url = searchForm.attr('action');
  console.log(data);
  $.post(url, data).done(function(response) {
    console.log(response);
    $('#dataresult').show();
    $('#clearresults').show();
    $('#dataresult').JSONView(JSON.stringify(response.hits));
  }).fail(function(err) {
    $('#dataresult').show();
    $('#clearresults').show();
    $('#dataresult').JSONView(JSON.stringify(err));
    console.log('Error from search ', err);
  });

  return false;

});
