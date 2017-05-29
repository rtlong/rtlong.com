<template>
  <div>
    <h1>Blog.vue (parent page)</h1>
    <p>What follows is the child page:</p>
    <div class="child">
      <router-view />
    </div>
  </div>
</template>

<script>
  export default {
  }
</script>

<style scoped>
.child {
  margin: 3em 0;
  box-shadow: #999 0px 0px 10px 0px;
  padding: 2em;
}
</style>
