<template>
  <div>
    <h1>Page: <code>blog/_id.vue({ id: {{id}} })</code></h1>
    <h2>Context:</h2>
    <pre><code>{{ ctxJSON }}</code></pre>
  </div>
</template>

<script>
  export default {
    // data: {
    //   id: null,
    //   ctxJSON: '{}',
    // },
    validate({ params }) {
      return (params.id === 'foo')
    },
    asyncData(context) {
      return {
        id: context.params.id,
        ctxJSON: JSON.stringify({
          params: context.params,
          env: context.env,
          isDev: context.isDev,
          isClient: context.isClient,
          isServer: context.isServer,
          query: context.query,
          redirect: context.redirect,
        }, null, 2),
      }
    },
  }
</script>

<style scoped>
</style>
