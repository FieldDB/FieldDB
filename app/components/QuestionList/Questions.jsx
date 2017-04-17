import React, { Component } from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'
import QuestionCreate from '../QuestionCreate.jsx'

class Questions extends Component {
  render () {
    return (
      <div>
        <QuestionCreate user={this.props.user} />
        Questions component
        {
          this.props.questions.map((q) => {
            let id = q.get('dbname')
            return (
              <div key={dbname}>
                <Link to={`/questions/${dbname}`}>{ q.get('title') }</Link>
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
