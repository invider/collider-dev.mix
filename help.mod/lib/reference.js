

function compileSummary(m) {
    if (m.type === 'function') {
        const name = m.name.trim()
        const usage = m.data.usage? m.data.usage.trim() : '()'
        const head = m.data.head? ' - ' + m.data.head.trim() : ''

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
