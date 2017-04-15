import * as ActionType from 'components/question/actions'
import Immutable from 'immutable'

let defaultState = Immutable.fromJS([])
function questionsReducer (state = defaultState, action) {
  switch (action.type) {
    case ActionType.LOADED_QUESTIONS:
      return Immutable.fromJS(action.response)
    default:
      return state
  }
}

export default questionsReducer
