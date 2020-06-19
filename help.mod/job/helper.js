/*
 * Inspect scene and send gathered metadata to jam server.
 */
function listModPages(pages, cache, pageSet) {
    pages._ls.forEach(p => {
        if (isString(p)) return
        const page = augment({}, p)
        page.kind = 'page'
        page.id = ++cache.id
        cache.pagesCount ++
        page.name = p.pageName
        delete page.pageName
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

function postMetadata(meta) {
    fetch('help/sync', {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(meta),
        
    }).then((res) => {
        if (res.status !== 200) {
            log.err(`unable to sync help data - http response ${res.status}`)
        } else {
            res.text().then( txt => log('metadata upload: ' + txt))
        }

    }).catch((err) => {
        log.err(`unable to sync help data - ${err}`)
    })
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
        todo: [],
    }

    const meta = {}

    meta.scene = lib.inspect($, '$', '', cache)
    //meta.pages = listPages($.man.pages, cache)
    meta.pages = {}
    listPages($, cache, meta.pages)
    lib.reference(meta, cache)

    meta.pagesInspected = cache.pagesCount
    meta.nodesAnnotated = cache.annotatedCount
    meta.nodesInspected = cache.nodesCount
    meta.todo = cache.todo

    postMetadata(meta)
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
    if (!_$.env.config.debug) return

    lib.fixMeta()

    let ignore = collectIgnoreRules($, [])
    ignore = normalizeIgnoreRules(ignore)

    if (_$.env.config.dynamic) {
        doReport(ignore)
    } else {
        log.warn('ignoring metadata report - not in dynamic mode')
    }
}
