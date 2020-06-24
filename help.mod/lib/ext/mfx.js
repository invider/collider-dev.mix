function mfx(src) {
    const fix = {
        _mfx: true,
        ls: [],
    }

    let curFix 
    let section
    let lineNumber= 0

    // mark location in the mix
    function at(path) {
        curFix = {
           path: path,
        }
        fix.ls.push(curFix)
        section = undefined
    }

    function nextSection(name) {
        if (!curFix) throw `@${lineNumber}: `
                + `Can't add section [${name}] without fix path!`
        if (curFix[name]) throw `@${lineNumber}: `
                + `Section [${name}] is already defined!`

        section = name
        curFix[section] = ''
    }

    function append(line) {
        if (!section) {
            if (line.trim().length > 0) {
                throw `@${lineNumber}: Can't append data`
                    + ` - missing section definition: ${line}`
            } else {
                return
            }
        }
        if (curFix[section] === '') curFix[section] = line
        else curFix[section] += '\n' + line
    }

    if (!src) return
    //const lines = src.match(/[^\r\n]+/g)
    const lines = src.split(/[\r\n]/)

    lines.forEach(l => {
            lineNumber ++

            if (l.startsWith('#') || l.startsWith('--')) {
                // skip comment
            } else if (l.startsWith('/')) {
                at(l.trim())
            } else if (l.indexOf(':') > 0) {
                const parts = l.trim().split(':')
                nextSection(parts[0].trim())
                if (parts[1].length > 0) append(parts[1].trim())
            } else if (l.startsWith('.')) {
                section = false
            } else {
                append(l)
            }
        })

    if (fix.ls.length === 0) return
    return fix 
}
