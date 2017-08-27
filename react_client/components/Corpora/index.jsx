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
    const description = 'Every LingSync corpus can have a Public URL, a place where you can share your data or let visitors search the parts of your corpus which you would like to make public. By default, all corpora are private not searchable unless you are a member of the corpus.'

    return (
      <div>
        <Helmet>
          <title>LingSync.org Public URLs</title>
          <meta
            name='description'
            content={description} />
        </Helmet>
        <h2>Public URLs</h2>
        <p>{description}</p>
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
