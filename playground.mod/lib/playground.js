function setupGridLayout() {
    const gsys = _._$.sys

    gsys.expandCanvas = function(name) {
        const w = window.innerWidth
        const h = window.innerHeight
        gsys.placeCanvas(name, w*.5, 0, w*.5, h)

        const editor = document.getElementById('editor')
        editor.style.display = 'block'
        editor.style.left = '0px'
        editor.style.top = '0px'
        editor.style.width = .5*w + 'px'
        editor.style.height = .5*h + 'px'

        if (editor.layout) editor.layout()
    }
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
    document.body.appendChild(editor)
    setupGridLayout()

    const ed = monaco.editor.create(document.getElementById('editor'), {
        value: [
            'function x() {',
            '\tconsole.log("Hello world!");',
            '}'
        ].join('\n'),
        language: 'javascript',
        fontSize: '20px',
        lineNumbers: 'on',
        automaticLayout: true,
        theme: 'vs-dark',
    })

    monaco.editor.defineTheme('monokai', lib.themes['Monokai'])
    monaco.editor.setTheme('monokai');
}

function setupPlayground() {
    createMonaco()
    env.created = true
    env.visible = true
}
