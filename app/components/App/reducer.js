import { combineReducers } from 'redux'

import corpora from '../Corpora/reducer'
import corpusMaskDetail from '../CorpusMask/reducer'
import userMaskDetail from '../UserMask/reducer'

const rootReducer = combineReducers({
  corpora,
  corpusMaskDetail,
  userMaskDetail
})

export default rootReducer
