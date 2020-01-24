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

    lines.filter(l => !l.startsWith('#') && !l.startsWith('--'))
        .forEach(l => {

            if (l.indexOf(':') > 0) {
                const parts = l.trim().split(':')
                setProperty(parts[0].trim(), parts[1].trim())

            } else if (l.startsWith('.')) {
                // ignore line
            } else {
                append(l)
            }
        })

    if (!man.body) {
        log(`[man-page-parser] no body - ignoring page [${name}]`)
        return
    }
    return man
}
