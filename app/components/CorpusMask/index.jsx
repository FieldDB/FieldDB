import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import Immutable from 'immutable'
import React, { Component } from 'react'
import { CorpusMask } from 'fielddb/api/corpus/CorpusMask'
import { DatumFields } from 'fielddb/api/datum/DatumFields'

import { loadCorpusMaskDetail } from './actions'
import UserMask from '../UserMask/UserMask.jsx'
import DataList from '../DataList'

let defaultCorpus

class CorpusMaskContainer extends Component {
  static fetchData ({store, params, history}) {
    let {teamname, dbname} = params
    return store.dispatch(loadCorpusMaskDetail({
      teamname,
      dbname,
      history
    }))
  }
  componentDidMount () {
    let {teamname, dbname} = this.props.params
    this.props.loadCorpusMaskDetail({
      teamname,
      dbname,
      history: browserHistory
    })
  }
  render () {
    let {corpusMask} = this.props

    if (!corpusMask || !corpusMask.get('team')) {
      return (
        <div />
      )
    }

    let title = `${corpusMask.getIn(['team', 'name'])} - ${corpusMask.get('title')}`
    let fields = new DatumFields(corpusMask.get('fields').toJS())
    if (!defaultCorpus) {
      defaultCorpus = new CorpusMask(CorpusMask.prototype.defaults)
    }
    fields.merge('self', defaultCorpus.fields)

    let date = new Date(corpusMask.get('dateModified') || corpusMask.get('dateCreated')).toJSON()

    return (
      <div>
        <Helmet>
          <title>{title}</title>
          <meta
            name='description'
            content={corpusMask.get('description')} />
          <meta
            name='keywords'
            content={corpusMask.get('keywords') || 'Lingusitics, Fieldwork, Corpus, LingSync, Database, OpenSoure, XML, JSON'} />
          <meta
            name='subject'
            data-help='The topic of the resource. Recommended best practice is to use values from the olac:language scheme using two- and three-letter identifiers from ISO 639.'
            content={fields.subject.value || ''} />
          <meta
            name='coverage'
            data-help='The spatial or temporal topic of the resource, the spatial applicability of the resource, or the jurisdiction under which the resource is relevant. For examples see: http://www.language-archives.org/NOTE/usage.html'
            content={fields.coverage.value || ''} />
          <meta
            name='date'
            data-help='Date the corpus metadata was last modified (corpus content might have been updated more recently).'
            content={date} />
          <meta
            name='dateCreated'
            data-help='Date of the corpus, or the date when the corpus was created.'
            content={fields.date.value || new Date(corpusMask.get('dateCreated')).toJSON()} />
          <meta
            name='terms'
            data-help='A description of the terms of use.'
            content={corpusMask.get('termsOfUse')} />
          <meta
            name='access'
            data-help='Instructions on how to get access to non-public parts of the corpus.'
            content={fields.rights.json.accessRights} />
          <meta
            name='license'
            content={corpusMask.getIn(['license', 'humanReadable'])} />
          <meta
            name='copyright'
            data-help='A person or organization owning or managing rights over the resource.'
            content={corpusMask.get('copyright') || 'Default: Add names of the copyright holders of the corpus.'} />
          <meta
            name='contributor'
            data-help="Entity/ies responsible for making contributions to the resource. A Contributor may be a person, an organization, or a service—any entity that has sufficient involvement in the creation or development of the resource to warrant explicit identification. A term from olac:role should be used to specify the role of the Contributor. Contributor is related to Creator since many of the terms in the role vocabulary (like author or photographer) name the role of the primary creator of a resource. The OLAC recommendation is that Contributor (with the appropriate role designation) be used in these cases, and that Creator be used only when there is not an appropriate term in the olac:role vocabulary for the role played by the entity that created the resource. A participating OLAC repository need not be concerned about the fact that other metadata services based on Dublin Core may prefer and even require the use of the Creator element. The OLAC-to-Simple-DC crosswalk built into the OLAC Aggregator automatically maps certain OLAC Contributor roles like author and photographer to the Creator element. See the discussion of Creator for more on its use. Follow the form in which the person's name would normally be listed in an alphabetical index in his or her own language or country of residence, e.g., “FamilyName, GivenName” for an English speaker. For examples see: http://www.language-archives.org/NOTE/usage.html"
            content={fields.contributor.value || ''} />
          <meta
            name='creator'
            data-help='An entity primarily responsible for making the resource. It refers to an entity with a primary role in the creation of the intellectual or artistic content of the resource. For examples see: http://www.language-archives.org/NOTE/usage.html'
            content={fields.creator.value || ''} />
          <meta
            name='publisher'
            data-help='An entity responsible for making the resource available. The Publisher is generally the business, organization, or sometimes individual who takes responsibility (and provides financial and production resources) for putting the resource into a form suitable for making it publicly available, whether in multiple hard copies (printing, pressing of a disc, etc), by broadcasting (radio, television, webcast), or posting to a public website.'
            content={fields.publisher.value || 'LingSync.org'} />
          <meta
            name='identifier'
            data-help='An unambiguous reference to the resource within a given context.'
            content={corpusMask.get('dbname') + '/' + corpusMask.get('_id') + '?rev=' + corpusMask.get('_rev')} />
          <meta
            name='format'
            data-help='The file format, physical medium, or dimensions of the resource.'
            content={fields.type.value || 'Text, Audio, Video, Image, Non-proprietary, JSON, XML'} />
          <meta
            name='type'
            data-help='The nature or genre of the resource.'
            content={fields.type.value || 'Dataset'} />
          <meta
            name='source'
            data-help='The present resource may be derived from the Source resource in whole or in part.'
            content={fields.source.value || ''} />
          <meta
            name='provenance'
            data-help='A statement of any changes in ownership and custody of the resource since its creation that are significant for its authenticity, integrity and interpretation. Example: Collection of texts recorded by ____, transcribed with the assistance of a number of local residents. Body of materials were transferred to custody of SIL ____ Branch in 1980s, subsequently organized,  collated and annotated by J. L. ____, a researcher in a closely related _____ language. Annotations particularly relate to changes in orthographic and tone marking conventions over the years of collection and as compared to current practices'
            content={fields.provenance.value || ''} />
          <meta
            name='language'
            data-help='A language of the resource. Language is used for the language the resource is in (eg: English), as opposed to the language it describes (eg: Quechua).'
            content={fields.language.value || 'English'} />
          <meta
            name='relation'
            data-help='URI to related resource(s).'
            content={fields.relation.value || ''} />
        </Helmet>
        <div className='row-fluid'>
          <UserMask className='span3' user={corpusMask.get('team')} link={'/' + corpusMask.getIn(['team', 'username'])} />
          <div className='corpus span9'>
            <div className='row-fluid'>
              <div className='span7 offset1'>
                <h1 className='media-heading'>{corpusMask.get('title')}</h1>
                <div className='media'>
                  <a href={corpusMask.getIn(['corpus', 'url']) + '/public-firstcorpus/_design/pages/corpus.html'} className='pull-right'>
                    <img src={'https://secure.gravatar.com/avatar/' + corpusMask.getIn(['connection', 'gravatar']) + '.jpg?s=96&d=retro&r=pg'} alt='Corpus image' className='media-object' />
                  </a>
                  <div className='media-body'>
                    <div className='description'>{corpusMask.get('description')}</div>
                  </div>
                </div>
              </div>
              <div className='span4' />
            </div>
            <div className='row-fluid'>
              <div className='span12'>
                <iframe src={'/corpus-pages/libs/activities_visualization/index.html?' + corpusMask.get('dbname')} width='100%' height='200' frameBorder='0' allowTransparency='true' />
              </div>
            </div>
            <div className='row-fluid'>
              {this.props.children}
            </div>
            {
      this.props.searchResults.map((searchResult) => {
        const id = searchResult.getIn(['datalist', 'id'])
        return (
          <DataList key={'search-result-' + id} className='row-fluid' corpus={corpusMask} datalist={searchResult.get('datalist')} />
        )
      })
      }

          </div>
        </div>
        <hr />
        <footer>
          <p>© {corpusMask.get('copyright')} {corpusMask.get('startYear')} - 2017 </p>
          <div className='tabbable'>
            <ul className='nav nav-tabs'>
              <li className='active'><a href='#terms' data-toggle='tab'>Terms of Use for {corpusMask.get('title')}</a></li>
              <li><a href='#emeldtermsreccomendations' data-toggle='tab'>Why have a Terms of Use?</a></li>
            </ul>
            <div className='tab-content'>
              <div id='terms' className='tab-pane active'>
                <p>{corpusMask.get('dbname')}</p>
                <p>{corpusMask.get('termsOfUse')}</p>
                <span>License: </span><a href={corpusMask.getIn(['license', 'link'])} rel='license' title={corpusMask.getIn(['license', 'title'])}>{corpusMask.getIn(['license', 'title'])}</a>
                <p>{corpusMask.getIn(['license', 'humanReadable'])}</p>
                <img src='//i.creativecommons.org/l/by-sa/3.0/88x31.png' alt='License' />
              </div>
              <div id='emeldtermsreccomendations' className='tab-pane'>
                <ul>
                  <li>
                    <dl>
                    EMELD digital language documentation Best Practices #7:
                    <dt>Rights</dt>
                      <dd>Resource creators, researchers and the speech communities who provide the primary data have different priorities over who has access to language resources.</dd>
                      <dt>Solution</dt>
                      <dd>Terms of use should be well documented, and enforced if necessary with encryption or licensing. It is important however to limit the duration of <a target='_blank' href='http://emeld.org/school/classroom/ethics/access.html'>access restrictions</a>: A resource whose access is permanently restricted to one user is of no long-term value since it cannot be used once that user is gone.</dd>
                    </dl>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  }
}

function mapStateToProps (state) {
  // console.log('corpusMaskdetail map state to props', state)
  return {
    corpusMask: state.corpusMaskDetail,
    searchResults: state.searchResults || Immutable.fromJs([])
  }
}

CorpusMaskContainer.propTypes = {
  children: React.PropTypes.object,
  corpusMask: React.PropTypes.object.isRequired,
  searchResults: React.PropTypes.object.isRequired,
  params: React.PropTypes.object.isRequired,
  loadCorpusMaskDetail: React.PropTypes.func.isRequired
}

export { CorpusMaskContainer }
export default connect(mapStateToProps, {
  loadCorpusMaskDetail
})(CorpusMaskContainer)
