import React, { Component } from 'react'

function isEmpty (value) {
  return value
}

class IGT extends Component {
  render () {
    const fields = this.props.fields
    console.log('igt is ', this.props.igt)
    return (
      <span className='glossCouplet'>
        igt:
          {
      fields.map((field) => {
        const id = field.id ? field.id : Math.random() * 100
        return (
        this.props.igt[field.id]
        )
      }).filter(isEmpty).join(' <br/>')
      }
      </span>
    )
  }
}

IGT.propTypes = {}

export default IGT
