import React, { Component } from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'
import CorpusMaskCreate from '../CorpusMaskCreate.jsx'

class Corpora extends Component {
  render() {
    return (
      <div>
        <CorpusMaskCreate team={this.props.team} />
        Corpora component {
      this.props.corpora.map((q) => {
        let dbname = q.get('dbname')
        return (
          <div key={dbname}>
              <Link to={`/corpora/${dbname}`}>{ q.get('title') }</Link>
            </div>
        )
      })
      }
        <Link to={`/corpora/not-found`}> This link would be redirected to Index</Link>
      </div>
    )
  }
}

Corpora.propTypes = {
  corpora: React.PropTypes.instanceOf(List).isRequired,
  team: React.PropTypes.object.isRequired
}

export default Corpora
