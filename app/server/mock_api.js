import Corpora from 'fielddb/api/corpus/Corpora'

import user from '../../routes/user'
import corpus from '../../routes/corpus'

function corpusMask(dbname) {
  return corpus.getCorpusMask(dbname, console.log)
}

export const corpora = new Corpora.Corpora([]).toJSON()

export function getUser(id) {
  return user.getUserMask(id, console.log)
}
export function getCorpusMask(dbname) {
  return corpusMask(dbname)
}
