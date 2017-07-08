import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import React, { Component } from 'react'
import { DataList } from 'fielddb/api/data_list/DataList'
import { Corpus } from 'fielddb/api/corpus/Corpus'
import { CorpusMask } from 'fielddb/api/corpus/CorpusMask'
import { LanguageDatum } from 'fielddb/api/datum/LanguageDatum'
import { CORS } from 'fielddb/api/CORS'
import { requestSampleData } from '../../../config/offline'

requestSampleData({
  // offline: 'true in search index'
})

function windowOnly (value, size) {
  if (!value || typeof value.substring !== 'function') {
    return value
  }
  return value.substring(0, size)
}

import { LOADED_SEARCH_RESULTS } from './actions'
let defaultCorpus

function updateCorpusField (field) {
  if (!defaultCorpus) {
    defaultCorpus = new CorpusMask(Corpus.prototype.defaults)
  }
  if (!field.type && defaultCorpus.datumFields[field.id]) {
    field.type = defaultCorpus.datumFields[field.id].type
  }
  return field
}

class SearchContainer extends Component {
  constructor (props) {
    super(props)
    const searchIn = this.props.params.searchIn || ''
    this.state = {
      searchIn: searchIn,
      reindex: {
        className: 'hide'
      }
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleReindex = this.handleReindex.bind(this)
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
  }

  static fetchData ({store, params, history, urls}) {
    return SearchContainer.search({
      params,
      urls,
      store
    })
  }

  componentDidMount () {
    // console.log('search container mounted ', this.props)
    // this.props.loadSearchResults({
    //   datalist: {
    //     id: Date.now(),
    //     'title': 'trying to force render',
    //     docs: []
    //   }
    // })
    // let {searchIn, dbname} = this.props.params
  }

  handleReindex () {
    this.state.reindex = {
      progress: 0,
      show: true,
      total: 100
    }

    const url = this.props.corpus.getIn(['lexicon', 'url']) + '/search/' + this.props.corpus.get('dbname') + '/index?limit=50'
    return CORS.makeCORSRequest({
      method: 'post',
      url: url,
      withCredentials: false,
      onprogress: (progress) => {
        this.state.reindex.total = progress.total
        this.state.reindex.progress = progress.loaded
      // this.state.reindex.progress = percent * this.state.reindex.total / 100
      }
    // data: {}
    }).then(function (response) {
      const total = response.couchDBResult.rows.length
      this.state.total = total
      this.state.progress = total
      setTimeout(() => {
        this.state.show = false
      })
    }).catch(function (err) {
      this.state.statusText = err.message
      this.state.progress = 100
      this.state.total = 100
      setTimeout(() => {
        this.state.show = false
      })
    })
  }

  clearresults () {
    // $('#clearresults').hide()
  }

  handleSearchSubmit (e) {
    e.preventDefault()
    const searchIn = this.state.searchIn || ''
    const location = `/${this.props.params.teamname}/${this.props.params.dbname}/search/${searchIn}`
    // this.render(location)
    browserHistory.push(location)
    const corpus = new CorpusMask(this.props.corpus.toJS())
    const urls = {
      lexicon: {
        url: this.props.corpus.getIn(['lexicon', 'url'])
      }
    }
    SearchContainer.search({
      params: {
        searchIn: searchIn
      },
      loadSearchResults: this.props.loadSearchResults,
      corpus,
      urls
    })
  }

  handleChange (event) {
    this.setState({
      searchIn: event.target.value
    })
  }

  static search ({params, urls, store, corpus, loadSearchResults}) {
    corpus = corpus || new CorpusMask(store.getState().corpusMaskDetail.toJS())
    if (!corpus.datumFields || !corpus.datumFields.length) {
      console.warn('Datum fields were not defined on this corpus', corpus)
      corpus.datumFields = []
    }
    corpus.datumFields.map(updateCorpusField)

    const url = urls.lexicon.url + '/search/' + corpus.dbname
    let searchIn = decodeURIComponent(params.searchIn || '')
    let searchWarning = ''
    // help with copy paste
    if (searchIn) {
      searchIn = searchIn.toLowerCase().replace(/\s*:\s*/, ':').replace(/ and /g, ' AND ').replace(/ or /g, ' OR ')
    }
    if (searchIn && searchIn.indexOf(':') === -1) {
      // Default to search in all fields
      searchIn = corpus.datumFields.map(function (field) {
        return `${field.id}:${searchIn}`
      }).join(' OR ')
      searchWarning = `You searched for ${params.searchIn}, by default this will search in all the fields of this corpus. You might want to search only one field eg: morphemes:${params.searchIn}.
`
    }
    const id = searchIn || 'all data'
    // console.log('requesting search of ', url, params, urls, store)
    return CORS.makeCORSRequest({
      method: 'post',
      url: url,
      withCredentials: false,
      data: {
        query: searchIn
      }
    })
      .then(function (response) {
        // console.log('search response', response)
        // console.log('search response', response)
        const datalist = new DataList({
          id: id,
          corpus: corpus,
          title: 'Search Results: ' + id,
          dbname: corpus.dbname,
          description: new Date(),
          docs: []
        })
        datalist.id = datalist.id.trim().toLowerCase().replace(/[^a-z]/g, '_')

        response.hits.hits.forEach(function (result) {
          const datum = new LanguageDatum({
            id: result._id,
            corpus: corpus,
            // this exposes only the public fields
            fields: corpus.datumFields.clone(),
            session: {
              // this exposes only the public fields
              fields: corpus.sessionFields.clone()
            }
          })
          // datum.merge('self', result)
          // datum.corpus = corpus;
          datum.maxScore = response.hits.max_score
          if (datum.maxScore !== 1) {
            datum.maxScore = datum.maxScore * 10
          }

          for (let attribute in result._source) {
            if (!result._source.hasOwnProperty(attribute)) {
              continue
            }
            // Prioritze fields before setting attributes on the datum
            // This ensures novel parallelText fields appear in the UI
            if (datum.fields[attribute]) {
              datum.fields[attribute].value = windowOnly(result._source[attribute], 200)
            } else if (datum.session && datum.session.fields[attribute]) {
              // console.log('setting session field ', attribute)
              datum.session.fields[attribute].value = windowOnly(result._source[attribute])
            } else {
              // console.log('setting attribute', attribute)
              datum[attribute] = windowOnly(result._source[attribute])
            }
          }

          // console.log('setting highlights', result.highlight)
          for (let field in result.highlight) {
            if (!result.highlight.hasOwnProperty(field) || !result.highlight[field]) {
              continue
            }
            datum.fields[field].highlighted = result.highlight[field]
          }
          // datum.debugMode = true;
          datum.igtCache = datum.igt
          datalist.add(datum)
        })

        datalist.description = searchWarning + 'Showing ' + datalist.length + ' of ' + response.hits.total + ' results, you can click on any of the items to see more details to further refine your search.'

        return datalist
      })
      .catch(function (err) {
        if (err.userFriendlyErrors && err.userFriendlyErrors[0] === 'no such index') {
          console.log('This db has not been indexed, most likely it is private. ', err)
          return new DataList({
            id: id,
            corpus: corpus,
            title: `Unable to search ${corpus.title}: ${id}`,
            dbname: corpus.dbname,
            description: corpus.description || '',
            docs: []
          })
        }
        console.log('error in search ', err)
        throw err
      })
      .then(function (datalist) {
        if (!datalist) {
          return datalist
        }

        const datalistObject = datalist.toJSON()
        datalistObject.docs = datalist.docs.toJSON()

        if (store) {
          store.dispatch({
            type: LOADED_SEARCH_RESULTS,
            payload: {
              datalist: datalistObject
            }
          })
        } else {
          loadSearchResults({
            datalist: datalistObject
          })
        }

        return datalist
      })
  }

  render () {
    const {corpus} = this.props

    if (this.state.err) {
      return (
        <div className={this.props.className}>
          Error: {this.state.err.message}
        </div>
      )
    }
    if (!corpus || !corpus.get('lexicon')) {
      return (
        <div className={this.props.className}>
          Search bar
        </div>
      )
    }

    return (
      <div className={this.props.className}>
        <form
          action={`/${this.props.params.teamname}/${this.props.params.dbname}/search/${this.state.searchIn}`}
          onSubmit={this.handleSearchSubmit}
          method='GET' encType='application/json'
          className='search-form form-inline'>
          <input type='text'
            id='searchIn'
            name='searchIn'
            onBlur={this.handleChange}
            onChange={this.handleChange}
            placeholder='morphemes:nay OR gloss:des'
            defaultValue={this.props.params.searchIn}
            title='Enter your query using field:value if you know which field you want to search, otherwise you can click Search to see 50 results' />
          <button type='submit'
            id='corpus_search'
            className='btn btn-small btn-success'>
            <i className='icon-search icon-white' />
          Search…
        </button>
        </form>
        <button type='button'
          onClick={this.handleReindex}
          className='btn btn-small btn-info'>
          <i className='icon-refresh icon-white' /> Rebuild search lexicon
        </button>
        <div id='search-progress-bar'
          className={'search-progress-bar' + this.state.reindex.className}
          min='0'
          max={this.state.reindex.total}
          value={this.state.reindex.progress} >
          <div id='inner-search-progress-bar' className='inner-search-progress-bar'>
            <strong>{this.state.reindex.statusText}</strong> {this.state.reindex.total} records indexed
        </div>
        </div>
        <span id='clearresults' className='hide'>
          <button type='button'
            id='clear_results'
            onClick={this.clearResults}
            className='btn btn-small btn-danger'>
            <i className='icon-remove icon-white' /> Clear…
          </button>
        </span>
      </div>
    )
  }
}

SearchContainer.propTypes = {
  className: React.PropTypes.string,
  corpus: React.PropTypes.object.isRequired,
  loadSearchResults: React.PropTypes.func.isRequired,
  params: React.PropTypes.object.isRequired
}

function mapStateToProps (state) {
  // console.log('search container map state to props')
  return {
    corpus: state.corpusMaskDetail
  }
}

function mapDispatchToProps (dispatch) {
  return {
    loadSearchResults: (datalist) => {
      // console.log('calling loadSearchResults', datalist)
      return dispatch({
        type: LOADED_SEARCH_RESULTS,
        payload: datalist
      })
    }
  }
}

export { SearchContainer }
export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer)
