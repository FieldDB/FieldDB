let _ = require('lodash')

function question (id) {
  let sampleContent = 'Lorem ipsum'
  return {
    id,
    content: `mocked-${id}: ${sampleContent}`,
    user_id: Math.random()
  }
}

export const questions = _.range(1, 10).map((i) => question(i))
export function getUser (id) {
  return {
    id,
    name: `user name - ${Math.random()}`
  }
}
export function getQuestion (id) {
  if (id === 'not-found') {
    return null
  }
  return question(id)
}
