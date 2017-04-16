import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class QuestionCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {content: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({content: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    alert('A question was submitted: ' + this.state.content);
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="newQuestion" value={this.state.content} onChange={this.handleChange} />
      </form>
    )
  }
}
QuestionCreate.propTypes = {
  newQuestion: PropTypes.object
}

function mapStateToProps (state) {
  return {
    newQuestion: state.newQuestion
  }
}

export { QuestionCreate }
export default connect(mapStateToProps, {})(QuestionCreate)
