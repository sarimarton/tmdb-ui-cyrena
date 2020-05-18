import { pickBy, compact } from 'cyrena/fp'

export const urlLens = {
  get: state =>
    '/' + [
      ...compact([
        state.searchPhrase && `search/${state.searchPhrase}`,
        state.movieId && `movie/${state.movieId}`
      ])
    ].join('/'),

  set: (state, url) => ({
    ...state,
    ...pickBy()(
      url.match(
        /^\/$|^(?:\/search\/(?<searchPhrase>[^/]+))?(\/movie\/(?<movieId>\d+))?$/
      ).groups
    )
  })
}
