import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadQuestions } from './actions'
import { Link } from 'react-router'
import Questions from './Questions.jsx'
import QuestionCreate from '../QuestionCreate.jsx'
import Helmet from 'react-helmet'
import { createStructuredSelector } from 'reselect';

class QuestionContainer extends Component {
  constructor (props) {
    super(props)
  }

  static fetchData ({ store }) {
    return store.dispatch(loadQuestions())
  }

  componentDidMount () {
    this.props.loadQuestions()
  }

  render () {
    this.state = {
      user: {
        id: '123'
      }
    }

    const { user } = this.props;
    const questionCreateProps = {
      user
    };

    return (
      <div>
        <Helmet
          title='Questions page'
        />
        <h2>Questions</h2>
        <QuestionCreate {...questionCreateProps}  user={this.state.user} userId='1234' />
        <Questions questions={this.props.questions} />
        <Link to='/'>Back to Home</Link>
      </div>
    )
  }
}

QuestionContainer.propTypes = {
  loadQuestions: React.PropTypes.func.isRequired,
  questions: React.PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    questions: state.questions
  }
}

// const mapStateToProps = createStructuredSelector({
//   questions: state.questions,
//   user: state.user
// });

export { QuestionContainer }
export default connect(mapStateToProps, {
  loadQuestions
})(QuestionContainer)
