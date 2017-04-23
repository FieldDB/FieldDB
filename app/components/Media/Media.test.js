import Immutable from 'immutable'
import React from 'react'
import { shallow } from 'enzyme'
import fixtures from 'fixturefiles'
import Media from './index.jsx'

describe('Component::Media', function () {
  const corpus = fixtures.corpus['community-georgian']
  corpus.speech = {
    url: 'https:/somewhere.org'
  }
  function renderDoc (props) {
    return shallow(<Media {...props} />)
  }

  it('should render audio', function () {
    let doc = renderDoc({
      corpus: Immutable.fromJS(corpus),
      media: {
        'filename': 'vitsi_da_damalaparake_erti.mp3',
        'type': 'audio',
        'description': ' Downloaded Praat TextGrid which contained a count of roughly 8 syllables and auto detected utterances for vitsi_da_damalaparake_erti The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.',
        'syllableCount': '8',
        'pauseCount': '0',
        'speakingTotalDuration': '2.11',
        'speakingRate': '3.78',
        'articulationRate': '3.78'
      }
    })
    let element = doc.find('audio')

    expect(element).to.exist
    expect(element.length).to.equal(1)
  })

  it('should render images', function () {
    let doc = renderDoc({
      corpus: Immutable.fromJS(corpus),
      media: {
        'filename': 'ar_vitsi.png',
        'description': 'Screenshot from movie where main character is talking with friends'
      }
    })
    let element = doc.find('img')

    expect(element).to.exist
    expect(element.length).to.equal(1)
  })

  it('should render unknown media as a link', function () {
    let doc = renderDoc({
      corpus: Immutable.fromJS(corpus),
      media: {
        'filename': '012543.pdf',
        'description': ''
      }
    })
    let element = doc.find('a')

    expect(element).to.exist
    expect(element.length).to.equal(1)

    expect(element.node.props['title']).to.equal('Open 012543.pdf in a new tab')
    expect(element.node.props['href']).to.equal('https:/somewhere.org/community-georgian/012543/012543.pdf')
  })
})
