<template>
  <div>
    <h1>Application Routes</h1>
    <RouteTable :routes="routes" />
  </div>
</template>

<script>
  import RouteTable from '~components/RouteTable'

  export default {
    components: {
      RouteTable,
    },

    asyncData(context) {
      return {
        routes: context.app.router.options.routes,
      }
    },
  }
</script>

<style scoped>
</style>
