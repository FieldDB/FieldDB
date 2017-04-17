import React from 'react'
// import { Provider } from 'react-redux'
import { Router, Route, IndexRoute } from 'react-router'
// import configureStore from 'store/configureStore'

import App from '../App'
import Intro from '../Intro'
import Corpora from '../Corpora'
import CorpusMask from '../CorpusMask'

export default function (history) {
  return (
    <Router history={history}>
      <Route path='/' component={App}>
        <Route path='corpora' component={Corpora} />
        <Route path='corpora/:dbname' component={CorpusMask} />
        <IndexRoute component={Intro} />
      </Route>
    </Router>
  )
}
