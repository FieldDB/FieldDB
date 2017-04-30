import { combineReducers } from 'redux'

import corpora from '../Corpora/reducer'
import corpusMaskDetails from '../CorpusMask/reducer'
import userMaskDetail from '../UserMask/reducer'
import searchResults from '../Search/reducer'

const rootReducer = combineReducers({
  corpora,
  corpusMaskDetails,
  userMaskDetail,
  searchResults
})

export default rootReducer
