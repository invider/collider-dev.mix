function man(src, name) {
    const man = {
        name: name,
    }
    
    function setProperty(name, val) {
        // dirty rule - need to rename to preserve after patching
        if (name === 'name') name = 'pageName'

        man[name] = val
    }

    function append(line) {
        if (!man.body) man.body = line
        else man.body += '\n' + line
    }

    if (!src) return
    //const lines = src.match(/[^\r\n]+/g)
    const lines = src.split(/[\r\n]/)

    let section = 0
    lines.forEach(l => {
            const i = l.indexOf(':')
            if (section === 0 && i > 0) {
                const name = l.substring(0, i)
                const rest = l.substring(i + 1)

                if (name.endsWith('\\')) {
                    append(name.substring(0, name.length-1) + res)
                } else if (name.includes(' ')) {
                    append(l)
                } else {
                    setProperty(name.trim(), rest.trim())
                }

            } else if (section === 0 && l.startsWith('--------')) {
                section = 1

            } else {
                append(l)
            }
        })

    if (!man.body) {
        log(`[man-page-parser] no body - ignoring page [${name}]`)
        return
    }

    if (man.name === 'intro') {
        // special case templating - just for the intro page now!
        // TODO maybe make templating a universal feature?
        const config  = _$.env.config
        man.body = man.body.replace('{{ .version }}', config.version)
        man.body = man.body.replace('{{ .releaseName }}', config.releaseName)
    }

    return man
}
