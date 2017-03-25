function reindex(dbname) {
  var lexicon = {
    url: $('#search-corpus').data('lexicon-url')
  };

  $('#inner-search-progress-bar').width(0).html('&nbsp;');
  $('#search-progress-bar').css('display', 'inline-block');
  $('#search-progress-bar').show();
  var url = lexicon.url + '/search/' + dbname + '/index';
  var checks = 0;

  $.post(url, JSON.stringify({})).done(function(response) {
    var total = response.couchDBResult.rows.length;
    $('#inner-search-progress-bar').width($('#search-progress-bar').width());
    $('#inner-search-progress-bar').html('<strong>' + total + '</strong> records indexed.&nbsp;&nbsp;');
    $('#search-progress-bar').delay(9000).hide(600);
  }).fail(function(err) {
    $('#inner-search-progress-bar').width($('#search-progress-bar').width());
    $('#inner-search-progress-bar').css('font-size', '.7em').html('<strong>' + err.statusText + ':</strong> 0 records indexed.&nbsp;&nbsp;');
    $('#search-progress-bar').delay(9000).hide(600);
    console.log('Error from trainings ', err);
  });
}

function progress(percent, $element) {
  var progressBarWidth = percent * $element.width() / 100;
  $('#inner-search-progress-bar').width(progressBarWidth).html(percent + '%&nbsp;');
}

function clearresults() {
  $('#search-result-area').hide();
  $('#clearresults').hide();
}


var audioExtensions = [
  '.3gp',
  '.aa',
  '.aac',
  '.aax',
  '.act',
  '.aiff',
  '.amr',
  '.ape',
  '.au',
  '.awb',
  '.dct',
  '.dss',
  '.dvf',
  '.flac',
  '.gsm',
  '.iklax',
  '.ivs',
  '.m4a',
  '.m4b',
  '.m4p',
  '.mmf',
  '.mp3',
  '.mpc',
  '.msv',
  '.opus',
  '.raw',
  '.sln',
  '.tta',
  '.vox',
  '.wav',
  '.wma',
  '.wv',
  '.ogg',
  '.oga',
  '.mogg',
  '.ra',
  '.rm',
  '.webm'
];

var imageExtensions = [
  '.jpeg',
  '.jpg',
  '.gif',
  '.png',
  '.apng',
  '.svg',
  '.bmp',
  '.ico'
];

function renderMedia(opts) {
  if (!opts.media) {
    return '';
  }
  return mediaView = opts.media.map(function(media) {
    var fileIdentifier = media.filename.substring(0, media.filename.lastIndexOf('.'));
    var extension = media.filename.replace(fileIdentifier, '');
    media.description = media.description || '';
    if ((media.type && media.type.includes('audio')) || audioExtensions.indexOf(extension) > -1) {
      return '<audio title="' + media.description + '" controls src="' + opts.speech.url + '/' + opts.corpus.dbname + '/' + fileIdentifier + '/' + media.filename + '"></audio>';
    } else if ((media.type && media.type.includes('image')) || imageExtensions.indexOf(extension) > -1) {
      return '<image title="' + media.description + '" src="' + opts.speech.url + '/' + opts.corpus.dbname + '/' + fileIdentifier + '/' + media.filename + '"/>';
    } else {
      console.log('unsupported media', media);
    }
  }).join(' ');
}

function isEmpty(value) {
  return value;
}

