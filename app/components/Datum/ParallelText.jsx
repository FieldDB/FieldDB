import React, { Component } from 'react'

function isEmpty (value) {
  return value
}

class ParallelText extends Component {
  render () {
    const text = Object
      .keys(this.props.parallelText)
      .map(key => this.props.parallelText[key])
      .filter(isEmpty)
      .join(' <br/>')
    return (
      <span dangerouslySetInnerHTML={{
        __html: text
      }} />
    )
  }
}

ParallelText.propTypes = {
  parallelText: React.PropTypes.object.isRequired
}

export default ParallelText
