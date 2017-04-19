import Immutable from 'immutable'

import * as ActionType from './actions'

let defaultState = Immutable.fromJS({
  datalist: {}
})

export default function (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_SEARCH_RESULTS:
      return state.merge(action.payload)

    default:
      return state
  }
}
