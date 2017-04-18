import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as ActionType from './Corpora/actions'

class CorpusMaskCreate extends Component {
  constructor (props) {
    super(props)
    console.log('constructing create corpusMask', props, this.state)

    this.state = {
      title: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (event) {
    this.setState({
      title: event.target.value
    })
  }

  handleSubmit (event) {
    event.preventDefault()
    const dbname = Date.now()
    this.props.addCorpusMask({
      dbname,
      title: this.state.title,
      teamId: this.props.team.id
    })
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type='text' value={this.state.title} onChange={this.handleChange} />
      </form>
    )
  }
}

CorpusMaskCreate.propTypes = {
  team: React.PropTypes.object.isRequired
}

function mapStateToProps (state) {
  console.log('corpusMask create map state to props', state)
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    addCorpusMask: (corpusMask) => {
      return dispatch({
        type: ActionType.ADD_CORPUS_MASK,
        payload: corpusMask
      })
    }
  }
}
export { CorpusMaskCreate }
export default connect(mapStateToProps, mapDispatchToProps)(CorpusMaskCreate)
