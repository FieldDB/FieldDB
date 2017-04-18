import React from 'react'
import { shallow } from 'enzyme'
import { Link } from 'react-router'
import UserMask from './UserMask.jsx'
import Immutable from 'immutable'

describe('Component::UserMask', function () {
  let props
  beforeEach(function () {
    props = {
      userMask: Immutable.fromJS({
        username: 1,
        title: 'the-title-1'
      })
    }
  })
  function renderDoc () {
    return shallow(<UserMask {...props} />)
  }

  it('renders userMask', function () {
    let doc = renderDoc()
    let links = doc.find(Link)

    expect(links.length).to.equal(1)
  })
})
