import Vue from 'vue'
import globals from '~components/globals'

for (let name in globals) {
  console.log(`Registering ${name} component globally`)
  Vue.component(name, globals[name])
}
