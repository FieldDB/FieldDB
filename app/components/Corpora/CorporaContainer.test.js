import { CorpusMaskContainer } from './index.jsx'
import Corpora from './Corpora.jsx'
import { Link } from 'react-router'
import React from 'react'
import { shallow } from 'enzyme'
import Immutable from 'immutable'

describe('Container::Corpora', function() {
  let props
  beforeEach(function() {
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

  it('renders Corpora with corpora in props', function() {
    let doc = shallow(<CorpusMaskContainer {...props} />)
    let corporaComp = doc.find(Corpora)

    expect(corporaComp.props().corpora).to.equal(props.corpora)
  })
  it('renders a link back to `/`', function() {
    let doc = shallow(<CorpusMaskContainer {...props} />)
    let link = doc.find('Link')

    expect(link).to.exist
    expect(link).to.not.be.instanceOf(Link)
    expect(link.props().to).to.equal('/')
  })
})
