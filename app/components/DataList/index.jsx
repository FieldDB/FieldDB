import React, { Component } from 'react'

class DataList extends Component {
  render () {
    if (!this.props.datalist) {
      return (
        <div className='accordion'>
        DataList
      </div>
      )
    }

    return (
      <div className='accordion'>
        DataList {this.props.datalist.get('title')}
      </div>
    )
  }
}

DataList.propTypes = {
  className: React.PropTypes.string.isRequired,
  corpus: React.PropTypes.object.isRequired,
  datalist: React.PropTypes.object.isRequired
}

export default DataList
