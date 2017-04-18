import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadUserMaskDetail } from './actions'
import Helmet from 'react-helmet'
import { browserHistory } from 'react-router'

class UserMask extends Component {
  static fetchData({store, params, history}) {
    let {dbname} = params
    return store.dispatch(loadUserMaskDetail({
      dbname,
      history
    }))
  }
  componentDidMount() {
    let {dbname} = this.props.params
    this.props.loadUserMaskDetail({
      dbname,
      history: browserHistory
    })
  }
  render() {
    let clearResults = function() {}
    let reindex = function() {}
    let {userMask} = this.props
    let title = `${userMask.get('name')}`
    return (
      <div>
      <Helmet title={title} description={userMask.get('description')}/>
      <div className="row">
        <div className="span3">
          <p className="text-center">
            <img src="https://secure.gravatar.com/avatar/{userMask.get('gravatar')}.jpg?s=200&amp;d=identicon&amp;r=pg" alt="Your gravatar.com profile image" className="img-polaroid" />
          </p>
          <div>
            <h1>{userMask.get('name')}</h1>
            <p>{userMask.get('username')}</p>
          </div>
          <div className="well well-small">
            <dl>
              <dt><i className="icon-folder-open"></i>  Interests:</dt>
              <dd>{userMask.get('researchInterest')}</dd>
              <dt><i className="icon-user"></i>  Affiliation:</dt>
              <dd>{userMask.get('affiliation')}</dd>
              <dt><i className="icon-comment"></i>  Description:</dt>
              <dd>{userMask.get('description')}</dd>
            </dl>
          </div>
        </div>
        <div className="span6 offset1">
          <h1>Corpora</h1>
          <br />
          { /* {#each userMask.get('corpora.collection')}
          <div style="margin-bottom:40px" className="media">
            <a href="{this.website')}" className="pull-left"><img src="https://secure.gravatar.com/avatar/{this.gravatar')}.jpg?s=96&amp;d=retro&amp;r=pg" alt="Corpus image" className="media-object"></a>
            <div className="media-body">
              <h4 className="media-heading"><a href="{this.website')}">{this.title')}</a></h4>
              <p>{this.description')}</p>
            </div>
          </div>
          {/each')} */ }

        </div>
      </div>
      <div className="row">
        <div className="span12">
          <h2>Activity Feed</h2>
          <iframe src={'/corpus-pages/libs/activities_visualization/index.html?' + userMask.get('username')} width="100%" height="300" frameborder="0" allowtransparency="true"></iframe>
        </div>
      </div>
      <hr />
      <footer>
        <p>© {userMask.get('username')}  {userMask.get('startYear')}  2017
          <a href="http://creativecommons.org/licenses/by/3.0/" rel="license" title="Creative Commons Attribution 3.0 License">link 
            <img src="//i.creativecommons.org/l/by/3.0/88x31.png" alt="License" />
          </a>
        </p>
      </footer>
    </div>
    )
  }
}

function mapStateToProps(state) {
  console.log('userMaskdetail map state to props', state)
  return {
    userMask: state.userMaskDetail
  }
}

UserMask.propTypes = {
  params: React.PropTypes.object.isRequired,
  loadUserMaskDetail: React.PropTypes.func.isRequired,
  userMask: React.PropTypes.object.isRequired
}

export { UserMask }
export default connect(mapStateToProps, {
  loadUserMaskDetail
})(UserMask)
