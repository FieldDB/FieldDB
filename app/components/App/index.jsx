import { connect } from 'react-redux'
import { FieldDBObject } from 'fielddb/api/FieldDBObject'
import Helmet from 'react-helmet'
import Q from 'q'
import React, { Component } from 'react'

FieldDBObject.confirm = function (message, optionalLocale) {
  const deferred = Q.defer()
  console.warn('Not confirming: ', message)
  deferred.reject({
    message: message,
    optionalLocale: optionalLocale,
    response: null
  })
  return deferred.promise
}
FieldDBObject.prompt = function (message, optionalLocale, providedInput) {
  const deferred = Q.defer()
  console.warn('Not prompting: ', message)
  deferred.reject({
    message: message,
    optionalLocale: optionalLocale,
    response: null
  })
  return deferred.promise
}

class App extends Component {
  render () {
    return (
      <div>
        <Helmet
          defaultTitle='LingSync.org'
          titleTemplate='%s - LingSync.org'
          meta={[
            {
              'name': 'description',
              'content': 'Public pages for LingSync.org corpora'
            },
            {
              'name': 'keywords',
              'content': 'Lingusitics, Fieldwork, Corpus, LingSync, Database, OpenSoure, XML, JSON'
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

function mapStateToProps (state) {
  return {}
}

export default connect(mapStateToProps)(App)
