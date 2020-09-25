const RW = .35

let monacoEditor
let playLoaded = false
let playScript

function syncIn() {
    if (!monacoEditor) return

    const patchLog = _._$._patchLog
    if (!patchLog) return

    // locate play script def
    patchLog.forEach(p => {
        if (p.path === 'lab/play') {
            playScript = p
            playLoaded = true
        }
    })

    if (!playScript) {
        // create a placeholder
        playScript = {
            base: _._$,
            ext: "js",
            name: "play",
            path: "lab/play",
            src: '',
        }
    }

    const playSrc = playScript.src
    monacoEditor.setValue(playSrc)
}

function syncOut() {
    const gsys = _._$.sys
    const src = monacoEditor.getValue()

    playScript.src = src
    gsys.evalLoadedContent(playScript, _._$)
}

function setupGridLayout() {
    const gsys = _._$.sys

    gsys.expandCanvas = function(name) {
        const w = window.innerWidth
        const h = window.innerHeight
        gsys.placeCanvas(name, w*RW, 0, w*(1-RW), h)

        const editor = document.getElementById('editor')
        editor.style.display = 'block'
        editor.style.left = '0px'
        editor.style.top = '0px'
        editor.style.width = RW*w + 'px'
        editor.style.height = h + 'px'

        if (editor.layout) editor.layout()
    }
    syncIn()
    gsys.expandCanvas()
}

function setupMonoLayout() {
    const gsys = _._$.sys

    gsys.expandCanvas = function(name) {
        const w = window.innerWidth
        const h = window.innerHeight
        gsys.placeCanvas(name, 0, 0, w, h)

        const editor = document.getElementById('editor')
        editor.style.display = 'none'
    }
    syncOut()
    gsys.expandCanvas()
}

function createMonaco() {
    const editor = document.createElement('div')
    editor.id = 'editor'
    editor.style.position = 'absolute'
    editor.style.border = '0px'
    editor.style.margin = '0px'
    editor.style.padding = '0px'
    editor.style.left = '0px'
    editor.style.top = '0px'
    editor.style.width = '100px'
    editor.style.height = '100px'

    editor.style.backgroundColor = '#808080'

    //document.body.appendChild(editor)
    const container = document.getElementById('container')
    container.appendChild(editor)

    /*
    // create a splitter
    Split(['#editor', '#canvas'], {
        sizes: [27, 73],
        direction: 'horizontal',
        gutterAlign: 'center',
    })
    */

    const ed = monaco.editor.create(editor, {
        value: '',
        language: 'javascript',
        fontSize: '20px',
        lineNumbers: 'on',
        automaticLayout: true,
        theme: 'vs-dark',
    })
    monacoEditor = ed

    monaco.editor.defineTheme('monokai', lib.themes['Monokai'])
    monaco.editor.setTheme('monokai');

    setupGridLayout()
}

function setupPlayground() {
    createMonaco()
    env.created = true
    env.visible = true
}
