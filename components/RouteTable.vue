<template>
  <ul>
    <Route v-for="route in routes" v-bind:key="route.path" v-bind:route="route" />
  </ul>
</template>

<script>
  import Route from '~components/Route.vue'

  export default {
    components: {
      Route,
    },

    props: {
      routes: {
        type: Array,
        required: true,
      },
    },
  }
</script>

<style scoped>
ul {
  margin-top: 1em;
}
</style>
