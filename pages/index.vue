<template>
  <div class="centered">
    <div class="centered-content">
      <Logo/>
      <h1 class="title is-1">Ryan Long</h1>
      <h2 class="subtitle is-6">Ops/Software Engineer</h2>
      <div class="links">
        <a href="mailto:ryan@rtlong.com" class="button">Email</a>
        <a href="https://github.com/rtlong" target="_blank" class="button">GitHub</a>
        <router-link :to="{name: 'blog-index'}" tag="span">
          <a class="button">Blog</a>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import Logo from '~components/Logo.vue'

  export default {
    components: {
      Logo,
    },
  }
</script>

<style scoped>
.centered {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.logo {
  margin-bottom: 3em;
}
.links {
  margin-top: 3em;
}
</style>
