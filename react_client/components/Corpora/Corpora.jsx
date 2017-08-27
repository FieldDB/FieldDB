import React, { Component } from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'

class Corpora extends Component {
  render () {
    return (
      <div className={this.props.className}>
        <h1>Corpora</h1>
        {
      this.props.corpora.map((connection) => {
        let website = connection.get('website') || ''
        if (connection.get('searchKeywords')) {
          website = `${website}/search/${connection.get('searchKeywords')}`
        } else {
          website = `${website}/search`
        }
        return (
          <div className='media' key={connection.get('dbname')}>
            <Link to={website} className='pull-left'>
              <img src={'https://secure.gravatar.com/avatar/' + connection.get('gravatar') + '.jpg?s=96&d=retro&r=pg'} alt='Corpus image' className='media-object' />
            </Link>
            <div className='media-body'>
              <h4 className='media-heading'>
                <Link to={website}>
                  {connection.get('title')}
                </Link>
              </h4>
              <p>{connection.get('description')}</p>
            </div>
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
  className: React.PropTypes.string.isRequired
}

export default Corpora
