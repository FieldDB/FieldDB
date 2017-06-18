import marked from 'marked'
import React, { Component } from 'react'
import SearchResult from '../Search/SearchResult.jsx'

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
})

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
    const json = JSON.stringify(this.props.datalist.toJS(), null, 2)
    const datalistId = this.props.datalist.get('id')
    let hidden = ''
    if (!docs || !docs.length) {
      hidden = 'hidden'
    }
    return (
      <div className={this.props.className}>
        <div className='span11'>
          <h3>{this.props.datalist.get('title')}</h3>
          <p dangerouslySetInnerHTML={{
            __html: marked(this.props.datalist.get('description') || '')
          }} />
          <ul className={`nav nav-tabs ${hidden}`}>
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
            <div className={`tab-pane ${hidden}`} id={'json-' + datalistId}>
              <pre className='search-result-json well well-small'>{json}</pre>
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
