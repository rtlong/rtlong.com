<template>
  <div>
    <h1>Application Routes</h1>
    <RouteTable :routes="routes" />
  </div>
</template>

<script>
  import RouteTable from '~components/RouteTable.vue'

  export default {
    components: {
      RouteTable,
    },

    data() {
      return {
        routes: this.$router.options.routes,
      }
    },
  }
</script>

<style scoped>
</style>