function renderSearchResult(options) {
  var field;
  var summary = [];
  var datum;
  var igt;
  var view;
  var igtView;
  var mediaView = '';
  var parallelTextView = '';
  var scoreView = '';
  var context;

  datum = new FieldDB.LanguageDatum({
    _id: options.result._id,
    corpus: options.corpus,
    fields: options.corpus.datumFields.clone()
  });

  mediaView = renderMedia({
    corpus: options.corpus,
    speech: options.speech,
    media: options.result._source.media
  });

  // datum.debugMode = true;
  for (attribute in options.result._source) {
    if (!options.result._source.hasOwnProperty(attribute)) {
      continue;
    }
    datum[attribute] = options.result._source[attribute];
  }

  // igt = datum.igt;
  for (field in options.result.highlight) {
    if (!options.result.highlight.hasOwnProperty(field)) {
      continue;
    }
    summary.push(options.result.highlight[field]);

    if (options.result.highlight[field]) {
      datum[field] = options.result.highlight[field].join(' ');
    }
  }

  igt = datum.igt;
  console.log(igt);

  igtView = igt.tuples.map(function(tuple) {
    return '        <span class="glossCouplet">' +
      options.corpus.datumFields.map(function(corpusField) {
        return tuple[corpusField.id];
        // return options.result.highlight[corpusField.id] ? options.result.highlight[corpusField.id] : tuple[corpusField.id];
      }).filter(isEmpty).join(' <br/>') +
      '        </span>';
  }).join(' ');

  parallelTextView = datum.translation;
  if (igt.parallelText) {
    parallelTextView = Object.keys(igt.parallelText).map(function(key) {
      return igt.parallelText[key];
    }).filter(isEmpty).join('<br/>');
  }

  // Show parallel text if user searched with out a highlight
  if (!options.result.highlight || options.result.highlight.length) {
    summary = parallelTextView;
  } else {
    summary = summary.join('<br/>')
  }

  if (options.maxScore !== 1) {
    scoreView = '<input type="range" value="' + options.result._score * 10 + '" min="0" max="' + options.maxScore * 10 + '" disabled=""/>';
  }

  context = datum.context || '';

  view = '<div class="accordion-group">' +
    '    <div class="accordion-heading">' +
    '      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion-' +
    options.result._id +
    '-embedded" href="#collapse-' + options.result._id + '" name="' + options.result._id + '" title="' + context + '"> ' + scoreView + '<br/> ' +
    summary +
    '      </a>' +
    '      ' +
    mediaView + '    </div>' +
    '    <div class="accordion-body collapse" id="collapse-' + options.result._id + '">' +
    '      <div class="accordion-inner igt-area"><p class="igt"><label>Interlinear Glossed Text: </label>' +
    igtView +
    '        </p><p class="parallel-text"><label>Parallel Text: </label><i>' +
    parallelTextView +
    '        </i></p>' +
    '      </div>' +
    '    </div>' +
    '  </div>';

  window.searchList.add(datum);
  $('#search-result-highlight').append(view);
}

var defaultCorpus = new FieldDB.Corpus(FieldDB.Corpus.prototype.defaults);

function updateCorpusField(field) {
  if (!field.type && defaultCorpus.datumFields[field.id]) {
    field.type = defaultCorpus.datumFields[field.id].type;
  }
  return field;
}

function search(corpus) {
  var speech = {
    url: $('#search-result-area').data('speech-url')
  };
  var searchForm = $('#search-corpus');
  var data = {
    query: $(searchForm).find('input[name="query"]').val()
  };
  var url = searchForm.attr('action');
  console.log(data);

  $.post(url, data).done(function(response) {
    console.log(response);
    $('#search-result-area').show();
    $('#clearresults').show();
    $('#search-result-json').JSONView(JSON.stringify(response.hits));
    $('#search-result-highlight').html('');

    window.searchList = new FieldDB.DataList({
      corpus: corpus,
      title: 'Search for ' + data.value
    });

    if (!response.hits.hits.length) {
      $('#search-result-highlight').html('No results.');
      return;
    }
    response.hits.hits.forEach(function(result) {
      renderSearchResult({
        result: result,
        corpus: corpus,
        speech: speech,
        maxScore: response.hits.max_score
      })
    });

    $('#search-result-highlight').append('<p>Showing ' + window.searchList.length + ' of ' + response.hits.total + ' results, you can click on any of the items to see more details to further refine your search</p>');
  }).fail(function(err) {
    $('#search-result-area').show();
    $('#clearresults').show();
    $('#search-result-highlight').html("Please try again");
    $('#search-result-json').JSONView(JSON.stringify(err));
    console.log('Error from search ', err);
  });
  return false;
}

$('#search-corpus').submit(function(e) {
  e.preventDefault();
  var corpus = window.corpus;
  if (corpus) {
    search(corpus);
    return false;
  }

  $.ajax(window.location.pathname).done(function(json) {
    corpus = new FieldDB.CorpusMask(json.corpusMask);
    corpus.datumFields.map(updateCorpusField);
    window.corpus = corpus;

    search(corpus);
  }).fail(function(err) {
    $('#search-result-area').show();
    $('#clearresults').show();
    $('#search-result-highlight').html("Please try again");
    $('#search-result-json').JSONView(JSON.stringify(err));
    console.log('Error from search ', err);
  });
  return false;
});
