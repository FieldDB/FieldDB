import Immutable from 'immutable'
import React from 'react'
import { shallow } from 'enzyme'

import DataList from './index.jsx'

describe('Component::DataList', function () {
  let props
  beforeEach(function () {
    props = {
      datalist: Immutable.fromJS({})
    }
  })

  function renderDoc () {
    return shallow(<DataList {...props} />)
  }

  it('should render', function () {
    let doc = renderDoc()
    let element = doc.find('div')

    expect(element).to.exist
    expect(element.length).to.equal(1)
  })
})
