import superAgent from 'superagent'
import Promise from 'bluebird'
import debugFactory from 'debug'

const debug = debugFactory('redux:middleware:api')
export const CALL_API = Symbol('CALL_API')
export const CHAIN_API = Symbol('CHAIN_API')

export default ({dispatch, getState}) => next => action => {
  if (action[CALL_API]) {
    return dispatch({
      [CHAIN_API]: [
        () => action
      ]
    })
  }

  let deferred = Promise.defer()

  if (!action[CHAIN_API]) {
    return next(action)
  }

  let promiseCreators = action[CHAIN_API].map((apiActionCreator) => {
    return createRequestPromise(apiActionCreator, next, getState, dispatch)
  })

  let overall = promiseCreators.reduce((promise, creator) => {
    return promise.then((body) => {
      return creator(body)
    })
  }, Promise.resolve())

  overall.finally(() => {
    deferred.resolve()
  }).catch((err) => {
    debug('something went wrong', err)
    deferred.reject(err)
  })

  return deferred.promise
}

function actionWith (action, toMerge) {
  let ret = Object.assign({}, action, toMerge)
  delete ret[CALL_API]
  return ret
}
const notFound = new Error('Not found')
notFound.status = 404

function createRequestPromise (apiActionCreator, next, getState, dispatch) {
  return (prevBody) => {
    let apiAction = apiActionCreator(prevBody)
    let deferred = Promise.defer()
    let params = extractParams(apiAction[CALL_API])

    if (params && params.url && params.url.match(/\.(js|css|png)/)) {
      if (params.errorType) {
        dispatch(actionWith(apiAction, {
          type: params.errorType,
          error: notFound
        }))
      }
      // return deferred.reject(notFound)
      return
    }

    debug('requesting', params)
    superAgent[params.method](params.url)
      .send(params.body)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .query(params.query)
      .end((err, res, body) => {
        if (err) {
          debug('received connection err', err)
          if (params.errorType) {
            debug('dispatching error', params.errorType)
            dispatch(actionWith(apiAction, {
              type: params.errorType,
              error: err
            }))
          }

          if (typeof params.afterError === 'function') {
            params.afterError({
              getState
            })
          }
          return deferred.reject(err)
        }

        if (res.body && res.body.status && res.body.status >= 400) {
          debug('received response which was error', res.body)
          if (params.errorType) {
            debug('dispatching error', params.errorType)
            dispatch(actionWith(apiAction, {
              type: params.errorType,
              error: res.body
            }))
          }

          if (typeof params.afterError === 'function') {
            params.afterError({
              getState
            })
          }
          return deferred.reject(res.body)
        }

        debug('received response')
        dispatch(actionWith(apiAction, {
          type: params.successType,
          response: res.body
        }))

        if (typeof params.afterSuccess === 'function') {
          params.afterSuccess({
            getState
          })
        }
        deferred.resolve(res.body)
      })

    return deferred.promise
  }
}

function extractParams (callApi) {
  let {method, path, query, body, successType, errorType, afterSuccess, afterError} = callApi

  // debug('process.env.API_BASE_URL', process.env.API_BASE_URL)
  let url = `${process.env.API_BASE_URL}${path}`

  return {
    method,
    url,
    query,
    body,
    successType,
    errorType,
    afterSuccess,
    afterError
  }
}
