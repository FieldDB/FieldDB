import { CALL_API, CHAIN_API } from '../../middleware/api'

export const LOADED_QUESTIONS = Symbol('LOADED_QUESTIONS')
export const ADD_QUESTION = Symbol('ADD_QUESTION')
export function loadQuestions () {
  console.log('calling loadQuestions');
  return {
    [CALL_API]: {
      method: 'get',
      path: '/api/questions',
      successType: LOADED_QUESTIONS
    }
  }
}
