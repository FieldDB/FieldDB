import config from 'config'
import nock from 'nock'
import apiMiddleware, { CALL_API } from 'middleware/api'

describe('Middleware::Api', function() {
  let store,
    next
  let action
  beforeEach(function() {
    store = {
      dispatch: sinon.stub(),
      getState: sinon.stub()
    }
    next = sinon.stub()
  })

  describe('when action is without CALL_API', function() {
    it('passes the action to next middleware', function() {
      action = {
        type: 'not-CALL_API'
      }
      apiMiddleware(store)(next)(action)
      expect(next).to.have.been.calledWith(action)
    })
  })

  describe('when action is with `CALL_API`', function() {
    let successType = 'ON_SUCCESS'
    let path = '/the-url/path'
    let dispatchedAction

    beforeEach(function() {
      store.dispatch = function(a) {
        dispatchedAction = a
      }
      action = {
        [CALL_API]: {
          method: 'get',
          path,
          successType
        }
      }
    })
    it('passes the action to next middleware', function() {
      apiMiddleware(store)(next)(action)
      expect(next).to.not.have.been.called
    })
  })
})
