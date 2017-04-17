import { CALL_API, CHAIN_API } from '../../middleware/api'

export const LOADED_CORPORA = Symbol('LOADED_CORPORA')
export const ADD_CORPUS_MASK = Symbol('ADD_CORPUS_MASK')
export function loadCorpora() {
  console.log('calling loadCorpora');
  return {
    [CALL_API]: {
      method: 'get',
      path: '/api/corpora',
      successType: LOADED_CORPORA
    }
  }
}
