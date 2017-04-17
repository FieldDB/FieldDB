import Express from 'express'
import path from 'path'
import debugFactory from 'debug'

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { useRouterHistory, RouterContext, match } from 'react-router'

import { createMemoryHistory, useQueries } from 'history'
import compression from 'compression'
import Promise from 'bluebird'

import configureStore from 'components/App/store'
import createRoutes from 'components/App/routes'

import { Provider } from 'react-redux'

import Helmet from 'react-helmet'

const debug = debugFactory('server');
let server = new Express()
let port = process.env.PORT || 3000
let scriptSrcs
process.env.ON_SERVER = true // TODO this is not used

let styleSrc
if (process.env.NODE_ENV === 'production') {
  // build scripts serving from dist
  let refManifest = require('../../dist/rev-manifest.json')
  scriptSrcs = [
    `/${refManifest['vendor.js']}`,
    `/${refManifest['app.js']}`
  ]
  styleSrc = `/${refManifest['app.css']}`
} else {
  // scripts serving from webpack
  scriptSrcs = [
    'http://localhost:3001/static/vendor.js',
    'http://localhost:3001/static/dev.js',
    'http://localhost:3001/static/app.js'
  ]
  styleSrc = '/app.css'
}

server.use(compression())

if (process.env.NODE_ENV === 'production') {
  server.use(Express.static(path.join(__dirname, '../..', 'dist/public')))
} else {
  server.use('/assets', Express.static(path.join(__dirname, '..', 'assets')))
  server.use(Express.static(path.join(__dirname, '../..', 'dist')))
}

server.set('views', path.join(__dirname, 'views'))
server.set('view engine', 'ejs')

// mock apis
server.get('/api/questions', (req, res) => {
  let { questions } = require('./mock_api')
  res.send(questions)
})

server.get('/api/users/:id', (req, res) => {
  let { getUser } = require('./mock_api')
  res.send(getUser(req.params.id))
})
server.get('/api/questions/:id', (req, res) => {
  let { getQuestion } = require('./mock_api')
  let question = getQuestion(req.params.id)
  if (question) {
    res.send(question)
  } else {
    res.status(404).send({ reason: 'question not found' })
  }
})

server.get('*', (req, res, next) => {
  let history = useRouterHistory(useQueries(createMemoryHistory))()
  let store = configureStore()
  let routes = createRoutes(history)
  let location = history.createLocation(req.url)

  match({ routes, location }, (error, redirectLocation, renderProps) => {
    debug('req.url ', req.url);
    function getReduxPromise () {
      let { query, params } = renderProps
      let comp = renderProps.components[renderProps.components.length - 1].WrappedComponent
      let promise = comp.fetchData
        ? comp.fetchData({ query, params, store, history })
        : Promise.resolve()

      return promise
    }

    if (redirectLocation) {
      debug('redirecting to ', redirectLocation);
      res.redirect(301, redirectLocation.pathname + redirectLocation.search)
    } else if (error) {
      debug('error ', error);
      res.status(500).send(error.message)
    } else if (renderProps == null) {
      debug('renderProps was null, not found ', renderProps);
      res.status(404).send('Not found')
    } else {
      let [ getCurrentUrl, unsubscribe ] = subscribeUrl()
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
          debug('rendering ', { metaHeader, html, scriptSrcs, reduxState, styleSrc });
          res.render('index', { metaHeader, html, scriptSrcs, reduxState, styleSrc })
        } else {
          res.redirect(302, getCurrentUrl())
        }
        unsubscribe()
      })
      .catch((err) => {
        Helmet.rewind()
        unsubscribe()
        next(err)
      })
    }
  })
  function subscribeUrl () {
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
})

server.use((err, req, res, next) => {
  console.log(err.stack)
  // TODO report error here or do some further handlings
  res.status(500).send('something went wrong...')
})

console.log(`Server is listening to port: ${port}`)
server.listen(port)
