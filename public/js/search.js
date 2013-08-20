function reindex(id) {

  var url = 'https://localhost:3185/train/lexicon/' + id;
  // var data = result.rows[id].key;
  console.log(url + ' // the url to trigger');

  $.post(url).done(function(response) {
    console.log(response);
  });

}
