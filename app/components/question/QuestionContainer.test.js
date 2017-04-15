import React from 'react'
import Immutable from 'immutable'
import { Question } from 'components/question/QuestionContainer'
import { mount } from 'enzyme'
import { browserHistory } from 'react-router'

describe('Container::Question', function () {
  let props

  function renderDoc () {
    return mount(<Question {...props} />)
  }
  beforeEach(function () {
    props = {
      loadQuestionDetail: sinon.stub(),
      params: {
        id: 222
      },
      question: Immutable.fromJS({
        id: 222,
        content: 'the-question-content',
        user: {
          id: 1234,
          name: 'jack'
        }
      })
    }
  })

  it('fetches question details on mounted', function () {
    let doc = renderDoc()
    expect(props.loadQuestionDetail).to.have.been.calledWith({
      id: props.params.id,
      history: browserHistory
    })

    // console.log('doc', doc)
    expect(doc).to.have.keys(['component', 'root', 'node', 'nodes', 'length', 'options', 'complexSelector'])
  })
})
