import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import React, { Component } from 'react'
import { Route, Redirect } from 'react-router'
import { DataList } from 'fielddb/api/data_list/DataList'
import { CorpusMask } from 'fielddb/api/corpus/CorpusMask'
import { LanguageDatum } from 'fielddb/api/datum/LanguageDatum'
import { CORS } from 'fielddb/api/CORS'
import { requestSampleData } from '../../../config/offline'

requestSampleData({
  offline: 'true in search index'
})

import { LOADED_SEARCH_RESULTS } from './actions'
var defaultCorpus

function updateCorpusField (field) {
  if (!defaultCorpus) {
    defaultCorpus = new CorpusMask(CorpusMask.prototype.defaults)
  }
  if (!field.type && defaultCorpus.datumFields[field.id]) {
    field.type = defaultCorpus.datumFields[field.id].type
  }
  return field
}

class SearchContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchIn: this.props.params.searchIn
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
  }

  static fetchData ({store, params, history, urls}) {
    let {searchIn, dbname} = params

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

  reindex (dbname) {
    var lexicon = {
      url: this.props.corpus.getIn(['lexicon', 'url'])
    }

    $('#inner-search-progress-bar').width(0).html('&nbsp;')
    $('#search-progress-bar').css('display', 'inline-block')
    $('#search-progress-bar').show()
    var url = lexicon.url + '/search/' + dbname + '/index'
    var checks = 0

    return CORS.makeCORSRequest({
      method: post,
      url: url,
      data: {}
    }).then(function (response) {
      var total = response.couchDBResult.rows.length
      $('#inner-search-progress-bar').width($('#search-progress-bar').width())
      $('#inner-search-progress-bar').html('<strong>' + total + '</strong> records indexed.&nbsp;&nbsp;')
      $('#search-progress-bar').delay(9000).hide(600)
    }).catch(function (err) {
      $('#inner-search-progress-bar').width($('#search-progress-bar').width())
      $('#inner-search-progress-bar').css('font-size', '.7em').html('<strong>' + err.statusText + ':</strong> 0 records indexed.&nbsp;&nbsp;')
      $('#search-progress-bar').delay(9000).hide(600)
    // console.log('Error from trainings ', err)
    })
  }

  progress (percent, $element) {
    var progressBarWidth = percent * $element.width() / 100
    $('#inner-search-progress-bar').width(progressBarWidth).html(percent + '%&nbsp;')
  }

  clearresults () {
    $('#clearresults').hide()
  }

  handleSearchSubmit (e) {
    e.preventDefault()
    const location = `/${this.props.params.teamname}/${this.props.params.dbname}/search/${this.state.searchIn}`
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
        searchIn: this.state.searchIn
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
    corpus.datumFields.map(updateCorpusField)

    var url = urls.lexicon.url + '/search/' + corpus.dbname
    // console.log('requesting search of ', url, params, urls, store)
    return CORS.makeCORSRequest({
      method: 'post',
      url: url,
      withCredentials: false,
      data: {
        query: params.searchIn
      }
    })
      .then(function (response) {
        // console.log('search response', response)
        // console.log('search response', response)
        const id = params.searchIn ? params.searchIn : 'all data'
        const datalist = new DataList({
          id: id,
          corpus: corpus,
          title: 'Search for ' + id
        })
        datalist.id = datalist.id.trim().toLowerCase().replace(/[^a-z]/g, '_')

        response.hits.hits.forEach(function (result) {
          const datum = new LanguageDatum({
            id: result._id,
            corpus: corpus,
            fields: corpus.datumFields.clone()
          })
          datum.merge('self', result)
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
              datum.fields[attribute].value = result._source[attribute]
            } else {
              // console.log('setting attribute', attribute)
              datum[attribute] = result._source[attribute]
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

        const datalistObject = datalist.toJSON()
        datalistObject.docs = datalist.docs.toJSON()
        datalistObject.description = 'Showing ' + datalist.length + ' of ' + response.hits.total + ' results, you can click on any of the items to see more details to further refine your search.'
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
      }).catch(function (err) {
      // console.log('error in search ', err)
      // this.setState({
      //   err: err
      // })
        throw err
        return {}
      })
  }

  render (redirectLocation) {
    const {corpus} = this.props

    if (redirectLocation) {
      return (
        <Redirect push to={redirectLocation} />
      )
    }

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
          onClick={this.reindex}
          className='btn btn-small btn-info'>
          <i className='icon-refresh icon-white' /> Rebuild search lexicon
        </button>
        <div id='search-progress-bar' className='search-progress-bar hide'>
          <div id='inner-search-progress-bar' className='inner-search-progress-bar' />
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
