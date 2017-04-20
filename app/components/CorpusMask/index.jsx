import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import Immutable from 'immutable'
import React, { Component } from 'react'

import { loadCorpusMaskDetail } from './actions'
import UserMask from '../UserMask/UserMask.jsx'
import DataList from '../DataList'

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
    let {corpusMask} = this.props

    if (!corpusMask || !corpusMask.get('team')) {
      return (
        <div />
      )
    }

    let title = `${corpusMask.getIn(['team', 'name'])} - ${corpusMask.get('title')}`
    return (
      <div>
        <Helmet>
          <title>{title}</title>
          <meta name='description' content={corpusMask.get('description')} />
        </Helmet>
        <div className='row-fluid'>
          <UserMask className='span3' user={corpusMask.get('team')} link={'/' + corpusMask.getIn(['team', 'username'])} />
          <div className='span9'>
            <div className='row-fluid'>
              <div className='span7 offset1'>
                <h1 className='media-heading'>{corpusMask.get('title')}</h1>
                <div className='media'>
                  <a href={corpusMask.getIn(['corpus', 'url']) + '/public-firstcorpus/_design/pages/corpus.html'} className='pull-right'>
                    <img src={'https://secure.gravatar.com/avatar/' + corpusMask.getIn(['connection', 'gravatar']) + '.jpg?s=96&d=retro&r=pg'} alt='Corpus image' className='media-object' />
                  </a>
                  <div className='media-body'>
                    <div>{corpusMask.get('description')}</div>
                  </div>
                </div>
              </div>
              <div className='span4' />
            </div>
            <div className='row-fluid'>
              <div className='span12'>
                <iframe src={'/corpus-pages/libs/activities_visualization/index.html?' + corpusMask.get('dbname')} width='100%' height='200' frameBorder='0' allowTransparency='true' />
              </div>
            </div>
            <div className='row-fluid'>
              {this.props.children}
            </div>
            <div className='row-fluid'>
              <div className='span11'>
                <ul id='search-result-area' className='nav nav-tabs hide' data-speech-url={corpusMask.getIn(['speech', 'url'])}>
                  <li className='active'>
                    <a href='#highlights' data-toggle='tab'>
                    Highlights
                  </a>
                  </li>
                  <li>
                    <a href='#json' data-toggle='tab'>
                    JSON Results
                  </a>
                  </li>
                </ul>
                <div id='search-result-area-content' className='tab-content'>
                  <div className='tab-pane active' id='highlights'>
                    {
      this.props.searchResults.map((searchResult) => {
        const id = this.props.searchResults.get('datalist') ? this.props.searchResults.get('datalist').id : Math.random();
        return (
          <DataList key={id} className='accordian' corpus={corpusMask} datalist={this.props.searchResults.get('datalist')}/>
        )
      })
      }
                  </div>
                  <div className='tab-pane ' id='json'>
                    <div id='search-result-json' className='well well-small' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <footer>
          <p>© {corpusMask.get('copyright')} {corpusMask.get('startYear')} - 2017 </p>
          <div className='tabbable'>
            <ul className='nav nav-tabs'>
              <li className='active'><a href='#terms' data-toggle='tab'>Terms of Use for {corpusMask.get('title')}</a></li>
              <li><a href='#emeldtermsreccomendations' data-toggle='tab'>Why have a Terms of Use?</a></li>
            </ul>
            <div className='tab-content'>
              <div id='terms' className='tab-pane active'>
                <p>{corpusMask.get('dbname')}</p>
                <p>{corpusMask.getIn(['termsOfUse', 'humanReadable'])}</p>
                <span>License: </span><a href={corpusMask.getIn(['license', 'link'])} rel='license' title={corpusMask.getIn(['license', 'title'])}>{corpusMask.getIn(['license', 'title'])}</a>
                <p>{corpusMask.getIn(['license', 'humanReadable'])}</p>
                <img src='//i.creativecommons.org/l/by-sa/3.0/88x31.png' alt='License' />
              </div>
              <div id='emeldtermsreccomendations' className='tab-pane'>
                <ul>
                  <li>
                    <dl>
                    EMELD digital language documentation Best Practices #7:
                    <dt>Rights</dt>
                      <dd>Resource creators, researchers and the speech communities who provide the primary data have different priorities over who has access to language resources.</dd>
                      <dt>Solution</dt>
                      <dd>Terms of use should be well documented, and enforced if necessary with encryption or licensing. It is important however to limit the duration of <a target='_blank' href='http://emeld.org/school/classroom/ethics/access.html'>access restrictions</a>: A resource whose access is permanently restricted to one user is of no long-term value since it cannot be used once that user is gone.</dd>
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
  // console.log('corpusMaskdetail map state to props', state)
  return {
    corpusMask: state.corpusMaskDetail,
    searchResults: state.searchResults || Immutable.fromJs([])
  }
}

CorpusMaskContainer.propTypes = {
  children: React.PropTypes.object.isRequired,
  params: React.PropTypes.object.isRequired,
  loadCorpusMaskDetail: React.PropTypes.func.isRequired,
  corpusMask: React.PropTypes.object.isRequired
}

export { CorpusMaskContainer }
export default connect(mapStateToProps, {
  loadCorpusMaskDetail
})(CorpusMaskContainer)
