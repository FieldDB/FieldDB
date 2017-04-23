import Immutable from 'immutable'
import React from 'react'
import { shallow } from 'enzyme'

import { SearchContainer } from './index.jsx'

describe('Component::SearchContainer', function () {
  let props
  beforeEach(function () {
    props = {
      params: {
        searchIn: ''
      },
      corpus: Immutable.fromJS({
        lexicon: {
          url: 'http://localhost:3135'
        }
      }),
      className: 'span12',
      datalist: Immutable.fromJS({})
    }
  })

  function renderDoc () {
    return shallow(<SearchContainer {...props} />)
  }

  it('should render', function () {
    let doc = renderDoc()
    let element = doc.find('div')

    expect(element).to.exist
    expect(element.length).to.equal(3)
  })
})
