function nextWord(line) {
    if (!line) return ''
    const at = line.indexOf(' ')
    if (at < 0) return line
    return line.substring(0, at)
}

function cutPrefix(line, prefix) {
    if (!line) return ''
    return line.substring(prefix.length, line.length)
}

function processTypes(details) {
    let types

    const lines = details.split('\n')
    for (let i = 0, ln = lines.length; i < ln; i++) {
        let line = lines[i].trim()
        if (line.startsWith('@')) {
            const tag = {}
            tag.id = nextWord(line)
            line = cutPrefix(line, tag.id).trim()
            tag.id = tag.id.substring(1, tag.id.length)

            if (line.startsWith('{')) {
                // type declaration
                tag.type = nextWord(line)
                line = cutPrefix(line, tag.type).trim()
                tag.type = tag.type.substring(1, tag.type.length-1)
            }
            // expecting the name here
            tag.name = nextWord(line)
            line = cutPrefix(line, tag.name).trim()

            if (line.startsWith('-')) {
                line = line.substring(1, line.length).trim()
            }
            if (line.length > 0) {
                tag.line = line
            }

            if (!types) types = []
            types.push(tag)

        } else {
            // ignore the line
        }
    }
    return types
}

function typesToUsage(types) {
    if (!types || types.length === 0) return '()'

    let usage = '('
    let suffix = ''

    for (let i = 0, ln = types.length; i < ln; i++) {
        const at = types[i]

        if (at.id === 'param') {
            if (i > 0) usage += ', '
            if (at.type) {
                usage += at.name + ': ' + at.type
            } else {
                usage += at.name
            }
        } else if (at.id === 'returns') {
            if (at.type) {
                suffix = ': ' + at.type
            }
        }
    }
    return usage + ')' + suffix
}

function processMFX(mfx) {
    // TODO get rid of that dirty rule for the root
    //      it looks like select/selectOne for / doesn't work properly
    const target = mfx.path === '/'? $ : $.selectOne(mfx.path)

    if (target) {
        if (isObj(target) || isFun(target)) {
            if (!target._meta) target._meta = {}

            Object.keys(mfx).forEach(k => {
                if (k === 'path') return

                let metaVal = mfx[k]
                switch(k) {
                    case 'types':
                        metaVal = processTypes(metaVal)
                        if (metaVal) {
                            target._meta['at'] = metaVal
                            target._meta['usage'] = typesToUsage(metaVal)
                        }
                        break
                    default:
                        target._meta[k] = metaVal
                }
            })

        } else {
            log.sys('[help-fix]', `TODO unable to patch metadata for primitive values, go for the parent: ${mfx.path}`)
        }

    } else {
        log.sys('[help-fix]', `unable to patch metadata for: ${mfx.path}`)
    }
}

function processModMFX(mfxFrame) {
    mfxFrame._ls.forEach( fixSet => {
        if (isString(fixSet)) {
            fixSet = lib.ext.mfx(fixSet)
        }
        if (fixSet) fixSet.ls.forEach( mfx => processMFX(mfx) )
    })
}

function processModPages(pageFrame) {
    const parsedPages = []

    Object.keys(pageFrame._dir).forEach( name => {
        const pageSrc = pageFrame._dir[name]

        if (isString(pageSrc)) {
            const page = lib.ext.man(pageSrc, name)
            if (page) {
                page.name = name
                parsedPages.push(page)
            }
        }
    })

    parsedPages.forEach(page => pageFrame.attach(page, page.name))
}

function fixMod(mod) {
    if (mod.man) {
        if (mod.man.mfx) processModMFX(mod.man.mfx)
        if (mod.man.pages) processModPages(mod.man.pages)
    }

    if (mod.mod._ls.length > 0) {
        mod.mod._ls.forEach(subMod => {
            fixMod(subMod)
        })
    }
}

function fixMeta() {
    if (!$.env.config.debug) return
    log.sys('[help-fix]', 'fixing help meta...')

    fixMod($)
}
