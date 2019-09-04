import withPower from 'powercycle'
import { $, $if, pickLens, withTransactionalState } from 'powercycle/util'
import dropRepeats from 'xstream/extra/dropRepeats'

import { urlLens } from './util.js'
import reducer, { changeUrl, goHome } from './AppState.js'
import './App.css'

import { HomePage } from './home/HomePage.jsx'
import { MovieDetailsPage } from './details/MovieDetailsPage.jsx'

export const App = withTransactionalState(reducer, sources => {
  const activePage$ =
    $if($.movieId, 'item', 'home')

  const action$ = sources.history
    .map(history => changeUrl(history.pathname))

  const navigation$ = sources.state.stream
    .map(urlLens.get)
    .compose(dropRepeats())
    .drop(1) // the initial one is just the one which got loaded

  const backToHomeClickHandler = {
    state: ev$ => ev$
      .filter(event =>
        event.target.classList.contains('App__view') ||
        event.target.classList.contains('App__view-container')
      )
      .mapTo(goHome())
  }

  return [
    <div className='App uk-light uk-background-secondary' data-activepage={activePage$}>
      <div className='App__header uk-width-1-1'>
        <ul className='uk-breadcrumb uk-width-1-1'>
          <li className='uk-width-1-1'>
            <a className='uk-width-1-1 uk-padding-small' onClick={ev => ['goHome']}>
              <span className='uk-margin-small-right uk-icon' uk-icon='icon:chevron-left' />
              Back
            </a>
          </li>
        </ul>
      </div>

      <div className='App__view-container' onClick={backToHomeClickHandler}>
        <div className='App__view uk-margin-top-small uk-margin-left uk-margin-right' data-page='home'>
          <HomePage />
        </div>
        <div className='App__view uk-margin-top-small uk-margin-left uk-margin-right' data-page='item'>
          <MovieDetailsPage scope={{ state: pickLens('movieId', 'cache') }} />
        </div>
      </div>
    </div>,
    {
      state: action$,
      history: navigation$
    }
  ]
})
