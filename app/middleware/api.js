import superAgent from 'superagent'
import Promise from 'bluebird'
import _ from 'lodash'
import { camelizeKeys } from 'humps'

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
    //TODO this reject doesnt result in an error handling, instead it results in a 302
    deferred.reject(err);
  })

  return deferred.promise
}

function actionWith(action, toMerge) {
  let ret = Object.assign({}, action, toMerge)
  delete ret[CALL_API]
  return ret
}

function createRequestPromise(apiActionCreator, next, getState, dispatch) {
  return (prevBody) => {
    let apiAction = apiActionCreator(prevBody)
    let deferred = Promise.defer()
    let params = extractParams(apiAction[CALL_API])

    console.log('requesting', params)
    superAgent[params.method](params.url)
      .send(params.body)
      .query(params.query)
      .end((err, res) => {
        if (err) {
          console.log('recieved err', err)
          if (params.errorType) {
            dispatch(actionWith(apiAction, {
              type: params.errorType,
              error: err
            }))
          }

          if (_.isFunction(params.afterError)) {
            params.afterError({
              getState
            })
          }
          deferred.reject()
        } else {
          console.log('recieved response', res.body)
          let resBody = camelizeKeys(res.body)
          dispatch(actionWith(apiAction, {
            type: params.successType,
            response: resBody
          }))

          if (_.isFunction(params.afterSuccess)) {
            params.afterSuccess({
              getState
            })
          }
          deferred.resolve(resBody)
        }
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
