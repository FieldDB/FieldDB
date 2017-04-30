import Immutable from 'immutable'

import * as ActionType from './actions'

let defaultState = Immutable.fromJS({})

export default function (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_CORPUS_MASK_DETAIL:
      if (!action.response.dbname){
        return;
      }
      // most recent and dbname as key
      return state[0] = state[action.response.dbname] = action.response
    default:
      return state
  }
}
