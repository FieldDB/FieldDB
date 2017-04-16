import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as ActionType from './QuestionList/actions'

class QuestionCreate extends Component {
  constructor (props) {
    super(props)
    this.state = { content: '' }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (event) {
    this.setState({ content: event.target.value })
  }

  handleSubmit (event) {
    event.preventDefault()
    const id = Date.now()
    this.props.addQuestion({
      id,
      content: this.state.content,
      // user_id: 123
      user_id: this.props.userId,
      // user_id: this.props.user.user_id
    })
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type='text' value={this.state.content} onChange={this.handleChange} />
      </form>
    )
  }
}

QuestionCreate.propTypes = {
  user: React.PropTypes.object.isRequired,
  userId: React.PropTypes.string.isRequired
}

function mapStateToProps (state) {
  console.log('mapStateToProps QuestionCreate', state)
  return {
    user: state.user
  }
}

function mapDispatchToProps (dispatch) {
  return {
    addQuestion: (question) => {
      return dispatch({
        type: ActionType.ADD_QUESTION,
        payload: question
      })
    }
  }
}
export { QuestionCreate }
export default connect(mapStateToProps, mapDispatchToProps)(QuestionCreate)
