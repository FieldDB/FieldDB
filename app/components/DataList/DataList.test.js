import fixtures from 'fixturefiles'
import Immutable from 'immutable'
import React from 'react'
import { shallow } from 'enzyme'

import DataList from './index.jsx'

describe('Component::DataList', function () {
  const corpus = Immutable.fromJS(fixtures.corpus['community-georgian'])
  function renderDoc (props) {
    return shallow(<DataList {...props} />)
  }

  it('should render docs as a search result', function () {
    let doc = renderDoc({
      corpus: corpus,
      datalist: Immutable.fromJS({
        'fieldDBtype': 'DataList',
        'id': 'orthography___',
        'title': 'Search for orthography:არ',
        'description': 'something with a \n\n* http://link.to.somwhere in it',
        'version': 'v4.49.5',
        docs: [{
          id: 'd3bf748b16ac4054680f27a6401efdfa'
        }, {
          id: 'd3bf748b16ac4054680f27a6401c0d6e'
        }, {
          id: 'd3bf748b16ac4054680f27a6401fab52'
        }, {
          id: 'd3bf748b16ac4054680f27a640204a76'
        }]
      })
    })
    let element = doc.find('div')
    expect(element).to.exist
    expect(element.length).to.equal(6)

    let title = doc.find('h3')
    expect(title).to.exist
    expect(title.length).to.equal(1)
    expect(title.node.props.children).to.equal('Search for orthography:არ')

    let description = doc.find('p')
    expect(description).to.exist
    expect(description.length).to.equal(1)
    expect(description.node.props.dangerouslySetInnerHTML.__html).to.equal('<p>something with a </p>\n<ul>\n<li><a href="http://link.to.somwhere">http://link.to.somwhere</a> in it</li>\n</ul>\n')

    let searchResults = doc.find('SearchResult')
    expect(searchResults).to.exist
    expect(searchResults.length).to.equal(4)
    expect(searchResults.nodes[0].key).to.equal('orthography___-d3bf748b16ac4054680f27a6401efdfa')
    expect(searchResults.nodes[3].key).to.equal('orthography___-d3bf748b16ac4054680f27a640204a76')
    expect(searchResults.nodes[0].props.corpus).to.equal(corpus)
  })
})
