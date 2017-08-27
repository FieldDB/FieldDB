import Immutable from 'immutable'

import * as ActionType from './actions'

let defaultState = Immutable.fromJS({})

export default function (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_CORPUS_MASK_DETAIL:
      return Immutable.fromJS(action.response)
    default:
      return state
  }
}
