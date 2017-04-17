import user from '../../routes/user'
import corpus from '../../routes/corpus'

let _ = require('lodash')
function corpusMask(id) {
  return corpus.getCorpusMask('lingllama-communitycorpus')
}

export const corpora = _.range(1, 10).map((i) => corpusMask(i))
export function getUser(id) {
  return user.getUserMask('lingllama', console.log)
}
export function getCorpusMask(id) {
  if (id === 'not-found') {
    return null
  }
  return corpusMask(id)
}
