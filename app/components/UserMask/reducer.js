import Immutable from 'immutable'

import * as ActionType from './actions'

let defaultState = Immutable.fromJS({})
function userMaskDetail (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_USER_MASK:
      if (!action.response || !action.response.username) {
        return state
      }
      return Immutable.fromJS(action.response)
    default:
      return state
  }
}

export default userMaskDetail
