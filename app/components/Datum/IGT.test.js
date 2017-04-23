import fixtures from 'fixturefiles'
import React from 'react'
import { shallow } from 'enzyme'

import IGT from './IGT.jsx'

describe('Component::IGT', function () {
  const corpus = fixtures.corpus['community-georgian']
  function renderDoc (props) {
    return shallow(<IGT {...props} />)
  }

  it('should render in the order of the corpus fields', function () {
    let doc = renderDoc({
      fields: corpus.datumFields,
      igt: {
        'gloss': 'i.know',
        'orthography': 'ვიცი',
        'morphemes': 'vitsi',
        'notaknownfieldincorpus': 'some stuff',
        'syntacticCategory': '',
        'utterance': 'vitsi'
      }
    })

    let element = doc.find('span')
    expect(element).to.exist
    expect(element.length).to.equal(1)
    expect(element.node.props.className).to.equal('glossCouplet')

    expect(element.node.props.dangerouslySetInnerHTML.__html).to.equal('ვიცი <br/>vitsi <br/>vitsi <br/>i.know')
  })
})
