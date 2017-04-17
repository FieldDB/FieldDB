import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadQuestionDetail } from './actions'
import Helmet from 'react-helmet'
import { browserHistory } from 'react-router'

class Question extends Component {
  static fetchData({store, params, history}) {
    let {id} = params
    return store.dispatch(loadQuestionDetail({
      id,
      history
    }))
  }
  componentDidMount() {
    let {id} = this.props.params
    this.props.loadQuestionDetail({
      id,
      history: browserHistory
    })
  }
  render() {
    let {question} = this.props
    return (
      <div>
        <Helmet
      title={'Corpus ' + this.props.params.id}
      />
        <h2>{ question.get('title') }</h2>
        <h3> Team: {question.getIn(['team', 'name'])} </h3>
      </div>
    )
  }
}

function mapStateToProps(state) {
  console.log('questiondetail map state to props', state);
  return {
    question: state.questionDetail
  }
}

Question.propTypes = {
  params: React.PropTypes.object.isRequired,
  loadQuestionDetail: React.PropTypes.func.isRequired,
  question: React.PropTypes.object.isRequired
}

export { Question }
export default connect(mapStateToProps, {
  loadQuestionDetail
})(Question)
