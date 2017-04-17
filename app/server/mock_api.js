import user from '../../routes/user'
import corpus from '../../routes/corpus'

let _ = require('lodash')
function question(id) {
  return corpus.getCorpusMask('lingllama-communitycorpus')
}

export const questions = _.range(1, 10).map((i) => question(i))
export function getUser(id) {
  return user.getUserMask('lingllama', console.log);
}
export function getQuestion(id) {
  if (id === 'not-found') {
    return null
  }
  return question(id)
}
