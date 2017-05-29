import Vue from 'vue'
import VueRouter from 'vue-router'
import pathToRegexp from 'path-to-regexp'
import { log } from '~/src/util'

function loadAllPages() {
  let r = require.context('~pages', true, /\.vue$/)
  return r.keys().map(f => {
    return {
      filename: f,
      component: r(f),
    }
  })
}

class PageTreeNode {
  constructor() {
    this.children = new Map()
    this._page = null
  }

  child(key) {
    let childNode = this.children.get(key)
    if (!childNode) {
      childNode = new PageTreeNode()
      this.children.set(key, childNode);
    }
    return childNode
  }

  set page(page) {
    if (this.page) {
      throw new Error(`Node ${this} already has a page set!`)
    }
    this._page = page
  }
  get page() {
    return this._page
  }
}

function buildPageTree(pages) {
  let pageTree = new PageTreeNode()

  pages.forEach(page => {
    let node = pageTree
    let treePath = ''
    for (let part of page.pathParts) {
      node = node.child(part)
      treePath = treePath + '/' + part
    }
    node.page = page
  })

  return pageTree
}

function recursePageTree(tree) {
  let children = []
  tree.children.forEach(child => children.push(recursePageTree(child)))

  if (!tree.page) {
    throw new Error(`[router.js] Page tree node ${tree.page.filename} has no associated page. All directories in ~pages shall have a defined "parent" page component also defined.`)
  }

  let page = tree.page
  return buildRoute({
    page,
    children,
  })
}

function buildRoutesFromPageTree(pageTree) {
  return Array.from(pageTree.children.values()).map(node => recursePageTree(node))
}

function buildRoute({ page, children }) {
  let component = page.component
  let componentRoutingConfig = component.__routingConfig || {}
  let route = Object.assign({
    props: true,
    component,
    children,
  }, componentRoutingConfig)

  // automatically make dynamic route params for any file named starting with an underscore
  page.pathParts = page.pathParts.map(part => {
    return part.replace(/^_([a-zA-Z0-9]+)/, ':$1')
  })

  if (!route.path) {
    let pathParts = page.pathParts
    // drop '/index' from the end of the `path`
    if (pathParts.slice(-1)[0] === 'index') {
      pathParts = pathParts.slice(0, -1)
    }
    route.path = '/' + pathParts.join('/')
  }

  let componentName = page.pathParts.join('-')
  if (!route.name) {
    route.name = pathToRegexp.parse(page.pathParts.join('/'))
      .map(t => (typeof t === 'object') ? t.name : t)
      .join('/')
      .replace('/', '-')

    if (children.length !== 0) {
      route.name = route.name + '-parent'
      componentName = componentName + '-parent'
    }
  }

  if (!component.name) {
    // throw new Error(`Page component in ${page.filename} may not specify a routeName`)
    component.name = componentName + '-page'
  }

  return route
}

function buildRoutes(pages) {
  let routes = []

  routes = buildRoutesFromPageTree(buildPageTree(pages.map(page => {
    page.pathParts = page.filename.replace(/^.\//, '').replace(/.vue$/, '').split('/')
    return page
  })))

  log('Generated Routes:')
  routes.forEach(route => log(route))

  return routes
}

export const router = new VueRouter({
  routes: buildRoutes(loadAllPages()),
  mode: 'history',
})

Vue.use(VueRouter)
