

function compileSummary(m) {
    if (m.type === 'function') {
        const name = m.name.trim()

        let usage = '()'
        let head = ''

        if (m.data) {
            if (m.data.usage) usage = m.data.usage.trim()
            if (m.data.head) head = ' - ' + m.data.head.trim()
        }

        return `*${name}${usage}*${head}\n\n`
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
