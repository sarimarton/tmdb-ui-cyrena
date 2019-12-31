import { mergeWith, makeAction } from 'powercycle/util'
import { urlLens } from './util'

const initialState = {
  searchPhrase: '',
  movieId: null,
  cache: {}
}

const reducers = {
  changeQuery: query =>
    mergeWith({ searchPhrase: query }),

  changeUrl: url => prevState =>
    urlLens.set(prevState, url),

  selectMovie: record =>
    mergeWith({
      movieId: record.id,
      cache: { movieTitle: record.title }
    }),

  goHome: () =>
    reducers.selectMovie({ id: null })
}

export const changeQuery = makeAction('changeQuery')
export const changeUrl = makeAction('changeUrl')
export const selectMovie = makeAction('selectMovie')
export const goHome = makeAction('goHome')

export default (state = initialState, [action, payload]) => {
  return action
    ? reducers[action](payload)(state)
    : state
}
