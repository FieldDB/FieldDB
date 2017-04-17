import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as ActionType from './QuestionList/actions'

class QuestionCreate extends Component {
  constructor (props) {
    super(props)
    console.log('constructing create question', props, this.state)

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
      userId: this.props.user.id
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
  user: React.PropTypes.object.isRequired
}

function mapStateToProps (state) {
  console.log('question create map state to props', state)
  return {}
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
