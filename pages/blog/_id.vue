<template>
  <div>
    <h1>Page: <code>blog/_id.vue({{ JSON.stringify({ id }) }})</code></h1>
  </div>
</template>

<script>
  export default {
    props: ['id'],
  }
</script>

<routing>
{
  "path": "/blog/:id(\\d+)"
}
</routing>
