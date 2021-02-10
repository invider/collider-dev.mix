
export function render(index, content) {
    const panel = document.getElementById('tags')
    const body = document.getElementById('help')
    panel.innerHTML = index
    body.innerHTML = content
}

export function clear() {
    render('', '')
}

export function parentPath(path) {
    if (path === '/') return
    const i = path.lastIndexOf('/')

    if (i < 0) return

    if (i === 0) return '/'
    else return path.substring(0, i)
}

export const isObj = function(o) {
    return !!(o && typeof o === 'object')
}

export function isArray(o) {
    Array.isArray(o)
}

export function isEmpty(o) {
    if (!o) return true
    if (isObj(o)) {
        for (let prop in o) {
            if (o.hasOwnProperty(prop)) return false
        }
        return true

    } else if (isArray(o)) {
        return o.length === 0
    }
    return false
}

export function wrapHtml(content) {
    const html = '<html><head><title>Collider.JAM Help</title>'
        + '<link rel="Stylesheet" href="css/help.css">'
        + '</head>'
        + '<body>'
        + content
        + '</body></html>\n'
    return html
}

export function download(content, filename) {
    const data = encodeURIComponent(content)
    const a = document.createElement('a')
    a.setAttribute('href', 'data:text/html;charset=utf-8,' + data)
    a.setAttribute('download', filename)
    a.click()
}
