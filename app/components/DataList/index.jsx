import React, { Component } from 'react'
import SearchResult from '../Search/SearchResult.jsx'

class DataList extends Component {
  render () {
    if (!this.props.datalist) {
      return (
        <div className='accordion'>
        DataList
      </div>
      )
    }

    const docs = this.props.datalist.get('docs')
    const datalistId = this.props.datalist.get('id')
    return (
      <div className={this.props.className}>
        <div className='span11'>
          <h3>{this.props.datalist.get('title')}</h3>
          <p>{this.props.datalist.get('description')}</p>
          <ul className='nav nav-tabs'>
            <li className='active'>
              <a href={'#highlights-' + datalistId} data-toggle='tab'>
              Highlights
            </a>
            </li>
            <li>
              <a href={'#json-' + datalistId} data-toggle='tab'>
              JSON Results
            </a>
            </li>
          </ul>
          <div className='tab-content'>
            <div className='tab-pane active' id={'highlights-' + datalistId}>
              <div className='accordion'>
                {
      docs.map((doc) => {
        const docId = doc.get('id') ? doc.get('id') : Math.random() * 100
        return (
          <SearchResult key={datalistId + '-' + docId} datalistId={datalistId} corpus={this.props.corpus} result={doc} />
        )
      })
      }
              </div>
            </div>
            <div className='tab-pane ' id={'json-' + datalistId}>
              <div className='search-result-json well well-small' />
            </div>
          </div>
        </div>
      </div>

    )
  }
}

DataList.propTypes = {
  className: React.PropTypes.string.isRequired,
  corpus: React.PropTypes.object.isRequired,
  datalist: React.PropTypes.object.isRequired
}

export default DataList
