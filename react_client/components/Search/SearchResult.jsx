import React, { Component } from 'react'
import { LanguageDatum } from 'fielddb/api/datum/LanguageDatum'
import IGT from '../Datum/IGT.jsx'
import Media from '../Media'
import ParallelText from '../Datum/ParallelText.jsx'

class SearchResult extends Component {

  componentDidMount () {
    this.render()
  }

  render () {
    const result = this.props.result.toJS()
    const datum = new LanguageDatum(result)
    datum.media = datum.media || []
    const maxScore = datum.maxScore || 1
    let summary = []

    datum.fields.map(function (field) {
      if (field.highlighted) {
        summary = summary.concat(field.highlighted)
      }
    })

    // datum.debugMode = true;
    const igt = datum.igtCache || datum.igt
    // console.log('render search datum', igt)
    return (
      <div >
        <div className='accordion-group'>
          <div className='accordion-heading'>
            <span className='accordion-toggle' data-toggle='collapse' data-parent={'#accordion-' + this.props.datalistId + '-' + datum._id + '-embedded'}
              href={'#collapse-' + this.props.datalistId + '-' + datum._id}
              name={datum._id}
              title={datum.context}>
              <input type='range' value={result.score * 10} min='0' max={maxScore} disabled />
              <br />
              {
      summary.length ? summary.map((summaryLine) => {
        return (
          <span key={summaryLine}>
            <span key={summaryLine} dangerouslySetInnerHTML={{
              __html: summaryLine
            }} />
            <br />
          </span>
        )
      }) : <ParallelText parallelText={igt.parallelText} />
      }

              {
      datum.media.map((media) => {
        return (
          <Media key={media.filename} media={media} corpus={this.props.corpus} />
        )
      })
      }
            </span>
          </div>
          <div className='accordion-body collapse' id={'collapse-' + this.props.datalistId + '-' + datum._id} >
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

SearchResult.propTypes = {
  corpus: React.PropTypes.object.isRequired,
  datalistId: React.PropTypes.string.isRequired,
  result: React.PropTypes.object.isRequired
}

export default SearchResult
