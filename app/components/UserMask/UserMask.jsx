import React, { Component } from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'

class UserMask extends Component {
  render () {
    return (
      <div>
        {this.props.username}
        <Link to={this.props.username}>{this.props.name}</Link>
      </div>
    )
  }
}

UserMask.propTypes = {
  corpora: React.PropTypes.instanceOf(List).isRequired,
  username: React.PropTypes.string.isRequired
}

export default UserMask
