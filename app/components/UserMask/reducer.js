import * as ActionType from './actions'
import Immutable from 'immutable'

let defaultState = Immutable.fromJS([])
function userMaskDetail (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_USER_MASK:
      return Immutable.fromJS(action.response)
    default:
      return state
  }
}

export default userMaskDetail
