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
    return (
      <div className={this.props.className}>
        <h3>{this.props.datalist.get('title')}</h3>
        <p>{this.props.datalist.get('description')}</p>
        {
      docs.map((doc) => {
        const id = doc.get('id') ? doc.get('id') : Math.random() * 100
        return (
          <SearchResult key={id} corpus={this.props.corpus} result={doc} />
        )
      })
      }
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
