import React from 'react'
import { Router, Route } from 'react-router'

import App from '../App'
import Corpora from '../Corpora'
import CorpusMaskContainer from '../CorpusMask'
import UserMaskContainer from '../UserMask'
import SearchContainer from '../Search'

export default function (history) {
  return (
    <Router history={history}>
      <Route path='/' component={App}>
        <Route path='corpora' component={Corpora} />
        <Route path=':username' component={UserMaskContainer} />
        <Route path=':username/' component={UserMaskContainer} >
          <Route path=':dbname' component={CorpusMaskContainer}/>
          <Route path=':dbname/' component={CorpusMaskContainer}>
            <Route path='search' component={SearchContainer} />
            <Route path='search/:searchKeywords' component={SearchContainer} />
          </Route>
        </Route>
      </Route>
    </Router>
  )
}
