
export function dump(index, content) {
    const panel = document.getElementById('tags')
    const body = document.getElementById('help')
    panel.innerHTML = index
    body.innerHTML = content
}

export function clear() {
    dump('', '')
}

export function parentPath(path) {
    if (path === '/') return
    const i = path.lastIndexOf('/')

    if (i < 0) return

    if (i === 0) return '/'
    else return path.substring(0, i)
}

