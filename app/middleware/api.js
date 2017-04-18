import superAgent from 'superagent'
import Promise from 'bluebird'

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
    console.log('something went wrong', err)
    deferred.reject(err)
  })

  return deferred.promise
}

function actionWith (action, toMerge) {
  let ret = Object.assign({}, action, toMerge)
  delete ret[CALL_API]
  return ret
}

function createRequestPromise (apiActionCreator, next, getState, dispatch) {
  return (prevBody) => {
    let apiAction = apiActionCreator(prevBody)
    let deferred = Promise.defer()
    let params = extractParams(apiAction[CALL_API])

    console.log('requesting', params)
    superAgent[params.method](params.url)
      .send(params.body)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .query(params.query)
      .end((err, res, body) => {
        if (err) {
          console.log('recieved err', res.body)
          if (params.errorType) {
            console.log('dispatching error', params.errorType)
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

        console.log('recieved response', res.body)
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

  console.log('process.env.API_BASE_URL', process.env.API_BASE_URL)
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
