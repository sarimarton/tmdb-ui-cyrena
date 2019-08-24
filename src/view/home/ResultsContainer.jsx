import withPower from 'powercycle'
import xs from 'xstream'
import { $, $map, $not, collection, mergeWith, Debug } from 'powercycle/util'

import './ResultsContainer.css'

export function ResultsContainer (sources) {

  return (
    <div className='ResultsContainer'>
      <div if={sources.props.isLoading$}>Loading...</div>
      <div if={sources.props.errorMessage$}>Network error: {sources.props.errorMessage$}</div>

      <ul className='uk-thumbnav'>
        {collection($(sources.props.thumbnails$).results, {
          // keyProp: 'id',
          itemCmp: ({ props: { item$, initialValues } }) =>
            <li className='uk-margin-bottom' if={$(item$).backdrop_path}>
              <a className='ResultsContainer__result-item' onClick={ev => mergeWith({
                movieId: initialValues.item.id,
                cache: { movieTitle: initialValues.item.title }
              })}>
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
