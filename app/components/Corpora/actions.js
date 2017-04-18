import { CALL_API } from 'redux-api-middleware';

export const LOADED_CORPORA = Symbol('LOADED_CORPORA')
export const ADD_CORPUS_MASK = Symbol('ADD_CORPUS_MASK')
export function loadCorpora() {
  return {
    [CALL_API]: {
      method: 'get',
      endpoint: process.env.API_BASE_URL + '/api/corpora',
      successType: LOADED_CORPORA
    }
  }
}
