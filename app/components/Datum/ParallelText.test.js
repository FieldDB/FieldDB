import React from 'react'
import { shallow } from 'enzyme'

import ParallelText from './ParallelText.jsx'

describe('Component::ParallelText', function () {
  function renderDoc (props) {
    return shallow(<ParallelText {...props} />)
  }

  it('should render all lines', function () {
    let doc = renderDoc({
      parallelText: {
        'orthography': 'ვიცი',
        translation: 'I know',
        'russian': 'знаю'
      }
    })
    let element = doc.find('span')

    expect(element).to.exist
    expect(element.length).to.equal(1)
    expect(element.node.props.dangerouslySetInnerHTML.__html).to.equal('ვიცი <br/>I know <br/>знаю')
  })

  it('should render empty if there are no parallel texts', function () {
    let doc = renderDoc({
      parallelText: {}
    })
    let element = doc.find('span')

    expect(element).to.exist
    expect(element.length).to.equal(1)
    expect(element.node.props.dangerouslySetInnerHTML.__html).to.equal('')
  })
})
