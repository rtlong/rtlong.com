import Vue from 'vue'
import VueRouter from 'vue-router'
import pify from 'pify'

export const router = new VueRouter({
  routes: [
    { path: '/',
      component: require('~pages/index.vue') },
    { path: '/routes',
      component: require('~pages/routes.vue') },
    { path: '/blog',
      component: require('~pages/blog.vue'),
      children: [
        { path: '',
          component: require('~pages/blog/index.vue') },
        { path: '1-first-post',
          component: require('~pages/blog/1-first-post.vue') },
        { path: ':id(\\d+)(-[a-zA-Z0-9_-]+)?',
          component: require('~pages/blog/_id.vue'),
          props: true,
        } ] } ],
})

Vue.use(VueRouter)
