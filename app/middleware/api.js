import superAgent from 'superagent'
import Promise from 'bluebird'

export const CALL_API = Symbol('CALL_API')
export const CHAIN_API = Symbol('CHAIN_API')

export default ({dispatch, getState}) => next => action => {
  if (action[CALL_API]) {
    return createRequestPromise(action[CALL_API], next, getState, dispatch)
  }

  return next(action)
}

function actionWith(action, toMerge) {
  console.log('actionWith', action, toMerge)
  let ret = Object.assign({}, action, toMerge)
  delete ret[CALL_API]
  return ret
}

function createRequestPromise(apiAction, next, getState, dispatch) {
  return (prevBody) => {
    let deferred = Promise.defer()
    let params = extractParams(apiAction)

    console.log('requesting', params)
    return superAgent[params.method](params.url)
      .send(params.body)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .query(params.query)
      .then((body) => {
        console.log('recieved response', body)
        dispatch(actionWith(apiAction, {
          type: params.successType,
          response: body
        }))

        if (typeof params.afterSuccess === 'function') {
          params.afterSuccess({
            getState
          })
        }
        return body
      })
      .catch(function(err) {
        console.log('recieved err', err)
        if (params.errorType) {
          console.log('dispatching error', params.errorType)
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
        throw err
      })

    return deferred.promise
  }
}

function extractParams(callApi) {
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
