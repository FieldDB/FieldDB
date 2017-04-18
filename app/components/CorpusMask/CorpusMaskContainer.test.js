import { browserHistory } from 'react-router'
import Immutable from 'immutable'
import { mount } from 'enzyme'
import React from 'react'

import { CorpusMaskContainer } from './index.jsx'

describe('Container::CorpusMask', function () {
  let props

  function renderDoc () {
    return mount(<CorpusMaskContainer {...props} />)
  }
  beforeEach(function () {
    props = {
      loadCorpusMaskDetail: sinon.stub(),
      params: {
        dbname: 'something',
        teamname: 'someone'
      },
      corpusMask: Immutable.fromJS({
        dbname: 222,
        title: 'the-corpusMask-title',
        team: {
          id: 1234,
          name: 'jack'
        }
      })
    }
  })

  it('fetches corpusMask details on mounted', function () {
    let doc = renderDoc()
    expect(props.loadCorpusMaskDetail).to.have.been.calledWith({
      teamname: 'someone',
      dbname: props.params.dbname,
      history: browserHistory
    })

    expect(doc).to.have.keys(['component', 'root', 'node', 'nodes', 'length', 'options', 'complexSelector'])
  })
})
