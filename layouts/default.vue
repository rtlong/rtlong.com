<template>
  <div>
    <HeaderBar />
    <section class="section">
      <nuxt />
    </section>
    <FooterBar />
  </div>
</template>

<script>
  export default {
    props: ['title'],

    components: {
      HeaderBar: require('~components/HeaderBar'),
      FooterBar: require('~components/FooterBar'),
    },
  }
</script>

<style>
</style>
