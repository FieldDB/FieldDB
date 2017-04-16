import { combineReducers } from 'redux'
import questions from 'components/QuestionList/reducer'
import questionDetail from 'components/QuestionItem/reducer'

const rootReducer = combineReducers({
  questions,
  questionDetail
})

export default rootReducer
