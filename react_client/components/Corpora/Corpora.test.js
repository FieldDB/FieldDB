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
          title: 'the title 1',
          website: 'https://example.org'
        },
        {
          dbname: 2,
          title: 'the title 2',
          searchKeywords: 'morphemes:nay OR gloss:caus'
        },
        {
          dbname: 3,
          title: 'the title 3'
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
    expect(corpusMaskComps.nodes[0].props.to).to.equal('https://example.org/search')
    expect(corpusMaskComps.nodes[1].props.children).to.equal('the title 1')

    expect(corpusMaskComps.nodes[2].props.to).to.equal('/search/morphemes:nay OR gloss:caus')
    expect(corpusMaskComps.nodes[3].props.children).to.equal('the title 2')
  })
})
