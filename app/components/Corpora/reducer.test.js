import * as ActionType from './actions'
import corpusMaskReducer from './reducer'

describe('Reducer::CorpusMask', function () {
  it('returns an empty array as default state', function () {
    let action = {
      type: 'unknown'
    }
    let newState = corpusMaskReducer(undefined, action)
    expect(newState.toJS()).to.deep.equal([])
  })

  describe('on LOADED_CORPORA', function () {
    it('returns the `response` in given action', function () {
      let action = {
        type: ActionType.LOADED_CORPORA,
        response: {
          responseKey: 'responseVal'
        }
      }
      let newState = corpusMaskReducer(undefined, action)
      expect(newState.toJS()).to.deep.equal(action.response)
    })
  })
})
