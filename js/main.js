function updateDebugInfo() {
  var el = document.getElementById('debugInfo')

  var width = window.innerWidth;
  var height = window.innerHeight;
  el.innerHTML = `W:${width}px H:${height}px`
}

window.addEventListener('resize', updateDebugInfo)

document.addEventListener('DOMContentLoaded', () => {
  loadPageJson()
    .then(d => {
      window.hugoPage = d
      console.log('Hugo Page:', d)
      complainAboutPageMetadata(d)
    })
    .catch(err => console.error(err))

  updateDebugInfo()
})

function complainAboutPageMetadata(p) {
  if (!p.htmlTitle) console.error('HTML <title> (.Scratch.Set "title") is unset!')
  if (!p.title) console.error('.Title is unset!')
  if (!p.description) console.error('.Description is unset!')
  if (!p.date) console.error('.Date is unset!')
}

function loadPageJson() {
  let url = window.pageJsonUrl
  if (!url) return Promise.resolve(null)

  return fetch(url).then(resp => resp.json())
}
