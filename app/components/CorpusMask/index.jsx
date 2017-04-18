import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadCorpusMaskDetail } from './actions'
import Helmet from 'react-helmet'
import { browserHistory } from 'react-router'

class CorpusMaskContainer extends Component {
  static fetchData({store, params, history}) {
    let {teamname, dbname} = params
    return store.dispatch(loadCorpusMaskDetail({
      teamname,
      dbname,
      history
    }))
  }
  componentDidMount() {
    let {teamname, dbname} = this.props.params
    this.props.loadCorpusMaskDetail({
      teamname,
      dbname,
      history: browserHistory
    })
  }
  render() {
    let clearResults = function() {
      return window.clearresults();
    }
    let reindex = function(dbname) {
      return window.reindex(this.props.dbname);
    }
    let handleSearchSubmit = function(e) {
      return window.handleSearchSubmit(e);
    }
    let {corpusMask} = this.props
    let title = `${corpusMask.getIn(['team', 'name'])} - ${corpusMask.get('title')}`
    return (
      <div>
      <Helmet title={title} description={corpusMask.get('description')}/>
      <div className="row-fluid">
        <div className="span3">
          <p className="text-center">
            <a href={'/' + corpusMask.getIn(['team', 'username'])}>
              <img src={'https://secure.gravatar.com/avatar/' + corpusMask.getIn(['team', 'gravatar']) + '.jpg?s=200&d=identicon&r=pg'} alt="" className="img-polaroid" />
            </a>
          </p>
          <div>
            <h1>{corpusMask.getIn(['team', 'name'])}</h1>
            <p>{corpusMask.getIn(['team', 'username'])}</p>
          </div>
          <div className="well well-small">
            <dl>
              <dt><i className="icon-folder-open"></i>  Interests:</dt>
              <dd>{corpusMask.getIn(['team', 'researchInterest'])}</dd>
              <dt><i className="icon-user"></i>  Affiliation:</dt>
              <dd>{corpusMask.getIn(['team', 'affiliation'])}</dd>
              <dt><i className="icon-comment"></i>  Description:</dt>
              <dd>{corpusMask.getIn(['team', 'description'])}</dd>
            </dl>
          </div>
        </div>
        <div className="span9">
          <div className="row-fluid">
            <div className="span7 offset1">
              <h1 className="media-heading">{corpusMask.get('title')}</h1>
              <div className="media">
                <a href={corpusMask.getIn(['corpus', 'url']) + '/public-firstcorpus/_design/pages/corpus.html'} className="pull-right">
                  <img src={'https://secure.gravatar.com/avatar/' + corpusMask.getIn(['connection', 'gravatar']) + '.jpg?s=96&d=retro&r=pg'} alt="Corpus image" className="media-object" />
                </a>
                <div className="media-body">
                  <div>{corpusMask.get('description')}</div>
                </div>
              </div>
            </div>
            <div className="span4"></div>
          </div>
          <div className="row-fluid">
            <div className="span12">
              <iframe src={'/corpus-pages/libs/activities_visualization/index.html?' + corpusMask.get('dbname')} width="100%" height="200" frameBorder="0" allowTransparency="true"></iframe>
            </div>
          </div>
          <div className="row-fluid">
            <div className="span11 offset1">
              <form id="search-corpus" onSubmit={handleSearchSubmit} action={corpusMask.getIn(['lexicon', 'url']) + '/search/' + corpusMask.get('dbname')} data-lexicon-url="{corpusMask.getIn(['lexicon', 'url'])}" method="POST" encType="application/json" className="search-form form-inline">
                <input type="text" id="query" name="query" placeholder="morphemes:nay OR gloss:des" title="Enter your query using field:value if you know which field you want to search, otherwise you can click Search to see 50 results" />
                <button type="submit" id="corpus_search" className="btn btn-small btn-success">
                  <i className="icon-search icon-white"></i>
                  Search…
                </button>
              </form>
              <button type="button" id="corpus_build" onClick={reindex} className="btn btn-small btn-info">
                <i className="icon-refresh icon-white"></i>
                Rebuild search lexicon
              </button>
              <div id="search-progress-bar" className="search-progress-bar hide">
                <div id="inner-search-progress-bar" className="inner-search-progress-bar"></div>
              </div>
              <span id="clearresults" className="hide">
                <button type="button" id="clear_results" onClick={clearResults} className="btn btn-small btn-danger">
                  <i className="icon-remove icon-white"></i>
                  Clear…
                </button>
              </span>
            </div>
          </div>
          <div className="row-fluid">
            <div className="span11">
              <ul id="search-result-area" className="nav nav-tabs hide" data-speech-url={corpusMask.getIn(['speech', 'url'])}>
                <li className="active">
                  <a href="#highlights" data-toggle="tab">
                    Highlights
                  </a>
                </li>
                <li>
                  <a href="#json" data-toggle="tab">
                    JSON Results
                  </a>
                </li>
              </ul>
              <div id="search-result-area-content" className="tab-content">
                <div className="tab-pane active" id="highlights">
                  <div id="search-result-highlight" className="accordion">
                  </div>
                </div>
                <div className="tab-pane " id="json">
                  <div id="search-result-json" className="well well-small"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <footer>
        <p>© {corpusMask.get('copyright')}  {corpusMask.get('startYear')} - 2017 </p>
        <div className="tabbable">
          <ul className="nav nav-tabs">
            <li className="active"><a href="#terms" data-toggle="tab">Terms of Use for {corpusMask.get('title')}</a></li>
            <li><a href="#emeldtermsreccomendations" data-toggle="tab">Why have a Terms of Use?</a></li>
          </ul>
          <div className="tab-content">
            <div id="terms" className="tab-pane active">
              <p>{corpusMask.get('dbname')}</p>
              <p>{corpusMask.getIn(['termsOfUse', 'humanReadable'])}</p>
              <span>License: </span><a href={corpusMask.getIn(['license', 'link'])} rel="license" title={corpusMask.getIn(['license', 'title'])}>{corpusMask.getIn(['license', 'title'])}</a>
              <p>{corpusMask.getIn(['license', 'humanReadable'])}</p>
              <img src="//i.creativecommons.org/l/by-sa/3.0/88x31.png" alt="License" />
            </div>
            <div id="emeldtermsreccomendations" className="tab-pane">
              <ul>
                <li>
                  <dl>
                    EMELD digital language documentation Best Practices #7:
                    <dt>Rights</dt>
                    <dd>Resource creators, researchers and the speech communities who provide the primary data have different priorities over who has access to language resources.</dd>
                    <dt>Solution</dt>
                    <dd>Terms of use should be well documented, and enforced if necessary with encryption or licensing. It is important however to limit the duration of <a target="_blank" href="http://emeld.org/school/classroom/ethics/access.html">access restrictions</a>: A resource whose access is permanently restricted to one user is of no long-term value since it cannot be used once that user is gone.</dd>
                  </dl>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
    )
  }
}

function mapStateToProps(state) {
  console.log('corpusMaskdetail map state to props', state)
  return {
    corpusMask: state.corpusMaskDetail
  }
}

CorpusMaskContainer.propTypes = {
  params: React.PropTypes.object.isRequired,
  loadCorpusMaskDetail: React.PropTypes.func.isRequired,
  corpusMask: React.PropTypes.object.isRequired
}

export { CorpusMaskContainer }
export default connect(mapStateToProps, {
  loadCorpusMaskDetail
})(CorpusMaskContainer)
