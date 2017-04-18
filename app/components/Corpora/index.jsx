import { connect } from 'react-redux'
import React, { Component } from 'react'
import Helmet from 'react-helmet'

import Corpora from './Corpora.jsx'
import { loadCorpora } from './actions'

class CorpusMaskContainer extends Component {
  static fetchData ({store}) {
    return store.dispatch(loadCorpora())
  }

  componentDidMount () {
    this.props.loadCorpora()
  }

  render () {
    return (
      <div>
        <Helmet
          title='Corpora page'
      />
        <h2>Corpora</h2>
        <Corpora corpora={this.props.corpora} />
      </div>
    )
  }
}

CorpusMaskContainer.propTypes = {
  loadCorpora: React.PropTypes.func.isRequired,
  corpora: React.PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    corpora: state.corpora
  }
}

export { CorpusMaskContainer }
export default connect(mapStateToProps, {
  loadCorpora
})(CorpusMaskContainer)
