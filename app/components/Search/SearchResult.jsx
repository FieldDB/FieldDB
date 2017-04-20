import React, { Component } from 'react'
import { LanguageDatum } from 'fielddb/api/datum/LanguageDatum'
import IGT from '../Datum/IGT.jsx'
import ParallelText from '../Datum/ParallelText.jsx'

class SearchResult extends Component {

  componentDidMount () {
    this.render()
  }

  render () {
    const result = this.props.result.toJS()
    const datum = new LanguageDatum(result)
    const maxScore = datum.maxScore || 1
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
        <div className='accordion-group'>
          <div className='accordion-heading'>
            <a className='accordion-toggle' data-toggle='collapse' data-parent={'#accordion-' + result._id + '-embedded'}
              href={'#collapse-' + result._id}
              name={result._id}
              title={datum.context}>
              <input type='range' value={result.score * 10} min='0' max={maxScore} disabled />
              <br />

              <span dangerouslySetInnerHTML={{
                __html: summary
              }} />
              <span>{datum.translation}</span>
            </a>
          </div>
          <div className='accordion-body collapse' id={'collapse-' + result._id} >
            <div className='accordion-inner igt-area'>
              <p className='igt'>
                <label>Interlinear Glossed Text: </label>
                {
      igt.tuples.map((tuple) => {
        const id = tuple.id ? tuple.id : Math.random() * 100
        return (
          <IGT key={id} igt={tuple} fields={datum.fields} />
        )
      })
      }
              </p>
              <p className='parallel-text'>
                <label>Parallel Text: </label>
                <i>
                  <ParallelText parallelText={igt.parallelText} />
                </i></p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SearchResult.propTypes = {}

export default SearchResult
