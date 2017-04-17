import { CALL_API, CHAIN_API } from '../../middleware/api'

export const LOADED_CORPUS_MASK_DETAIL = Symbol('LOADED_CORPUS_MASK_DETAIL')
export const LOADED_CORPUS_MASK_USER = Symbol('LOADED_CORPUS_MASK_USER')
export function loadCorpusMaskDetail({dbname, history}) {
  return {
    [CHAIN_API]: [
      () => {
        return {
          [CALL_API]: {
            method: 'get',
            path: `/api/corpora/${dbname}`,
            successType: LOADED_CORPUS_MASK_DETAIL,
            afterError: () => {
              history.push('/')
            }
          }
        }
      },
      (corpus) => {
        return {
          [CALL_API]: {
            method: 'get',
            path: `/api/teams/${corpus.team.id}`,
            successType: LOADED_CORPUS_MASK_USER
          }
        }
      }
    ]
  }
}
