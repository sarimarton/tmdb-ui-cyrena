import withPower from 'powercycle'
import { $, $and, $not, If, request } from 'powercycle/util'
import { get, identity } from 'powercycle/fp'
import xs from 'xstream'

import './MovieDetailsPage.css'

export function MovieDetailsPage(sources) {
  const movieId$ = sources.state.stream.map(get('movieId')).filter(identity)

  const details = request(
    movieId$.map($ => sources.util.getFullUrl(`/movie/${$}`)),
    sources
  )

  const credits = request(
    movieId$.map($ => sources.util.getFullUrl(`/movie/${$}/credits`)),
    sources
  )

  const errorMessage$ = xs.merge(details.errorMessage$, credits.errorMessage$)

  const http$ = xs.merge(details.request$, credits.request$)

  return [
    <div>
      <h1 if={movieId$.startWith(false)}>
        <If
          cond={$.cache.movieTitle}
          then={$.cache.movieTitle}
          else={
            <If
              cond={details.isLoading$}
              then=""
              else={$(details.content$).title}
            />
          }
        />
      </h1>

      <div if={details.isLoading$}>Loading...</div>
      <div if={errorMessage$}>Network error: {errorMessage$}</div>

      <div
        if={$and(details.content$, credits.content$, $not(details.isLoading$))}
        className="MovieDetailsPage"
      >
        <div
          className="MovieDetailsPage__img-container uk-margin-right"
          style={{ float: 'left ' }}
        >
          <img
            src={details.content$.map(
              $ => `http://image.tmdb.org/t/p/w342${$.poster_path}`
            )}
            alt=""
          />
        </div>
        <dl className="uk-description-list">
          <dt>Popularity</dt>
          <dd>{$(details.content$).vote_average}</dd>
          <dt>Overview</dt>
          <dd>{$(details.content$).overview}</dd>
          <dt>Genres</dt>
          <dd>
            {$(details.content$)
              .genres.map(get('name'))
              .join(', ')}
          </dd>
          <dt>Starring</dt>
          <dd>
            {$(credits.content$)
              .cast.slice(0, 3)
              .map(get('name'))
              .join(', ')}
          </dd>
          <dt>Languages</dt>
          <dd>
            {$(details.content$)
              .spoken_languages.map(get('name'))
              .join(', ')}
          </dd>
          <dt>Original Title</dt>
          <dd>{$(details.content$).original_title}</dd>
          <dt>Release Date</dt>
          <dd>{$(details.content$).release_date}</dd>
          <If cond={$(details.content$).imdb_id}>
            <dt>IMDb URL</dt>
            <dd>
              <a
                href={details.content$.map(
                  details => `https://www.imdb.com/title/${details.imdb_id}/`
                )}
              >
                https://www.imdb.com/title/{$(details.content$).imdb_id}/
              </a>
            </dd>
          </If>
        </dl>
      </div>
    </div>,
    { HTTP: http$ }
  ]
}
