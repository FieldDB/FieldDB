import React, { Component } from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'

class Corpora extends Component {
  render() {
    return (
      <div>
      {
      this.props.corpora.map((connection) => {
        return (
          <div key={connection.get('dbname')}>
            <Link to={`/${connection.get('owner')}/${connection.get('titleAsUrl')}`}>{ connection.get('title') }</Link>
          </div>
        )
      })
      }
      </div>
    )
  }
}

Corpora.propTypes = {
  corpora: React.PropTypes.instanceOf(List).isRequired
}

export default Corpora
