import Immutable from 'immutable'
import React from 'react'
import { shallow } from 'enzyme'

import IGT from './IGT.jsx'

describe('Component::IGT', function () {
  let props
  beforeEach(function () {
    props = {
      datalist: Immutable.fromJS({})
    }
  })

  function renderDoc () {
    return shallow(<IGT {...props} />)
  }

  it('should render', function () {
    let doc = renderDoc()
    let element = doc.find('div')

    expect(element).to.exist
    expect(element.length).to.equal(1)
  })
})
