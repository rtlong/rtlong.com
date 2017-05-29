<template>
  <layout-default>
    <section class="section">
      <div class="heading">
        <h1 class="title is-1">Application Routes</h1>
      </div>
      <RouteTable :routes="routes" />
    </section>
  </layout-default>
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
