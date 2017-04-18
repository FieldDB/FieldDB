import React, { Component } from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'

class Corpora extends Component {
  render() {
    return (
      <div>
        Corpora component {
      this.props.corpora.map((connection) => {
        let dbname = connection.get('dbname')
        return (
          <div key={dbname}>
            <Link to={`/corpora/${dbname}`}>{ connection.get('title') }</Link>
          </div>
        )
      })
      }
      </div>
    )
  }
}

Corpora.propTypes = {
  corpora: React.PropTypes.instanceOf(List).isRequired,
  team: React.PropTypes.object.isRequired
}

export default Corpora
