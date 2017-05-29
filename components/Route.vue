<template>
  <li class="route">
    <router-link :to="linkPath">
      <span class="path">{{ linkPath }}</span>&nbsp;<span class="name">("{{ name }}")</span>
    </router-link>
    <ul v-if="children.length > 0">
      <Route v-for="child in children" :key="child.path" :route="child" :parentPath="path" />
    </ul>
  </li>
</template>

<script>
  export default {
    name: 'Route',

    props: {
      parentPath: String,
      route: {
        type: Object,
        required: true,
      },
    },

    computed: {
      name: function () { return this.route.name },
      path: function () { return this.route.path },
      linkPath: function () { return this.route.path },
      children: function () { return this.route.children || [] },
    },
  }
</script>

<style scoped>
a {
  text-decoration: none;
  color: black;
}
a:visited {
  color: black;
}
.path {
  font-family: monospace;
}
</style>
