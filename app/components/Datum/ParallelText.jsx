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
      <span className='glossCouplet' dangerouslySetInnerHTML={{
        __html: text
      }} />
    )
  }
}

ParallelText.propTypes = {}

export default ParallelText
