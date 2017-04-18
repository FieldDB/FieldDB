import userMaskDetail from './reducer'
import * as ActionType from './actions'

describe('Reducer::Usermask', function() {
  it('returns an empty array as default state', function() {
    let action = {
      type: 'unknown'
    }
    let newState = userMaskDetail(undefined, action)
    expect(newState.toJS()).to.deep.equal([])
  })

  describe('on LOADED_USER_MASK', function() {
    it('returns the `response` in given action', function() {
      let action = {
        type: ActionType.LOADED_USER_MASK,
        response: {
          responseKey: 'responseVal'
        }
      }
      let newState = userMaskDetail(undefined, action)
      expect(newState.toJS()).to.deep.equal(action.response)
    })
  })
})
