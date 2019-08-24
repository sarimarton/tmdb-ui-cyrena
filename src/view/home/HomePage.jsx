import withPower from 'powercycle'
import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'

import { get, not } from 'powercycle/fp'
import { If, $, pickLens } from 'powercycle/util'

import './HomePage.css'

import { SearchBar } from './SearchBar.jsx'
import { ResultsContainer } from './ResultsContainer.jsx'

export function HomePage (sources) {
  const isDiscoveryMode =
    state => state.searchPhrase === ''

  const isDiscoveryMode$ =
    sources.state.stream
      .map(isDiscoveryMode)

  const discoveryRequest$ =
    sources.state.stream
      .take(1)
      .map(state => ({
        url: sources.util.getFullUrl('/movie/popular?language=en-US&page=1'),
        category: 'discovery'
      }))

  const discoveryResponse$ =
    sources.HTTP
      .select('discovery')
      .map(resp$ => resp$.replaceError(err => xs.of(err)))
      .flatten()

  const discoveryThumbnails$ =
    discoveryResponse$
      .filter(resp => !(resp instanceof Error))
      .map(resp => JSON.parse(resp.text))

  const searchRequest$ =
    sources.state.stream
      .filter(not(isDiscoveryMode))
      .map(get('searchPhrase'))
      .compose(dropRepeats())
      .map(searchPhrase => ({
        url: sources.util.getFullUrl(`/search/movie?query=${searchPhrase}`),
        category: 'search'
      }))

  const searchResponse$ =
    sources.HTTP
      .select('search')
      .map(resp$ => resp$.replaceError(err => xs.of(err)))
      .flatten()

  const searchThumbnails$ =
    searchResponse$
      .filter(resp => !(resp instanceof Error))
      .map(resp => JSON.parse(resp.text))
      .startWith({ results: [] })

  const thumbnails$ = xs
    .combine(isDiscoveryMode$, discoveryThumbnails$, searchThumbnails$)
    .map(([isDiscoveryMode, discoveryThumbnails, searchThumbnails]) =>
      isDiscoveryMode ? discoveryThumbnails : searchThumbnails
    )
    .remember()

  const isLoading$ = xs.merge(
    discoveryRequest$.mapTo(true),
    discoveryResponse$.mapTo(false),
    searchRequest$.mapTo(true),
    searchResponse$.mapTo(false)
  ).startWith(false)

  const errorMessage$ =
    xs.merge(discoveryResponse$, searchResponse$)
      .filter(resp => resp instanceof Error)
      .startWith('')

  const http$ = xs.merge(
    discoveryRequest$,
    searchRequest$
  )

  return [
    <div className='HomePage'>
      <h1>TMDb UI – Home</h1>

      <SearchBar scope='searchPhrase' title='Search for a Title:' />

      <h3 className='uk-heading-bullet uk-margin-remove-top'>
        <If cond={isDiscoveryMode$}
          then='Popular Now'
          else={<>Search Results for "{$.searchPhrase}":</>}
        />
      </h3>

      <ResultsContainer
        scope={{ state: pickLens('movieId', 'cache') }}
        {...{ thumbnails$, isLoading$, errorMessage$ }}
      />
    </div>,
    { HTTP: http$ }
  ]
}
