import { UserMaskContainer } from './index.jsx'
import UserMask from './UserMask.jsx'
import { Link } from 'react-router'
import React from 'react'
import { shallow } from 'enzyme'
import Immutable from 'immutable'

describe('Container::UserMask', function () {
  let props
  beforeEach(function () {
    props = {
      loadUserMask: sinon.stub(),
      userMask: Immutable.fromJS({
        username: 'lingllama',
        name: 'userMask name lingllama',
        corpora: []
      })
    }
  })

  it.skip('renders UserMask with userMask in props', function () {
    let doc = shallow(<UserMaskContainer {...props} />)
    let userMaskComp = doc.find(UserMask)

    expect(userMaskComp.props().userMask).to.equal(props.userMask)
  })

  it.skip('renders a link back to `/`', function () {
    let doc = shallow(<UserMaskContainer {...props} />)
    let link = doc.find('Link')

    expect(link).to.exist
    expect(link).to.not.be.instanceOf(Link)
    expect(link.props().to).to.equal('/lingllama')
  })
})
