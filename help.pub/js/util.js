
export function clear() {
    const help = document.getElementById('help')
    const tags = document.getElementById('tags')
    help.innerHTML = ''
    tags.innerHTML = ''
}

export function parentPath(path) {
    if (path === '/') return
    const i = path.lastIndexOf('/')

    if (i < 0) return

    if (i === 0) return '/'
    else return path.substring(0, i)
}

