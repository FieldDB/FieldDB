// import { router } from 'express'

import path from 'path'
import debugFactory from 'debug'

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { useRouterHistory, RouterContext, match } from 'react-router'

import { createMemoryHistory, useQueries } from 'history'
import Promise from 'bluebird'

import configureStore from '../app/components/App/store'
import createRoutes from '../app/components/App/routes'

import { Provider } from 'react-redux'

import Helmet from 'react-helmet'

const debug = debugFactory('route:react-render');
let scriptSrcs
process.env.ON_SERVER = true // TODO this is not used

let styleSrc
if (process.env.NODE_ENV === 'production') {
  // build scripts serving from dist
  let refManifest = require('../dist/rev-manifest.json')
  scriptSrcs = [
    `/${refManifest['vendor.js']}`,
    `/${refManifest['app.js']}`
  ]
  styleSrc = `/${refManifest['app.css']}`
} else {
  // scripts serving from webpack
  scriptSrcs = [
    '//localhost:3001/static/vendor.js',
    '//localhost:3001/static/dev.js',
    '//localhost:3001/static/app.js'
  ]
  styleSrc = '/app.css'
}

function reduxRender(req, res, next) {
  let history = useRouterHistory(useQueries(createMemoryHistory))()
  let store = configureStore()
  let routes = createRoutes(history)
  let location = history.createLocation(req.url)

  match({
    routes,
    location
  }, (error, redirectLocation, renderProps) => {
    debug('req.url ', req.url, renderProps.params);
    function getReduxPromise() {
      let {query, params} = renderProps
      let comp = renderProps.components[renderProps.components.length - 1].WrappedComponent
      let promise = comp.fetchData
        ? comp.fetchData({
          query,
          params,
          store,
          history
        })
        : Promise.resolve()

      return promise
    }

    if (redirectLocation) {
      debug('redirecting to ', redirectLocation);
      res.redirect(301, redirectLocation.pathname + redirectLocation.search)
    } else if (error) {
      debug('error ', error);
      return next(error);
    }

    if (renderProps == null) {
      debug('renderProps was null, not found ', renderProps);
      const err = new Error('Not found');
      err.status = 404;
      return next(err);
    }

    let [getCurrentUrl, unsubscribe] = subscribeUrl()
    let reqUrl = location.pathname + location.search
    debug('reqUrl ', reqUrl);

    getReduxPromise().then(() => {
      let reduxState = escape(JSON.stringify(store.getState()))
      let html = ReactDOMServer.renderToString(
        <Provider store={store}>
            { <RouterContext {...renderProps} /> }
          </Provider>
      )
      let metaHeader = Helmet.rewind()

      if (getCurrentUrl() === reqUrl) {
        debug('rendering ', {
          metaHeader,
          html,
          scriptSrcs,
          reduxState,
          styleSrc
        });
        res.render('index', {
          metaHeader,
          html,
          scriptSrcs,
          reduxState,
          styleSrc
        })
      } else {
        debug('redirecting 302 ', reqUrl);
        // const err = new Error('Error please report this ' + reqUrl);
        const err = new Error('Sorry, the page ' + reqUrl + ' you are looking for was not found.');
        err.status = 404;
        next(err);
      // res.redirect(302, getCurrentUrl())
      }
      unsubscribe()
    })
      .catch((err) => {
        Helmet.rewind()
        unsubscribe()
        next(err)
      })
  })
  function subscribeUrl() {
    let currentUrl = location.pathname + location.search
    debug('subscribeUrl currentUrl ', currentUrl);
    let unsubscribe = history.listen((newLoc) => {
      if (newLoc.action === 'PUSH' || newLoc.action === 'REPLACE') {
        currentUrl = newLoc.pathname + newLoc.search
        debug('unsubscribe currentUrl ', currentUrl);
      }
    })
    return [
      () => currentUrl,
      unsubscribe
    ]
  }
}

exports.reduxRender = reduxRender;
