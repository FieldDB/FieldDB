import { combineReducers } from 'redux'
import corpora from '../Corpora/reducer'
import corpusMaskDetail from '../CorpusMask/reducer'

const rootReducer = combineReducers({
  corpora,
  corpusMaskDetail
})

export default rootReducer
