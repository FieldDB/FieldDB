import user from '../../routes/user'
import corpus from '../../routes/corpus'
import fixtures from 'fixturefiles'
import Corpora from 'fielddb/api/corpus/Corpora'

let _ = require('lodash')
function corpusMask(dbname) {
  return corpus.getCorpusMask(dbname, console.log)
}

export const corpora = new Corpora.Corpora(fixtures.user.lingllama.corpora).toJSON();

export function getUser(id) {
  return user.getUserMask(id, console.log)
}
export function getCorpusMask(dbname) {
  if (dbname === 'not-found') {
    return null
  }
  return corpusMask(dbname)
}
