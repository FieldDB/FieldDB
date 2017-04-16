import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'

class Intro extends Component {
  render () {
    return (
      <div className='intro'>
        <Helmet
          title='Home'
        />
        <h1>Home Page</h1>
        <div>
          <img src='/assets/images/head.png' />
        </div>
        <Link to='/questions'>to questions</Link>
      </div>
    )
  }
}

function mapStateToProps () {
  return {}
}

export default connect(mapStateToProps)(Intro)
