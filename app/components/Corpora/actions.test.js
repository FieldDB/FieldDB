import { CALL_API } from 'middleware/api'

import * as actionCreator from './actions'
// import * as ActionType from 'actions/corpora'

describe('Action::CorpusMask', function() {
  describe('#loadCorpora()', function() {
    it('returns action `CALL_API` info', function() {
      let action = actionCreator.loadCorpora()
      expect(action[CALL_API]).to.deep.equal({
        method: 'get',
        path: '/api/corpora',
        successType: actionCreator.LOADED_CORPORA
      })
    })
  })
})
