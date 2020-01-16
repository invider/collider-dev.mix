/*
 * Inspect scene and send gathered metadata to jam server.
 */

function addPath(base, path) {
    if (!base) return path
    if (!path) return base

    if (base.endsWith('/')) return base + path
    else return base + '/' + path
}

function init() {
    /*
    // start helper job when in dymanic mode
    if (env.config.dynamic && env.config.debug) {
        setTimeout(report, 1000)
    }
    */
}

function doReport() {
    const cache = {
        id: 0,
        node: [],
        meta: [],
        annotatedCount: 0,
    }

    const meta = {}

    meta.scene = inspect($, '$', '', cache)
    //meta.pages = listPages($.man.pages, cache)
    meta.pages = {}
    listPages($, cache, meta.pages)
    meta.nodesInspected = cache.id
    meta.nodesAnnotated = cache.annotatedCount
    
    fetch('help/sync', {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(meta),
        
    }).then((res) => {
        if (res.status !== 200) {
            log.error(`unable to sync help data - http response ${res.status}`)
        } else {
            res.text().then( txt => log('metadata upload: ' + txt))
        }

    }).catch((err) => {
        log.error(`unable to sync help data - ${err}`)
    })
}

function report() {
    lib.fixMeta()

    if ($.env.config.dynamic) {
        doReport()
    } else {
        log.warn('ignoring metadata report - not in dynamic mode')
    }
}

function inspect(node, name, path, cache, parentMeta, modMeta) {
    if (node._meta && node._meta.hint === 'ignore') return

    const meta = {}

    const icache = cache.node.indexOf(node)
    if (icache >= 0) {
        return cache.meta[icache]
    }
    cache.node.push(node)
    cache.meta.push(meta)

    meta.id = ++cache.id
    meta.name = name || node.name
    meta.type = typeof node
    if (path === '') meta.path = '/'
    else meta.path = addPath(path, name)
    if (parentMeta) meta.parent = parentMeta.id
    if (modMeta) {
        meta.mod = modMeta.id
        meta.modName = modMeta.name
    } else {
        modMeta = meta
    }

    if (node._meta) cache.annotatedCount ++

    if (isFrame(node)) {
        meta.kind = 'Frame'
        if (node.constructor) meta.proto = node.constructor.name
        meta.data = node._meta

        meta.dir = {}

        Object.keys(node._dir).forEach(k => {

            const next = node._dir[k]
            const icache = cache.node.indexOf(next)
            if (icache < 0) {
                let pmod = modMeta
                if (parentMeta && parentMeta.name === 'mod') pmod = meta
                const submeta = inspect(next, k, meta.path,
                    cache, meta, pmod)
                meta.dir[k] = submeta
            } else {
                const id = cache.meta[icache].id
                meta.dir[k] = {
                    name: k,
                    link: id,
                }
            }
        })

    } else if (isFun(node)) {
        meta.kind = 'function'
        meta.data = node._meta
        // TODO do we really have a use case for source here?
        //meta.src = node.toString()

    } else if (isArray(node)) {
        meta.kind = 'array'
        if (node.constructor) meta.proto = node.constructor.name
        meta.data = node._meta

    } else if (isObj(node)) {
        meta.kind = 'Node Object'
        if (node.constructor) meta.proto = node.constructor.name
        meta.data = node._meta

        meta.dir = {}

        Object.keys(node).forEach(k => {
            const next = node[k]
            if (cache.node.indexOf(next) < 0) {
                const submeta = inspect(next, k, meta.path,
                    cache, meta, modMeta)
                if (submeta) meta.dir[k] = submeta

            } else {
                return
                /*
                meta.dir[k] = {
                    name: k,
                    'class': typeof next,
                    title: 'circular',
                }
                */
            }
        })

    } else {
        meta.name = name
        meta['class'] = typeof node
        meta.title = 'unknown'
    }
    return meta
}

function listModPages(pages, cache, pageSet) {
    pages._ls.forEach(p => {
        if (isString(p)) return
        const page = augment({}, p)
        page.kind = 'page'
        page.id = ++cache.id
        page.name = p.pageName
        page.path = p.name
        pageSet[p.name] = page
    })
}

function listPages(mod, cache, pageSet) {
    if (mod.man && mod.man.pages) {
        listModPages(mod.man.pages, cache, pageSet)
    }

    if (mod.mod.length > 0) {
        mod.mod._ls.forEach(submod => {
            listPages(submod, cache, pageSet)
        })
    }
}
