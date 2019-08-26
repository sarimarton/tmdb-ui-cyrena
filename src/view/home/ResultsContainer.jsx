import withPower from 'powercycle'
import { $, collection, mergeWith } from 'powercycle/util'
import sample from 'xstream-sample'

import './ResultsContainer.css'

export function ResultsContainer ({ props: { isLoading$, errorMessage$, thumbnails$ } }) {
  return (
    <div className='ResultsContainer'>
      <div if={isLoading$}>Loading...</div>
      <div if={errorMessage$}>Network error: {errorMessage$}</div>

      <ul className='uk-thumbnav'>
        {collection($(thumbnails$).results, {

          itemCmp: ({ props: { item$ } }) =>
            <li className='uk-margin-bottom' if={$(item$).backdrop_path}>
              <a className='ResultsContainer__result-item' onClick={{
                state: ev$ => sample(item$)(ev$).map(item => mergeWith({
                  movieId: item.id,
                  cache: { movieTitle: item.title }
                }))
              }}>
                <div className='ResultsContainer__thumbnail-holder'>
                  <img src={item$.map(item => `http://image.tmdb.org/t/p/w300${item.backdrop_path}`)} />
                </div>
                <div className='ResultsContainer__caption uk-text-small uk-text-muted'>
                  {$(item$).title}
                </div>
              </a>
            </li>

        })}
      </ul>
    </div>
  )
}
