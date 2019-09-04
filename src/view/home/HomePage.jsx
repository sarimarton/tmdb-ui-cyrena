import withPower from 'powercycle'
import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'

import { get, not } from 'powercycle/fp'
import { If, $, request } from 'powercycle/util'

import './HomePage.css'
import { SearchBar } from './SearchBar.jsx'
import { ResultsContainer } from './ResultsContainer.jsx'

import { changeQuery, selectMovie } from '../AppState.js'

export function HomePage (sources) {
  const isDiscoveryMode =
    state => state.searchPhrase === ''

  const isDiscoveryMode$ =
    sources.state.stream
      .map(isDiscoveryMode)

  const discovery = request(
    sources.state.stream
      .take(1)
      .mapTo(sources.util.getFullUrl('/movie/popular?language=en-US&page=1')),
    sources
  )

  const search = request(
    sources.state.stream
      .filter(not(isDiscoveryMode))
      .map(get('searchPhrase'))
      .compose(dropRepeats())
      .map(searchPhrase =>
        sources.util.getFullUrl(`/search/movie?query=${searchPhrase}`)
      ),
    sources
  )

  const thumbnails$ = xs
    .combine(isDiscoveryMode$, discovery.content$, search.content$.startWith({ results: [] }))
    .map(([isDiscoveryMode, discoveryThumbnails, searchThumbnails]) =>
      isDiscoveryMode ? discoveryThumbnails : searchThumbnails
    )
    .remember()

  const isLoading$ = xs.merge(
    discovery.isLoading$,
    search.isLoading$
  )

  const errorMessage$ = xs.merge(
    discovery.errorMessage$,
    search.errorMessage$
  )

  const http$ = xs.merge(
    discovery.request$,
    search.request$
  )

  const searchPhrase$ =
    sources.state.stream
      .map($ => $.searchPhrase)
      .compose(dropRepeats())

  return [
    <div className='HomePage'>
      <h1>TMDb UI – Home</h1>

      <SearchBar value$={searchPhrase$} title='Search for a Title:' onChange={changeQuery} />

      <h3 className='uk-heading-bullet uk-margin-remove-top'>
        <If cond={isDiscoveryMode$}
          then='Popular Now'
          else={<>Search Results for "{$.searchPhrase}":</>}
        />
      </h3>

      <ResultsContainer onSelect={selectMovie}
        {...{ thumbnails$, isLoading$, errorMessage$ }}
      />
    </div>,
    { HTTP: http$ }
  ]
}
