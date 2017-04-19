import Immutable from 'immutable'
import React from 'react'
import { shallow } from 'enzyme'

import SearchResult from './SearchResult.jsx'

describe('Component::SearchResult', function () {
  let props
  beforeEach(function () {
    props = {
      datalist: Immutable.fromJS({})
    }
  })

  function renderDoc () {
    return shallow(<SearchResult {...props} />)
  }

  it('should render', function () {
    let doc = renderDoc()
    let element = doc.find('div')

    expect(element).to.exist
    expect(element.length).to.equal(1)
  })
})
