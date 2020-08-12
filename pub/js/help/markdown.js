
const TAB = 4

function parse(md, nowrap, debug) {
    let pos = 0
    let line = 0
    let linePos = 0
    let bufc
    let buffered = false

    function err(msg) {
        console.dir(md)
        throw '@' + line + '.' + linePos + ': ' + msg
    }

    // parsing utils
    function isSpace(c) {
        return c === ' ' || c === '\t'
    }

    function isNewLine(c) {
        return c === '\r' || c === '\n'
    }

    function isWhitespace(c) {
        return isSpace(c) || isNewLine(c)
    }

    function isDigit(c) {
        const code = c.charCodeAt(0) - 48
        return code >= 0 && code < 10
    }

    function isAlpha(c) {
        const d = c.chatCodeAt(0)
        return ((d >= 65 && d <= 90)
            || (d >= 97 && d <= 122)
            || (d >= 161)
        );
    }

    function isAlphaNum(c) {
        return isDigit(c) || isAlpha(c)
    }

    function isSpecial(c) {
        switch(c) {
            case '*': case '_':
                return true

            default:
                return false
        }
    }

    function isIdentifier(c) {
        return c === '_' || c === '$' || isAlphaNum(c)
    }

    // stream
    function getc() {
        if (buffered && bufc) {
            buffered = false
            return bufc
        }
        if (pos < md.length) {
            bufc = md.charAt(pos++)
            if (bufc === '\n') {
                line++
                linePos = 0
            } else {
                linePos ++
            }
            return bufc
        }
        bufc = undefined
    }

    function retc() {
        if (buffered) err('double buffering is not supported!')
        buffered = true
    }

    function ahead() {
        return md.charAt(pos)
    }

    function matchShift() {
        let sh = 0
        let c = getc()
        while (c && (c === ' ' || c === '\t')) {
            if (c === ' ') sh ++
            else if (c === '\t') sh += TAB
            c = getc()
        }
        if (c) retc()
        return sh
    }

    // tokenizer
    const NL = 1
    const SPAN = 2
    const SHIFT = 3
    const STAR = 4
    const UNDERSCORE = 5
    function tokenName(type) {
        switch(type) {
            case NL: return 'newline';
            case SPAN: return 'text span';
            case SHIFT: return 'shift';
            case STAR: return 'star';
            case UNDERSCORE: return 'underscore';
        }
    }

    function nextSpan() {

        let c = getc()
        if (!c) return
        if (c === '\r') c = getc()

        if (isNewLine(c)) return {
            t: NL,
            v: '\n'
        }

        if (linePos === 1 && (c === '\n' || c === '\t')) {
            const sh = matchShift()
            if (sh > 0) return {
                t: SHIFT,
                v: sh
            }
        }

        switch (c) {
            case '*':
            return {
                t: STAR,
                v: '',
                p: linePos,
            }
            case '_': return {
                t: UNDERSCORE,
                v: ''
            }
        }

        let span = ''
        while(c && !isNewLine(c) && !isSpecial(c)) {
            span += c
            c = getc()

            if (c === '*' && ahead() === '*') {
                span += '*'
                getc()
                c = getc()
            }
            if (c === '_' && ahead() === '_') {
                span += '_'
                getc()
                c = getc()
            }
        }
        retc()

        return {
            t: SPAN,
            v: span
        }
    }

    function process() {
        let out = ''
        let state = {}

        let lastSpan = {}
        let span = nextSpan()
        let lineSpan = 0

        if (!span) return out
        else if (!nowrap) out += '<p>'

        while(span) {
            if (debug) {
                // console.log('#' + tokenName(span.t) + ': ' + span.v)
            }

            if (span.t === NL) { 
                lineSpan = 0
                if (state.list) {
                    out += '</li>'
                    state.list = false
                }
                if (!state.code && lastSpan.t === NL) out += '</p><p>'
            } else {
                lineSpan ++
            }

            if (span.t === STAR) {
                if (span.p === 1) {
                    out += '<li>'
                    state.list = true

                } else {
                    if (state.bold) {
                        out += '</b>'
                        state.bold = false
                    } else {
                        out += '<b>'
                        state.bold = true
                    }
                }
            }

            if (span.t === UNDERSCORE) {
                if (state.italic) {
                    out += '</i>'
                    state.italic = false
                } else {
                    out += '<i>'
                    state.italic = true
                }
            }

            if (span.t === SHIFT) {
                if (!state.code) {
                    state.code = true
                    out += '<pre>\n'
                }
                for (let i = 0; i < span.v; i++) out += ' '

            } else {
                //if (span.t !== NL) console.log(`@${line}.${linePos}: ${span.t}:[${span.v}]`)
                if (state.code && lineSpan === 1) {
                    state.code = false
                    out += '\n</pre>'
                }
                out += span.v
            }

            lastSpan = span
            span = nextSpan()
        }

        if (!nowrap) out += '</p>'
        return out
    }
    const out = process()
    return out
}

export function md2html(md, nowrap) {
    //if (md.includes('now something else')) return parse(md, nowrap, true)
    return parse(md, nowrap)
}

