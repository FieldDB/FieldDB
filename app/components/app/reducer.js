import { combineReducers } from 'redux'
import questions from 'components/question/reducer'
import questionDetail from 'components/question/detail/reducer'

const rootReducer = combineReducers({
  questions,
  questionDetail
})

export default rootReducer
