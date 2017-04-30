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


if (FieldDB && FieldDB.FieldDBObject) {
  FieldDB.FieldDBObject.confirm = function(message, optionalLocale) {
    var deferred = FieldDB.Q.defer();
    console.warn('not confirming', message);
    deferred.reject({
        message: message,
        optionalLocale: optionalLocale,
        response: null
      });
    return deferred.promise;
  };
  FieldDB.FieldDBObject.prompt = function(message, optionalLocale, providedInput) {
    var deferred = FieldDB.Q.defer();
    console.warn('not prompting', message);
    deferred.reject({
        message: message,
        optionalLocale: optionalLocale,
        response: null
      });
    return deferred.promise;
  };
}
