import React, { Component } from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'
import CorpusMaskCreate from '../CorpusMaskCreate.jsx'

class Corpora extends Component {
  render () {
    return (
      <div>
        <CorpusMaskCreate user={this.props.user} />
        Corpora component
        {
          this.props.corpora.map((q) => {
            let id = q.get('dbname')
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
  corpora: React.PropTypes.instanceOf(List).isRequired
}

export default Corpora
