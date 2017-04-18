import Immutable from 'immutable'
import React from 'react'
import { shallow } from 'enzyme'

import Corpora from './Corpora.jsx'
import { CorpusMaskContainer } from './index.jsx'

describe('Container::Corpora', function () {
  let props
  beforeEach(function () {
    props = {
      loadCorpora: sinon.stub(),
      corpora: Immutable.fromJS([
        {
          dbname: 1,
          title: 'corpusMask title 1'
        },
        {
          dbname: 2,
          title: 'corpusMask title 1'
        }
      ])
    }
  })

  it('renders Corpora with corpora in props', function () {
    let doc = shallow(<CorpusMaskContainer {...props} />)
    let corporaComp = doc.find(Corpora)

    expect(corporaComp.props().corpora).to.equal(props.corpora)
  })
})
