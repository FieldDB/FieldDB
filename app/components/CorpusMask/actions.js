import { CALL_API } from 'redux-api-middleware';

export const LOADED_CORPUS_MASK_DETAIL = Symbol('LOADED_CORPUS_MASK_DETAIL')
export const LOADED_CORPUS_MASK_USER = Symbol('LOADED_CORPUS_MASK_USER')
export function loadCorpusMaskDetail({teamname, dbname, history}) {
  return {
    [CALL_API]: {
      method: 'get',
      endpoint: process.env.API_BASE_URL + `/api/${teamname || 'corpora'}/${dbname}`,
      successType: LOADED_CORPUS_MASK_DETAIL,
      afterError: () => {
        history.push('/')
      }
    }
  }
}
