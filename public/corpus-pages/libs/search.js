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
  $('#search-result-area').hide();
  $('#clearresults').hide();
}

var searchForm = $('#searchCorpus');
searchForm.submit(function() {

  var data = searchForm.serializeArray()[0];
  var url = searchForm.attr('action');
  console.log(data);
  $.post(url, data).done(function(response) {
    console.log(response);
    $('#search-result-area').show();
    $('#clearresults').show();
    $('#search-result-json').JSONView(JSON.stringify(response.hits));
    $('#search-result-highlight').html("");

    var field;
    var summary;
    var datum;
    var corpus = new FieldDB.Corpus(FieldDB.Corpus.prototype.defaults);
    var igt;
    var view;
    var igtView;
    var original;
    var isEmpty = function(value) {
      return value;
    };
    response.hits.hits.forEach(function(result) {
      summary = [];
      datum = new FieldDB.LanguageDatum({
        _id: result._id,
        corpus: corpus,
        fields: corpus.datumFields.clone()
      });
      // datum.debugMode = true;
      for (attribute in result._source) {
        if (!result._source.hasOwnProperty(attribute)) {
          continue;
        }
        datum[attribute] = result._source[attribute];
      }
      // igt = datum.igt;
      for (field in result.highlight) {
        if (!result.highlight.hasOwnProperty(field)) {
          continue;
        }
        summary.push(result.highlight[field]);

        if (result.highlight[field]) {
          original = datum[field];
          datum[field] = result.highlight[field].join(' ');
          // if (corpus.datumFields[field].type.indexOf('IGT') > -1) {
          //   datum[field] = original;
          // }
        }
      }
      igt = datum.igt;
      console.log(igt);

      igtView = igt.tuples.map(function(tuple) {
        return '        <span class="glossCouplet">' +
          corpus.datumFields.map(function(corpusField) {
            return tuple[corpusField.id];
            // return result.highlight[corpusField.id] ? result.highlight[corpusField.id] : tuple[corpusField.id];
          }).filter(isEmpty).join(' <br/>') +
          '        </span>';
      }).join(' ');

      view = '<div class="accordion-group">' +
        '    <div class="accordion-heading">' +
        '      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion-' +
        result._id +
        '-embedded" href="#collapse-' + result._id + '"> <input type="range" value="' + result._score * 10 + '" min="0" max="' + response.hits.max_score * 10 + '" disabled=""/><br/> ' +
        summary.join('<br/>') +
        '      </a>' +
        '    </div>' +
        '    <div class="accordion-body collapse" id="collapse-' + result._id + '">' +
        '      <div class="accordion-inner igt-area">' +
        igtView +
        '        <br/><i>' +
        datum.translation +
        '        </i>' +
        '      </div>' +
        '    </div>' +
        '  </div>';
      $('#search-result-highlight').append(view);
    });
  }).fail(function(err) {
    $('#search-result-area').show();
    $('#clearresults').show();
    $('#search-result-highlight').html("Please try again");
    $('#search-result-json').JSONView(JSON.stringify(err));
    console.log('Error from search ', err);
  });

  return false;

});
