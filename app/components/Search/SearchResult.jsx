import React, { Component } from 'react'
import { LanguageDatum } from 'fielddb/api/datum/LanguageDatum'

function isEmpty (value) {
  return value
}

class SearchResult extends Component {

  componentDidMount () {
    this.render()
  }

  render () {
    const result = this.props.result.toJS()
    const datum = new LanguageDatum(result)
    let summary = datum.fields.map(function (field) {
      if (field.highlighted) {
        return field.highlighted.join(', ')
      }
      return ''
    }).join(',')

    //   {
    //   _id: result._id,
    //   corpus: corpus,
    //   fields: corpus.datumFields.clone()
    // })

    //
    // mediaView = renderMedia({
    //   corpus: options.corpus,
    //   media: result._source.media
    // })

    // datum.debugMode = true;

    // igt = datum.igt;

    const igt = datum.igt
    console.log('render search datum', igt)
    return (
      <div >
        {datum.id}
        <span dangerouslySetInnerHTML={{
          __html: summary
        }} />
      </div>
    )

    igtView = igt.tuples.map(function (tuple) {
      return '        <span class="glossCouplet">' +
        options.corpus.datumFields.map(function (corpusField) {
          return tuple[corpusField.id]
        // return result.highlight[corpusField.id] ? result.highlight[corpusField.id] : tuple[corpusField.id];
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
    if (!result.highlight || result.highlight.length) {
      summary = parallelTextView
    } else {
      summary = summary.join('<br/>')
    }

    if (options.maxScore !== 1) {
      scoreView = '<input type="range" value="' + result._score * 10 + '" min="0" max="' + options.maxScore * 10 + '" disabled=""/>'
    }

    context = datum.context || ''

    view = '<div class="accordion-group">' +
      '    <div class="accordion-heading">' +
      '      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion-' +
      result._id +
      '-embedded" href="#collapse-' + result._id + '" name="' + result._id + '" title="' + context + '"> ' + scoreView + '<br/> ' +
      summary +
      '      </a>' +
      '      ' +
      mediaView + '    </div>' +
      '    <div class="accordion-body collapse" id="collapse-' + result._id + '">' +
      '      <div class="accordion-inner igt-area"><p class="igt"><label>Interlinear Glossed Text: </label>' +
      igtView +
      '        </p><p class="parallel-text"><label>Parallel Text: </label><i>' +
      parallelTextView +
      '        </i></p>' +
      '      </div>' +
      '    </div>' +
      '  </div>'
  }
}

SearchResult.propTypes = {}

export default SearchResult
