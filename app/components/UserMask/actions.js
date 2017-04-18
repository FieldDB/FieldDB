import { CALL_API } from '../../middleware/api'

export const LOADED_USER_MASK = Symbol('LOADED_USER_MASK')
export function loadUserMaskDetail({username, history}) {
  console.log('calling loadUserMaskDetail')
  return {
    [CALL_API]: {
      method: 'get',
      path: `/api/users/${username}`,
      successType: LOADED_USER_MASK,
      afterError: () => {
        history.push('/') // TODO maybe this is what is swallowing errors
      }
    }
  }
}
