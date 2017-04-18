import React from 'react'
// import { Provider } from 'react-redux'
import { Router, Route, IndexRoute } from 'react-router'
// import configureStore from 'store/configureStore'

import App from '../App'
import Intro from '../Intro'
import Corpora from '../Corpora'
import CorpusMaskContainer from '../CorpusMask'
import UserMaskContainer from '../UserMask'

export default function (history) {
  return (
    <Router history={history}>
      <Route path='/' component={App}>
        <Route path='corpora' component={Corpora} />
        <Route path=':username' component={UserMaskContainer} />
        <Route path=':teamname/:dbname' component={CorpusMaskContainer} />
        <IndexRoute component={Intro} />
      </Route>
    </Router>
  )
}
