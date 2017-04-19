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
  console.log('got an event LOADED_SEARCH_RESULTS', state, action.payload)
  switch (action.type) {
    case ActionType.LOADED_SEARCH_RESULTS:
      return state.unshift(Immutable.fromJS(action.payload))

    default:
      return state
  }
}
