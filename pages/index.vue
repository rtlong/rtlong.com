<template>
  <section class="container">
    <div>
      <Logo/>
      <h1 class="title">Ryan Long</h1>
      <h2 class="subtitle">Ops/Software Engineer</h2>
      <div class="links">
        <a href="mailto:ryan@rtlong.com" class="button--green">Email</a>
        <a href="https://github.com/rtlong" target="_blank" class="button--grey">GitHub</a>
      </div>
    </div>
  </section>
</template>

<script>
  import Logo from '~components/Logo'

  export default {
    components: {
      Logo,
    },
  }
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}
.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}
.links {
  padding-top: 15px;
}
</style>
