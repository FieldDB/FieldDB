import { combineReducers } from 'redux'
import questions from '../QuestionList/reducer'
import questionDetail from '../QuestionItem/reducer'

const rootReducer = combineReducers({
  questions,
  questionDetail
})

export default rootReducer
