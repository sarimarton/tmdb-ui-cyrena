import withPower from 'powercycle'
import { $, $if, pickLens } from 'powercycle/util'
import { pickBy, compact } from 'powercycle/fp'
import dropRepeats from 'xstream/extra/dropRepeats'

import './App.css'

import { HomePage } from './home/HomePage.jsx'
import { MovieDetailsPage } from './details/MovieDetailsPage.jsx'

export function App (sources) {
  const initialState = {
    searchPhrase: '',
    movieId: null,
    cache: {}
  }

  const activePage$ = $if($.movieId, 'item', 'home')

  const urlLens = {
    get: state =>
      [
        '',
        ...compact([
          state.searchPhrase && `search/${state.searchPhrase}`,
          state.movieId && `movie/${state.movieId}`
        ])
      ].join('/'),

    set: (state, url) => ({
      ...state,
      ...pickBy()(
        url.match(
          /^(?:\/search\/(?<searchPhrase>[^/]+))?(\/movie\/(?<movieId>\d+))?$/
        )?.groups
      )
    })
  }

  const reducer$ = sources.history.map(history => state =>
    urlLens.set(state || initialState, history.pathname)
  )

  const navigation$ = sources.state.stream
    .map(urlLens.get)
    .compose(dropRepeats())
    .drop(1) // the initial one is just the one which got loaded

  return [
    <div className='App uk-light uk-background-secondary' data-activepage={activePage$}>
      <div className='App__header uk-width-1-1'>
        <ul className='uk-breadcrumb uk-width-1-1'>
          <li className='uk-width-1-1'>
            <a className='uk-width-1-1 uk-padding-small' onClick={ev => prev => ({ ...prev, movieId: null })}>
              <span className='uk-margin-small-right uk-icon' uk-icon='icon:chevron-left' />
              Back
            </a>
          </li>
        </ul>
      </div>

      <div className='App__view-container'>
        <div className='App__view uk-margin-top-small uk-margin-left uk-margin-right' data-page='home'>
          <HomePage />
        </div>
        <div className='App__view uk-margin-top-small uk-margin-left uk-margin-right' data-page='item'>
          <MovieDetailsPage scope={{ state: pickLens('movieId', 'cache') }} />
        </div>
      </div>
    </div>,
    {
      state: reducer$,
      history: navigation$
    }
  ]
}
