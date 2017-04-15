import React from 'react'
// import { Provider } from 'react-redux'
import { Router, Route, IndexRoute } from 'react-router'
// import configureStore from 'store/configureStore'

import App from 'components/app/AppContainer'
import Intro from 'components/intro/IntroContainer'
import Questions from 'components/question/QuestionsContainer'
import Question from 'components/question/QuestionContainer'

export default function (history) {
  return (
    <Router history={history}>
      <Route path='/' component={App}>
        <Route path='questions' component={Questions} />
        <Route path='questions/:id' component={Question} />
        <IndexRoute component={Intro} />
      </Route>
    </Router>
  )
}
