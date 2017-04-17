import * as ActionType from './actions'
import Immutable from 'immutable'

let defaultState = Immutable.fromJS([])
function corporaReducer (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_CORPORA:
      return Immutable.fromJS(action.response)
    case ActionType.ADD_CORPUS_MASK:
      return state.push(Immutable.Map(action.payload))
    default:
      return state
  }
}

export default corporaReducer
