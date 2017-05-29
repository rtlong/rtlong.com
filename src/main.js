import Vue from 'vue'

import '~/plugins/ui-framework'
import '~/plugins/global-components'
import { router } from './router'
import App from './App.vue'

const $app = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
