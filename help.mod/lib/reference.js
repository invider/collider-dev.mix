function compileSummary(m) {
    if (m.type === 'function') {
        let name = m.name.trim()
        name = `<a href="#./alt/${name}">${name}`

        let usage = '()'
        let head = ''

        if (m.data) {
            if (m.data.usage) usage = m.data.usage.trim()
            if (m.data.head) head = ' - ' + m.data.head.trim()
        }

        return `*${name}${usage}</a>*${head}\n\n`
    } else {
    }
    return ''
}

function reference(meta, cache) {

    const ref = {
        id: ++cache.id,
        kind: 'page',
        name: 'Jam Card',
    }

    ref.path = 'jam-card'
    meta.pages[ref.path] = ref
    cache.pagesCount ++

    ref.body = Object.values(meta.scene.dir.alt.dir)
            .map(m => compileSummary(m)).join('')
}
