import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

class App extends Component {
  render() {
    return (
      <div>
        <Helmet
      defaultTitle='LingSync.org'
      titleTemplate='%s - LingSync.org'
      meta={[
        {
          'name': 'description',
          'content': 'Public pages for LingSync.org corpora'
        }
      ]}
      htmlAttributes={{
        'lang': 'en'
      }}
      />
        {this.props.children}
      </div>
    )
  }
}

App.propTypes = {
  children: React.PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps)(App)
