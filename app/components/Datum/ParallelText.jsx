import React, { Component } from 'react'

function isEmpty (value) {
  return value
}

class ParallelText extends Component {
  render () {
    return (
      <div>
        ParallelText:

        {
      Object.keys(this.props.parallelText).map((key) => {
        return (
        this.props.parallelText[key]
        )
      }).filter(isEmpty).join(' <br/>')
      }
      </div>

    )
  }
}

ParallelText.propTypes = {}

export default ParallelText
