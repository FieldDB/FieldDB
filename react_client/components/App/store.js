import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import apiMiddleware from '../../middleware/api'
import rootReducer from './reducer'

const logger = createLogger({
  level: 'info',
  collapsed: false,
  logger: console,
  predicate: (getState, action) => true
})

let middlewares = [
  thunkMiddleware,
  apiMiddleware
]

if (process.env.NODE_ENV !== 'production') {
  middlewares = [...middlewares, logger]
}

const createStoreWithMiddleware = applyMiddleware(
  ...middlewares
)(createStore)

export default function configureStore (initialState) {
  const store = createStoreWithMiddleware(rootReducer, initialState)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducer', () => {
      const nextRootReducer = require('./reducer')
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
