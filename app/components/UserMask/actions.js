import { CALL_API } from 'redux-api-middleware';

export const LOADED_USER_MASK = Symbol('LOADED_USER_MASK')
export function loadUserMaskDetail({username, history}) {
  return {
    [CALL_API]: {
      method: 'get',
      endpoint: process.env.API_BASE_URL + `/api/users/${username}`,
      types: ['REQUEST', {
        type: 'SUCCESS',
        payload: (action, state, res) => {
          console.log('action state', action, state, res.body)

          dispatch(actionWith(apiAction, {
            type: 'LOADED_USER_MASK',
            response: res.body
          }))

          return res.body;
        }
      }, 'FAILURE'],
    // successType: LOADED_USER_MASK,
    // afterError: () => {
    //   history.push('/') // TODO maybe this is what is swallowing errors
    // }
    }
  }
}
