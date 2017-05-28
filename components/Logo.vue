<template>
  <div class="logo">
    <div class="circle circle2" />
    <div class="circle circle1" />
  </div>
</template>

<style scoped>
.logo {
  display: inline-block;
  height: 180px;
  isolation: isolate;
  overflow: hidden;
  position: relative;
  width: 243px;
}
.circle {
  border-radius: 90px;
  border: 90px solid;
  height: 0;
  left: 0;
  mix-blend-mode: hard-light;
  position: absolute;
  top: 0;
  width: 0;
}
.circle1 {
  border-color: #8D4242;
}
.circle2 {
  border-color: #30415D;
  left: 63px;
}
</style>
