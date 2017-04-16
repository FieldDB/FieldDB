import React, { Component } from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'
import QuestionCreate from '../QuestionCreate.jsx'

class Questions extends Component {
  render () {
    const user = {
      id: 987
    }

    return (
      <div>
        <QuestionCreate user={user} userId='1234' />
        Questions component
        {
          this.props.questions.map((q) => {
            let id = q.get('id')
            return (
              <div key={id}>
                <Link to={`/questions/${id}`}>{ q.get('content') }</Link>
              </div>
            )
          })
        }
        <Link to={`/questions/not-found`}> This link would be redirected to Index</Link>
      </div>
    )
  }
}

Questions.propTypes = {
  questions: React.PropTypes.instanceOf(List).isRequired
}

export default Questions
