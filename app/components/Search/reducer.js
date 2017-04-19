import Immutable from 'immutable'

import * as ActionType from './actions'

let defaultState = Immutable.fromJS([{
  datalist: {
    id: 'default',
    title: 'Default search datalist',
    docs: []
  }
}])

export default function (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_SEARCH_RESULTS:
      return state.unshift(action.payload)

    default:
      return state
  }
}
