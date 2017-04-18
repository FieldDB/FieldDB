import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadCorpora } from './actions'
import { Link } from 'react-router'
import Corpora from './Corpora.jsx'
import Helmet from 'react-helmet'
// import { createStructuredSelector } from 'reselect';

class CorpusMaskContainer extends Component {
  constructor(props) {
    console.log('constructing corpusMask container', props)
    super(props)
    console.log('constructed ', this.props)
  }

  static fetchData({store}) {
    console.log('fetching data', loadCorpora)
    return store.dispatch(loadCorpora())
  }

  componentDidMount() {
    this.props.loadCorpora()
  }

  render() {
    return (
      <div>
        <Helmet
      title='Corpora page'
      />
        <h2>Corpora</h2>
        <Corpora corpora={this.props.corpora} team={this.props.team} />
      </div>
    )
  }
}

CorpusMaskContainer.propTypes = {
  loadCorpora: React.PropTypes.func.isRequired,
  corpora: React.PropTypes.object.isRequired,
  team: React.PropTypes.object.isRequired
}

function mapStateToProps(state) {
  console.log('corpusMask list map state to props', state)
  return {
    team: {
      id: 13
    },
    corpora: state.corpora
  }
}

// const mapStateToProps = createStructuredSelector({
//   corpora: state.corpora,
//   team: state.team
// });

export { CorpusMaskContainer }
export default connect(mapStateToProps, {
  loadCorpora
})(CorpusMaskContainer)
