import React from 'cyrena'
import xs from 'xstream'

export function SearchBar (sources) {
  const value$ =
    xs.merge(
      sources.props.value$,
      sources.sel['input'].change['target.value']
    )

  const stateUpdate$ = value$
    .compose(sources.Time.debounce(250))
    // @ts-ignore
    .map(val => ['change', val])

  return [
    <>
      <legend className='uk-legend'>{sources?.props?.title}</legend>
      <div className='SearchBar uk-inline uk-margin-bottom'>
        <a
          className='uk-form-icon uk-form-icon-flip'
          uk-icon={value$.map(val => `icon:${val ? 'close' : 'search'}`)}
          onClick={ev => ['change', '']}
        />
        <input sel='input' className='SearchBar__input uk-input' value={value$} autoFocus />
      </div>
    </>,
    { state: stateUpdate$ }
  ]
}
