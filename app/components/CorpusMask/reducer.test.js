import * as ActionType from './actions'
import reducer from './reducer'
import Immutable from 'immutable'

describe('Reducer::::CorpusMaskDetail', function () {
  describe('on ACTION_TYPE', function () {
    describe('on LOADED_CORPUS_MASK_DETAIL', function () {
      it('merges state to response', function () {
        let action = {
          type: ActionType.LOADED_CORPUS_MASK_DETAIL,
          response: {
            key: 'val'
          }
        }

        let newState = reducer(Immutable.fromJS({
          something: 'else'
        }), action)

        expect(newState.toJS()).to.deep.equal({
          key: 'val'
        })
      })
    })
  })
})
