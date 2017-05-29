import Vue from 'vue'
import globals from '~components/globals'
import layouts from '~layouts/index'

function registerGlobalComponent(name, component) {
  console.log(`Registering ${name} component globally`)
  Vue.component(name, component)
}
for (let name in globals) {
  registerGlobalComponent(name, globals[name])
}

for (let name in layouts) {
  let componentName = 'layout-' + name
  registerGlobalComponent(componentName, layouts[name])
}