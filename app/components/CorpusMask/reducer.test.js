import reducer from './reducer'
import * as ActionType from './actions'
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

        let newState = reducer(undefined, action)

        expect(newState.toJS()).to.deep.equal({
          team: {},
          key: 'val'
        })
      })
    })

    describe('on LOADED_CORPUS_MASK_USER', function () {
      it('merge `team` to state', function () {
        let action = {
          type: ActionType.LOADED_CORPUS_MASK_USER,
          response: {
            key: 'val'
          }
        }
        let initState = Immutable.fromJS({
          dbname: 'the-corpusMask-dbname',
          team: {}
        })
        let newState = reducer(initState, action)

        expect(newState.toJS()).to.deep.equal({
          dbname: 'the-corpusMask-dbname',
          team: {
            key: 'val'
          }
        })
      })
    })
  })
})
