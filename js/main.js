function updateDebugInfo() {
  var w = $(window)

  $('#debugInfo').html(w.width() + 'x' + w.height())
}

$(() => {
  var div = $('#debugInfo')
  if (div.length >= 1) {
    updateDebugInfo()
    $(window).resize(updateDebugInfo)
  }
})
