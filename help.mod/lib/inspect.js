
function addPath(base, path) {
    if (!base) return path
    if (!path) return base

    if (base.endsWith('/')) return base + path
    else return base + '/' + path
}

function match(path, ignore) {
    let ignored = false

    ignore.forEach(r => {
        if (path.match(r)) ignored = true
    })

    return ignored 
}

function inspectPrototype(node, prev, name, path, cache,
                parentMeta, modMeta, meta, usageRefinements, level) {
    if (name === 'constructor') return

    if (isClass(node)) {
        inspectPrototype(node.prototype, node, name, path, cache,
            parentMeta, modMeta, meta, usageRefinements, level)
        return
    }

    if (isObj(node) && !isFun(node)) {
        //for (const name in node) {
        //Object.keys(node).forEach(subname => {
        Object.getOwnPropertyNames(node).forEach(subname =>  {
            const fn = node[subname]
            if (!fn) return
            if (fn.name === 'constructor') return

            let submeta = inspect(fn, node, subname, meta.path,
                cache, meta, modMeta, level)

            if (submeta) {
                //submeta = sys.clone(submeta)
                //submeta.path = addPath(meta.path, subname)
                const refine = usageRefinements[subname]
                if (refine) submeta.data = supplement(submeta.data, refine)
                //if (level > 0) submeta.inherited = true
            }

            if (level > 0) {
                if (!meta.dir[subname] && !meta.idir[subname]) {
                    meta.idir[subname] = submeta
                }
            } else {
                if (!meta.dir[subname]) {
                    meta.dir[subname] = submeta
                }
            }
        })
    }

    if (node.prototype) {
        inspectPrototype(node.prototype, node, name, path, cache,
            parentMeta, modMeta, meta, usageRefinements, level+1)
    }

    if (node.__proto__) {
        inspectPrototype(node.__proto__, node, name, path, cache,
            parentMeta, modMeta, meta, usageRefinements, level+1)
    }
}

function inspect(node, parent, name, path, cache, parentMeta, modMeta, level) {
    if (!node) return
    if (name === 'constructor') return
    if (node._meta && node._meta.hint === 'ignore') return

    const meta = {}

    if (path === '') meta.path = '/'
    else meta.path = addPath(path, name)

    if (match(meta.path, cache.ignore)) return

    const icache = cache.node.indexOf(node)

    if (icache >= 0) {
        // fix cached data if on the proper level
        const cachedMeta = cache.meta[icache]
        if (level === 0) {
            // fix path and mod
            cachedMeta.path = meta.path
            if (parentMeta) cachedMeta.parent = parentMeta.id
            if (modMeta) {
                cachedMeta.mod = modMeta.id
                cachedMeta.modName = modMeta.name
            }
        }
        return cachedMeta
    }

    if (!isNumber(node) && !isString(node)) {
        cache.node.push(node)
        cache.meta.push(meta)
    }

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
                const submeta = inspect(next, node, k, meta.path,
                    cache, meta, pmod, level)
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

        let usageRefinements = {}
        if (meta.data && meta.data.dir) {
            usageRefinements = meta.data.dir
            delete meta.data.dir
        }

        if (node.prototype && (Object.keys(node.prototype).length > 1
                    || node.name.match(/^[A-Z].*/))) {
            meta.kind = isClass(node)? 'class' : 'cons'
            meta.dir = meta.dir || {}
            meta.idir = meta.idir || {}

            inspectPrototype(node.prototype, node, name, path, cache,
                parentMeta, modMeta, meta, usageRefinements, 0)
            /*
            //inspectPrototype(node, node, name, path, cache,
            //    parentMeta, modMeta, meta, usageRefinements, 0)
            if (isClass(node)) {
                inspectPrototype(node, node, name, path, cache,
                    parentMeta, modMeta, meta, usageRefinements, 0)
            } else {
            }
            */

            if (isEmpty(meta.dir)) delete meta.dir
            if (isEmpty(meta.idir)) delete meta.idir
        }

        // TODO do we really have a use case for source here?
        //meta.src = node.toString()

    } else if (isArray(node)) {
        meta.kind = 'array'
        if (node.constructor) meta.proto = node.constructor.name
        meta.data = node._meta

    } else if (isObj(node)) {
        meta.kind = 'Node'
        if (node.constructor) meta.proto = node.constructor.name
        meta.data = node._meta

        meta.dir = {}

        Object.keys(node).forEach(k => {
            if (k.startsWith('_')) return

            const next = node[k]
            if (cache.node.indexOf(next) < 0) {
                const submeta = inspect(next, node, k, meta.path,
                    cache, meta, modMeta, 0)
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

    if (node._meta) {
        cache.annotatedCount ++
    }


    if (isEmpty(meta.data)) delete meta.data

    if (!meta.data || !meta.data.head) {
        cache.todo.push(meta.path)
    }

    return meta
}
