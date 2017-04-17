import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadCorpusMaskDetail } from './actions'
import Helmet from 'react-helmet'
import { browserHistory } from 'react-router'

class CorpusMask extends Component {
  static fetchData({store, params, history}) {
    let {dbname} = params
    return store.dispatch(loadCorpusMaskDetail({
      dbname,
      history
    }))
  }
  componentDidMount() {
    let {dbname} = this.props.params
    this.props.loadCorpusMaskDetail({
      dbname,
      history: browserHistory
    })
  }
  render() {
    let {corpusMask} = this.props
    let title = `${corpusMask.getIn(['team', 'name'])} - ${corpusMask.get('title')}`
    return (
      <div>
        <Helmet title={title} />


        <h2>{ corpusMask.get('title') }</h2>
        <h3> Team: {corpusMask.getIn(['team', 'name'])} </h3>
      </div>
    )
  }
}

function mapStateToProps(state) {
  console.log('corpusMaskdetail map state to props', state)
  return {
    corpusMask: state.corpusMaskDetail
  }
}

CorpusMask.propTypes = {
  params: React.PropTypes.object.isRequired,
  loadCorpusMaskDetail: React.PropTypes.func.isRequired,
  corpusMask: React.PropTypes.object.isRequired
}

export { CorpusMask }
export default connect(mapStateToProps, {
  loadCorpusMaskDetail
})(CorpusMask)
