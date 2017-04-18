import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import React, { Component } from 'react'

import Corpora from '../Corpora/Corpora.jsx'
import { loadUserMaskDetail } from './actions'
import UserMask from './UserMask.jsx'

class UserMaskContainer extends Component {
  static fetchData ({store, params, history}) {
    let {username} = params
    return store.dispatch(loadUserMaskDetail({
      username,
      history
    }))
  }
  componentDidMount () {
    let {username} = this.props.params
    this.props.loadUserMaskDetail({
      username,
      history: browserHistory
    })
  }
  render () {
    let {userMask} = this.props
    if (!userMask.get('username')) {
      const err = new Error('Sorry, a user with this username was not found, please try again.')
      err.status = 404
      throw err
    }
    return (
      <div>
        <Helmet>
          <title>{userMask.get('name')}</title>
          <meta name='description' content={userMask.get('description')} />
        </Helmet>
        <div className='row'>
          <UserMask user={userMask} className='span3' />
          <Corpora corpora={userMask.get('corpora')} className='span6 offset1' />
        </div>
        <div className='row'>
          <div className='span12'>
            <h2>Activity Feed</h2>
            <iframe src={'/corpus-pages/libs/activities_visualization/index.html?' + userMask.get('username')} width='100%' height='300' frameBorder='0' allowTransparency='true' />
          </div>
        </div>
        <hr />
        <footer>
          <p>© {userMask.get('username')} {userMask.get('startYear')}  2017
          <a href='http://creativecommons.org/licenses/by/3.0/' rel='license' title='Creative Commons Attribution 3.0 License'>link
            <img src='//i.creativecommons.org/l/by/3.0/88x31.png' alt='License' />
          </a>
          </p>
        </footer>
      </div>
    )
  }
}

function mapStateToProps (state) {
  console.log('userMaskdetail map state to props', state)
  return {
    userMask: state.userMaskDetail
  }
}

UserMaskContainer.propTypes = {
  params: React.PropTypes.object.isRequired,
  loadUserMaskDetail: React.PropTypes.func.isRequired,
  userMask: React.PropTypes.object.isRequired
}

export { UserMaskContainer }
export default connect(mapStateToProps, {
  loadUserMaskDetail
})(UserMaskContainer)
