function mfx(src, mfxName) {
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
        if (!curFix) throw `@${mfxName}/${lineNumber}: `
                + `Can't add section [${name}] without fix path!`
        if (curFix[name]) throw `@${mfxName}/${lineNumber}: `
                + `Section [${name}] is already defined!`

        section = name
        curFix[section] = ''
    }

    function append(line) {
        if (!section) {
            if (line.trim().length > 0) {
                throw `@${mfxName}/${lineNumber}: Can't append data`
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

        const iColon = l.indexOf(':')
        const iSpace = l.indexOf(' ')

        if (l.startsWith('--')) {
            // skip comment
        } else if (l.startsWith('/')) {
            at(l.trim())
        } else if (iColon > 0 && l[iColon-1] !== '\\') {
            let first
            let second = l
            const i = l.indexOf(':')
            if (i > 0) {
                first = l.substring(0, i).trim()
                second = l.substring(i+1)
            }

            if (!first || first.includes(' ')) {
                // doesn't look like a section definition
                // just include the whole line
                append(l)
            } else {
                nextSection(first)
                if (second && second.length > 0) append(second)
            }
        } else if (l.startsWith('.')) {
            section = false
        } else {
            append(l)
        }
    })

    if (fix.ls.length === 0) return
    return fix 
}
