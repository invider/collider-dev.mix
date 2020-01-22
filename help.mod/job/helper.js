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

function match(path, ignore) {
    let ignored = false

    ignore.forEach(r => {
        if (path.match(r)) ignored = true
    })

    return ignored 
}

function inspect(node, name, path, cache, parentMeta, modMeta) {
    if (!node) return
    if (node._meta && node._meta.hint === 'ignore') return

    const meta = {}

    if (path === '') meta.path = '/'
    else meta.path = addPath(path, name)

    if (match(meta.path, cache.ignore)) return

    const icache = cache.node.indexOf(node)
    if (icache >= 0) {
        return cache.meta[icache]
    }
    cache.node.push(node)
    cache.meta.push(meta)

    meta.id = ++cache.id
    cache.nodesCount ++ 
    meta.name = name || node.name
    meta.type = typeof node
    if (parentMeta) meta.parent = parentMeta.id
    if (modMeta) {
        meta.mod = modMeta.id
        meta.modName = modMeta.name
    } else {
        modMeta = meta
    }

    if (node._meta) cache.annotatedCount ++

    if (isFrame(node)) {
        meta.kind = node._dna? node._dna : 'Frame'
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
        cache.pagesCount ++
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

function doReport(ignore) {
    const cache = {
        id: 0,
        node: [],
        meta: [],
        ignore: ignore,
        nodesCount: 0,
        pagesCount: 0,
        annotatedCount: 0,
    }

    const meta = {}

    meta.scene = inspect($, '$', '', cache)
    //meta.pages = listPages($.man.pages, cache)
    meta.pages = {}
    listPages($, cache, meta.pages)
    meta.pagesInspected = cache.pagesCount
    meta.nodesAnnotated = cache.annotatedCount
    meta.nodesInspected = cache.nodesCount
    
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

function collectIgnoreRules(mod, ignore) {
    if (mod.man && mod.man.ignore) {
        ignore.push(mod.man.ignore)
    }

    if (mod.mod.length > 0) {
        mod.mod._ls.forEach(submod => {
            collectIgnoreRules(submod, ignore)
        })
    }

    return ignore
}

function normalizeIgnoreRules(ignore) {
    let rules = ignore.flat()
    rules = rules.filter(r => r.length > 0 && !r.startsWith('--'))
                .map(r => r.replace('/', '\\/').replace('*', '.*'))
    return rules
}


function report() {
    lib.fixMeta()

    let ignore = collectIgnoreRules($, [])
    ignore = normalizeIgnoreRules(ignore)

    if ($.env.config.dynamic) {
        doReport(ignore)
    } else {
        log.warn('ignoring metadata report - not in dynamic mode')
    }
}

