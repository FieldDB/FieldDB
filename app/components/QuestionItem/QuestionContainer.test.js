import React from 'react'
import Immutable from 'immutable'
import { CorpusMask } from './index.jsx'
import { mount } from 'enzyme'
import { browserHistory } from 'react-router'

describe('Container::CorpusMask', function () {
  let props

  function renderDoc () {
    return mount(<CorpusMask {...props} />)
  }
  beforeEach(function () {
    props = {
      loadCorpusMaskDetail: sinon.stub(),
      params: {
        id: 222
      },
      corpusMask: Immutable.fromJS({
        id: 222,
        content: 'the-corpusMask-content',
        user: {
          id: 1234,
          name: 'jack'
        }
      })
    }
  })

  it('fetches corpusMask details on mounted', function () {
    let doc = renderDoc()
    expect(props.loadCorpusMaskDetail).to.have.been.calledWith({
      id: props.params.id,
      history: browserHistory
    })

    // console.log('doc', doc)
    expect(doc).to.have.keys(['component', 'root', 'node', 'nodes', 'length', 'options', 'complexSelector'])
  })
})
