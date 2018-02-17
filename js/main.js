function updateDebugInfo() {
  var el = document.getElementById('debugInfo')

  var width = window.innerWidth;
  var height = window.innerHeight;
  el.innerHTML = `W:${width}px H:${height}px`
}

window.addEventListener('resize', updateDebugInfo)
updateDebugInfo();
