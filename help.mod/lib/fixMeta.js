function processMFX(mfx) {
    // TODO get rid of that dirty rule for the root
    //      it looks like select/selectOne for / doesn't work properly
    const target = mfx.path === '/'? $ : $.selectOne(mfx.path)

    if (target) {
        if (!target._meta) target._meta = {}

        Object.keys(mfx).forEach(k => {
            if (k === 'path') return
            target._meta[k] = mfx[k]
        })

    } else {
        log.err(`can't find target for: ${mfx.path}`)
    }
}

function processModMFX(mfxFrame) {
    mfxFrame._ls.forEach( fixSet => {
        if (isString(fixSet)) {
            fixSet = lib.ext.mfx(fixSet)
        }
        fixSet.ls.forEach( mfx => processMFX(mfx) )
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
    log.sys('fixing help meta...')

    fixMod($)
}
