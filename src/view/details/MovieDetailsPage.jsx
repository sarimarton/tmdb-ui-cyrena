import withPower, { powercycle } from 'powercycle'
import { $, $and, $not, $or, If, $if } from 'powercycle/util'
import { get, identity } from 'powercycle/fp'
import xs from 'xstream'

import './MovieDetailsPage.css'

export function MovieDetailsPage (sources) {
  const movieId$ =
    sources.state.stream
      .map(get('movieId'))
      .filter(identity)

  const detailsRequest$ =
    movieId$
      .map(movieId => ({
        url: sources.util.getFullUrl(`/movie/${movieId}`),
        category: 'details'
      }))

  const detailsResponse$ =
    sources.HTTP
      .select('details')
      .map(resp$ => resp$.replaceError(err => xs.of(err)))
      .flatten()

  const details$ =
    detailsResponse$
      .filter(resp => !(resp instanceof Error))
      .map(resp => JSON.parse(resp.text))
      .remember()

  const creditsRequest$ =
    movieId$
      .map(movieId => ({
        url: sources.util.getFullUrl(`/movie/${movieId}/credits`),
        category: 'credits'
      }))

  const creditsResponse$ =
    sources.HTTP
      .select('credits')
      .map(resp$ => resp$.replaceError(err => xs.of(err)))
      .flatten()

  const credits$ =
    creditsResponse$
      .filter(resp => !(resp instanceof Error))
      .map(resp => JSON.parse(resp.text))
      .remember()

  const isLoading$ = xs.merge(
    detailsRequest$.mapTo(true),
    detailsResponse$.mapTo(false)
  ).startWith(false)

  const errorMessage$ =
    xs.merge(detailsResponse$, creditsResponse$)
      .filter(resp => resp instanceof Error)
      .startWith('')

  const http$ = xs.merge(
    detailsRequest$,
    creditsRequest$
  )

  return [
    <div>
      <h1 if={movieId$}>
        <If cond={$.cache.movieTitle} then={$.cache.movieTitle}
          else={<If cond={isLoading$} then='' else={$(details$).title} />}
        />
      </h1>

      <div if={isLoading$}>Loading...</div>
      <div if={errorMessage$}>Network error: {errorMessage$}</div>

      <div if={$and(details$, credits$, $not(isLoading$))} className='MovieDetailsPage'>
        <div className='MovieDetailsPage__img-container uk-margin-right' style={{ float: 'left ' }}>
          <img src={details$.map($ => `http://image.tmdb.org/t/p/w342${$.poster_path}`)} alt='' />
        </div>
        <dl className='uk-description-list'>
          <dt>Popularity</dt>
          <dd>{$(details$).vote_average}</dd>
          <dt>Overview</dt>
          <dd>{$(details$).overview}</dd>
          <dt>Genres</dt>
          <dd>{$(details$).genres.map(get('name')).join(', ')}</dd>
          <dt>Starring</dt>
          <dd>{$(credits$).cast.slice(0, 3).map(get('name')).join(', ')}</dd>
          <dt>Languages</dt>
          <dd>{$(details$).spoken_languages.map(get('name')).join(', ')}</dd>
          <dt>Original Title</dt>
          <dd>{$(details$).original_title}</dd>
          <dt>Release Date</dt>
          <dd>{$(details$).release_date}</dd>
          <If cond={$(details$).imdb_id}>
            <dt>IMDb URL</dt>
            <dd>
              <a href={details$.map(details =>
                `https://www.imdb.com/title/${details.imdb_id}/`
              )}>
                https://www.imdb.com/title/{$(details$).imdb_id}/
              </a>
            </dd>
          </If>
        </dl>
      </div>
    </div>,
    { HTTP: http$ }
  ]
}
