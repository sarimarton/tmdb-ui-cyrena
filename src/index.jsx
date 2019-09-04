import { run } from '@cycle/run'
import { withState } from '@cycle/state'
import { makeHTTPDriver } from '@cycle/http'
import { timeDriver } from '@cycle/time'
import { makeHashHistoryDriver } from '@cycle/history'

import { App } from './view/App.jsx'

import withPower, { makeDOMDriver } from 'powercycle'

const drivers = {
  react: makeDOMDriver(document.getElementById('root')),
  HTTP: makeHTTPDriver(),
  history: makeHashHistoryDriver(),
  Time: timeDriver,
  util: () => ({
    getFullUrl: url => url
      .replace(/^/, 'https://api.themoviedb.org/3')
      .replace(/(\?|$)/, '?api_key=bf6b860ab05ac2d94054ba9ca96cf1fa&')
  })
}

run(withPower(App), drivers)
