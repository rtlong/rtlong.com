import Vue from 'vue'

import { router } from './router'
import './ui-framework'
import './global-components'
import '~assets/global.css'

const App = {
  template: '<div id="#app"><router-view /></div>',
  name: 'AppRoot'
}

const $app = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
