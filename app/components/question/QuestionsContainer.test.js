import { QuestionContainer } from 'components/question/QuestionsContainer.jsx'
import Questions from 'components/question/Questions.jsx'
import { Link } from 'react-router'
import React from 'react'
import { shallow } from 'enzyme'
import Immutable from 'immutable'

describe('Container::Questions', function () {
  let props
  beforeEach(function () {
    props = {
      loadQuestions: sinon.stub(),
      questions: Immutable.fromJS([
        { id: 1, content: 'question content 1' },
        { id: 2, content: 'question content 1' }
      ])
    }
  })

  it('renders Questions with questions in props', function () {
    let doc = shallow(<QuestionContainer {...props} />)
    let questionsComp = doc.find(Questions)

    expect(questionsComp.props().questions).to.equal(props.questions)
  })
  it('renders a link back to `/`', function () {
    let doc = shallow(<QuestionContainer {...props} />)
    let link = doc.find('Link')

    expect(link).to.exist
    expect(link).to.not.be.instanceOf(Link)
    expect(link.props().to).to.equal('/')
  })
})
