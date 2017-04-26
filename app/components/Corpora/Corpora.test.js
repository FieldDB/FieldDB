import Immutable from 'immutable'
import { Link } from 'react-router'
import React from 'react'
import { shallow } from 'enzyme'

import Corpora from './Corpora.jsx'

describe('Component::Corpora', function () {
  let props
  beforeEach(function () {
    props = {
      corpora: Immutable.fromJS([
        {
          dbname: 1,
          title: 'the-title-1'
        },
        {
          dbname: 2,
          title: 'the-title-2'
        },
        {
          dbname: 3,
          title: 'the-title-3'
        }
      ])
    }
  })
  function renderDoc () {
    return shallow(<Corpora {...props} />)
  }

  it('renders corpora', function () {
    let doc = renderDoc()
    let corpusMaskComps = doc.find(Link)

    expect(corpusMaskComps.length).to.equal(props.corpora.size * 2)
  })
})
