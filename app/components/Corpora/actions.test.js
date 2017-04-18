import { CALL_API } from 'redux-api-middleware'

import * as actionCreator from './actions'

describe('Action::CorpusMask', function() {
  describe('#loadCorpora()', function() {
    it('returns action `CALL_API` info', function() {
      let action = actionCreator.loadCorpora()
      expect(action[CALL_API]).to.deep.equal({
        method: 'get',
        endpoint: process.env.API_BASE_URL + '/api/corpora',
        successType: actionCreator.LOADED_CORPORA
      })
    })
  })
})
