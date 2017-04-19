import { combineReducers } from 'redux'

import corpora from '../Corpora/reducer'
import corpusMaskDetail from '../CorpusMask/reducer'
import userMaskDetail from '../UserMask/reducer'
import searchResults from '../Search/reducer'

const rootReducer = combineReducers({
  corpora,
  corpusMaskDetail,
  userMaskDetail,
  searchResults
})

export default rootReducer
