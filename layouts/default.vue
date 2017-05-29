<template>
  <div>
    <HeaderBar />
    <slot />
    <FooterBar />
  </div>
</template>

<script>
  import HeaderBar from '~components/HeaderBar.vue'
  import FooterBar from '~components/FooterBar.vue'

  export default {
    props: ['title'],

    components: {
      HeaderBar,
      FooterBar,
    },
  }
</script>

<style>
</style>
