import { browserHistory } from 'react-router'
import Immutable from 'immutable'
import { mount, shallow } from 'enzyme'
import React from 'react'

import { CorpusMaskContainer } from './index.jsx'

describe('Container::CorpusMask', function () {
  function renderDoc (props) {
    return shallow(<CorpusMaskContainer {...props} />)
  }
  function prepareDoc (props) {
    return mount(<CorpusMaskContainer {...props} />)
  }
  it('fetches corpusMask details on mounted', function () {
    const props = {
      loadCorpusMaskDetail: sinon.stub(),
      params: {
        dbname: 'something',
        teamname: 'someone'
      },
      children: [], // To avoid rendering the Search component
      corpusMask: Immutable.fromJS({
        dbname: 222,
        title: 'the-corpusMask-title',
        team: {
          id: 1234,
          name: 'jack'
        },
        fields: []
      }),
      searchResults: Immutable.fromJS([])
    }
    const doc = prepareDoc(props)
    expect(props.loadCorpusMaskDetail).to.have.been.calledWith({
      teamname: 'someone',
      dbname: props.params.dbname,
      history: browserHistory
    })

    expect(doc).to.have.keys(['component', 'root', 'node', 'nodes', 'length', 'options', 'complexSelector'])
  })

  it('should support OLAC metadata in header', function () {
    const props = {
      loadCorpusMaskDetail: sinon.stub(),
      params: {
        dbname: 'something',
        teamname: 'someone'
      },
      corpusMask: Immutable.fromJS({
        dbname: 222,
        title: 'the-corpusMask-title',
        description: 'hi',
        dateCreated: 1411424261782,
        dateModified: 1490462360903,
        keywords: 'kartuli, batumi, natural speech',
        copyright: 'Georgian Together Users',
        termsOfUse: 'any terms',
        team: {
          id: 1234,
          name: 'jack'
        },
        fields: [{
          id: 'subject',
          value: 'Kartuli'
        }]
      }),
      searchResults: Immutable.fromJS([])
    }
    const doc = renderDoc(props)

    let meta = doc.find('meta')
    expect(meta).to.exist
    expect(meta.length).to.equal(20)

    let description = doc.find('meta[name="description"]')
    expect(description).to.exist
    expect(description.length).to.equal(1)
    expect(description.node.props.content).to.equal('hi')

    let keywords = doc.find('meta[name="keywords"]')
    expect(keywords).to.exist
    expect(keywords.length).to.equal(1)
    expect(keywords.node.props.content).to.equal('kartuli, batumi, natural speech')

    let date = doc.find('meta[name="date"]')
    expect(date).to.exist
    expect(date.length).to.equal(1)
    expect(date.node.props.content).to.equal('2017-03-25T17:19:20.903Z')

    let dateCreated = doc.find('meta[name="dateCreated"]')
    expect(dateCreated).to.exist
    expect(dateCreated.length).to.equal(1)
    expect(dateCreated.node.props.content).to.equal('2014-09-22T22:17:41.782Z')

    let subject = doc.find('meta[name="subject"]')
    expect(subject).to.exist
    expect(subject.length).to.equal(1)
    expect(subject.node.props.content).to.equal('Kartuli')

    let copyright = doc.find('meta[name="copyright"]')
    expect(copyright).to.exist
    expect(copyright.length).to.equal(1)
    expect(copyright.node.props.content).to.equal('Georgian Together Users')

    let terms = doc.find('meta[name="terms"]')
    expect(terms).to.exist
    expect(terms.length).to.equal(1)
    expect(terms.node.props.content).to.equal('any terms')

    let access = doc.find('meta[name="access"]')
    expect(access).to.exist
    expect(access.length).to.equal(1)
    expect(access.node.props.content).to.equal('Contact myemail@myemail.org if you would like to gain (read, write, comment, contributor, export, search) access to the non-public parts of this database')
  })
})
