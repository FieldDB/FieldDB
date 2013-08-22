function reindex(pouchname) {

  $('#thecount').html('&nbsp;&nbsp; Rebuilding index…');
  $('#thecount').show();
  var url = 'https://localhost:3185/train/lexicon/' + pouchname;
  var checks = 0;

  $.post(url).done(function(response) {

    var total = response.rows.length;
    for (var i = 0; i < total; i++) {
      (function(index) {

        var url = 'https://lexicondev.lingsync.org/' + pouchname + '/datums/' + response.rows[index].id;
        var data = response.rows[index].key;

        $.post(url, JSON.stringify(data)).done(function(response2) {
          checks++;
          if (index === total - 1) {
            $('#thecount').html('&nbsp;&nbsp;<strong>' + checks + '</strong> records indexed.');
            $('#thecount').delay(10000).hide(200);
          }
        });

      })(i);
    }

  });

}

var searchForm = $('#searchCorpus');
searchForm.submit(function() {

  var data = JSON.stringify(searchForm.serializeArray()[0]);
  $.ajax({
    type: 'POST',
    url: searchForm.attr('action'),
    contentType: 'application/json',
    data: data
  }).done(function(response) {
    console.log(response);
  });

  return false;

});
