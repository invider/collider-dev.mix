if (!window.monacoLoadedFlag) {

    // include split.js
    const split = document.createElement('script')
    // TODO why local sources dont work?
    split.src = "collider-dev.mix/js/split.js/split.min.js"
    document.head.appendChild(split)

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = 'collider-dev.mix/css/playground.css'
    document.head.appendChild(link)

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

    window.monacoLoadedFlag = true
    module.exports = {}
}
