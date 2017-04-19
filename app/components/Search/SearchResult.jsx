import React, { Component } from 'react'

function isEmpty (value) {
  return value
}

class SearchResult extends Component {
  render () {
    return (
      <div>
        SearchResult
      </div>
    )

    var field
    var summary = []
    var datum
    var igt
    var view
    var igtView
    var mediaView = ''
    var parallelTextView = ''
    var scoreView = ''
    var context

    datum = new FieldDB.LanguageDatum({
      _id: options.result._id,
      corpus: options.corpus,
      fields: options.corpus.datumFields.clone()
    })

    mediaView = renderMedia({
      corpus: options.corpus,
      media: options.result._source.media
    })

    // datum.debugMode = true;
    for (attribute in options.result._source) {
      if (!options.result._source.hasOwnProperty(attribute)) {
        continue
      }
      datum[attribute] = options.result._source[attribute]
    }

    // igt = datum.igt;
    for (field in options.result.highlight) {
      if (!options.result.highlight.hasOwnProperty(field)) {
        continue
      }
      summary.push(options.result.highlight[field])

      if (options.result.highlight[field]) {
        datum[field] = options.result.highlight[field].join(' ')
      }
    }

    igt = datum.igt
    console.log(igt)

    igtView = igt.tuples.map(function (tuple) {
      return '        <span class="glossCouplet">' +
        options.corpus.datumFields.map(function (corpusField) {
          return tuple[corpusField.id]
        // return options.result.highlight[corpusField.id] ? options.result.highlight[corpusField.id] : tuple[corpusField.id];
        }).filter(isEmpty).join(' <br/>') +
        '        </span>'
    }).join(' ')

    parallelTextView = datum.translation
    if (igt.parallelText) {
      parallelTextView = Object.keys(igt.parallelText).map(function (key) {
        return igt.parallelText[key]
      }).filter(isEmpty).join('<br/>')
    }

    // Show parallel text if user searched with out a highlight
    if (!options.result.highlight || options.result.highlight.length) {
      summary = parallelTextView
    } else {
      summary = summary.join('<br/>')
    }

    if (options.maxScore !== 1) {
      scoreView = '<input type="range" value="' + options.result._score * 10 + '" min="0" max="' + options.maxScore * 10 + '" disabled=""/>'
    }

    context = datum.context || ''

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
      '  </div>'

    window.searchList.add(datum)
    $('#search-result-highlight').append(view)
  }
}

SearchResult.propTypes = {}

export default SearchResult
