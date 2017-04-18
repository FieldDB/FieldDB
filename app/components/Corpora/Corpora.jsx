import React, { Component } from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'

class Corpora extends Component {
  render () {
    return (
      <div>
        <h1>Corpora</h1>
        {
      this.props.corpora.map((connection) => {
        return (
          <div className='media' key={connection.get('dbname')}>
            <Link to={connection.get('website')} className='pull-left'>
              <img src={'https://secure.gravatar.com/avatar/' + connection.get('gravatar') + '.jpg?s=96&d=retro&r=pg'} alt='Corpus image' className='media-object' />
            </Link>
            <div className='media-body'>
              <h4 className='media-heading'>
                <Link to={connection.get('website')}>
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
  corpora: React.PropTypes.instanceOf(List).isRequired
}

export default Corpora
