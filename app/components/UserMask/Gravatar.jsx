import React, { Component } from 'react'
import { Link } from 'react-router'

class Gravatar extends Component {
  render () {
    if (!this.props.link) {
      return (
        <img src={'https://secure.gravatar.com/avatar/' + this.props.gravatar + '.jpg?s=200&d=identicon&r=pg'} alt='Your gravatar.com profile image' className='img-polaroid' />
      )
    }
    return (
      <Link to={this.props.link}>
        <img src={'https://secure.gravatar.com/avatar/' + this.props.gravatar + '.jpg?s=200&d=identicon&r=pg'} alt='Your gravatar.com profile image' className='img-polaroid' />
      </Link>
    )
  }
}

Gravatar.propTypes = {
  link: React.PropTypes.string.isRequired,
  gravatar: React.PropTypes.string.isRequired
}

export default Gravatar
