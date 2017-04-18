import Immutable from 'immutable'
import React from 'react'
import { shallow } from 'enzyme'

import Corpora from '../Corpora/Corpora.jsx'
import { UserMaskContainer } from './index.jsx'
import UserMask from './UserMask.jsx'

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

  it('renders UserMask with user in props', function () {
    let doc = shallow(<UserMaskContainer {...props} />)
    let userMaskComp = doc.find(UserMask)

    expect(userMaskComp.props().user).to.equal(props.userMask)
  })

  it('renders the users corpora', function () {
    let doc = shallow(<UserMaskContainer {...props} />)
    let corpora = doc.find(Corpora)

    expect(corpora).to.exist
    expect(corpora).to.not.be.instanceOf(Corpora)
    expect(corpora.props().corpora).to.deep.equal(Immutable.fromJS([]))
  })
})
