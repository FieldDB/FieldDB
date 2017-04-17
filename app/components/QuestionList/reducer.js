import * as ActionType from './actions'
import Immutable from 'immutable'

let defaultState = Immutable.fromJS([])
function questionsReducer (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_QUESTIONS:
      return Immutable.fromJS(action.response)
    case ActionType.ADD_QUESTION:
      return state.push(Immutable.Map(action.payload))
    default:
      return state
  }
}

export default questionsReducer
