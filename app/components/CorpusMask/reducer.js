import Immutable from 'immutable'

import * as ActionType from './actions'

let defaultState = Immutable.fromJS({
  team: {}
})

export default function (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_CORPUS_MASK_DETAIL:
      return state.merge(action.response)

    case ActionType.LOADED_CORPUS_MASK_USER:
      return state.merge({
        team: action.response
      })

    default:
      return state
  }
}
