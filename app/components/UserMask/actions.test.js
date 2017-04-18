import { CALL_API } from 'redux-api-middleware';

import * as actionCreator from './actions'

describe('Action::CorpusMask', function() {
  describe('#loadUserMask()', function() {
    it('returns action `CALL_API` info', function() {
      let action = actionCreator.loadUserMaskDetail({
        username: 'lingllama'
      })
      expect(action[CALL_API]).to.deep.equal({
        method: 'get',
        endpoint: process.env.API_BASE_URL + '/api/users/lingllama',
        successType: actionCreator.LOADED_USER_MASK,
        afterError: action[CALL_API].afterError
      })
    })
  })
})
