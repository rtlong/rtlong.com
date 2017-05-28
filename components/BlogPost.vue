<template>
  <section class="blogPost">
    <h2>{{ title }}</h2>
    <slot/>
  </section>
</template>

<script>
  export default {
    props: ['title'],
  }
</script>

<style scoped>
</style>
