// include monaco scripts
window.require = { paths: { 'vs': 'collider-dev.mix/js/vs' } }

const style = document.createElement('style')
style.rel = "stylesheet"
style['data-name'] ="vs/editor/editor.main"
style.href = "js/vs/editor/editor.main.css"

const loader = document.createElement('script')
loader.src = "collider-dev.mix/js/vs/loader.js"
document.head.appendChild(loader)

const nls = document.createElement('script')
nls.src = "collider-dev.mix/js/vs/editor/editor.main.nls.js"
document.head.appendChild(nls)

const main = document.createElement('script')
main.src = "collider-dev.mix/js/vs/editor/editor.main.js"
document.head.appendChild(main)

module.exports = {}

