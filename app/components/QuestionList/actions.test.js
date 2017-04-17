import { CALL_API, CHAIN_API } from 'middleware/api'

import * as actionCreator from './actions'
// import * as ActionType from 'actions/questions'

describe('Action::Question', function () {
  describe('#loadQuestions()', function () {
    it('returns action `CALL_API` info', function () {
      let action = actionCreator.loadQuestions()
      expect(action[CALL_API]).to.deep.equal({
        method: 'get',
        path: '/api/questions',
        successType: actionCreator.LOADED_QUESTIONS
      })
    })
  })
})
