import 'babel-polyfill'
import { browserHistory } from 'react-router'
import Immutable from 'immutable'
import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'

import configureStore from './components/App/store'
import createRoutes from './components/App/routes'

let reduxState = {}
if (window.__REDUX_STATE__) {
  try {
    let plain = window.__REDUX_JSON__ = JSON.parse(unescape(window.__REDUX_STATE__))
    Object.keys(plain).forEach((key) => {
      const val = plain[key]
      reduxState[key] = Immutable.fromJS(val)
    })
  } catch (e) {
    console.error(e)
  }
}

const store = configureStore(reduxState)

ReactDOM.render((
  <Provider store={store}>
    { createRoutes(browserHistory) }
  </Provider>
  ), document.getElementById('root'))
