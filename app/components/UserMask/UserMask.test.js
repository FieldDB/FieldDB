import Immutable from 'immutable'
import React from 'react'
import { shallow } from 'enzyme'

import Gravatar from './Gravatar.jsx'
import UserMask from './UserMask.jsx'

describe('Component::UserMask', function () {
  let props
  beforeEach(function () {
    props = {
      user: Immutable.fromJS({
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
    let image = doc.find(Gravatar)

    expect(image).to.exist
    expect(image).to.not.be.instanceOf(Gravatar)
    expect(image.length).to.equal(1)
  })
})
