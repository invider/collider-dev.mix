
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
            case '!':
                if (ahead() === '[') return true
                else return false

            case '[':
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
        while (c && isSpace(c)) {
            if (c === ' ') sh ++
            else if (c === '\t') sh += TAB
            c = getc()
        }
        if (c) retc()
        return sh
    }

    function matchLink(type) {
        let tag = ''
        let link = ''
        let c = getc()
        while (c && c !== ']') {
            link += c
            c = getc()
        }
        if (ahead() === '(') {
            // consume the second part of the link
            tag = link
            link = ''
            getc()
            c = getc()
            while (c && c !== ')') {
                link += c
                c = getc()
            }
        } else {
            tag = link
        }

        return {
            t: type,
            v: link,
            g: tag,
        }
    }

    // tokenizer
    const NL = 1
    const SPAN = 2
    const SHIFT = 3
    const STAR = 4
    const UNDERSCORE = 5
    const ITEM = 6
    const NUMBERED = 7
    const QUOTE = 8
    const LINK = 11
    const IMAGE = 12
    function tokenName(type) {
        switch(type) {
            case NL: return 'newline';
            case SPAN: return 'text span';
            case SHIFT: return 'shift';
            case STAR: return 'star';
            case UNDERSCORE: return 'underscore';
            case ITEM: return '* list item';
            case NUMBERED: return '- numbered item';
            case QUOTE: return '> quote';
            case LINK: return 'link';
            case IMAGE: return 'image';
        }
    }

    function nextSpan() {
        let escaped = false

        let c = getc()
        if (!c) return
        if (c === '\r') c = getc()

        if (isNewLine(c)) return {
            t: NL,
            v: '\n'
        }

        if (linePos === 1 && isSpace(c)) {
            const sh = matchShift()
            if (sh > 0) return {
                t: SHIFT,
                v: sh
            }
        }

        // match markup
        if (debug) console.log('>>> ' + c)
        switch (c) {

            case '!':
                if (ahead() === '[') {
                    getc()
                    return matchLink(IMAGE)
                }
                break

            case '[':
                return matchLink(LINK)
                break
            /*
            case '!':
                getc()
                console.log('special !')
                break

            case '!':
                */

            case '*':
                if (ahead() === '*') {
                    getc() // eat the double to make a literal
                    escaped = true

                } else if (linePos === 1 && isSpace(ahead())) {
                    return {
                        t: ITEM,
                        v: '*'
                    }
                } else {
                    return {
                        t: STAR,
                        v: '*'
                    }
                }
                break

            case '_':
                if (ahead() === '_') {
                    getc() // eat the double to make a literal
                    escaped = true

                } else {
                    return {
                        t: UNDERSCORE,
                        v: '_'
                    }
                }
                break

            case '-':
                if (linePos === 1 && isSpace(ahead())) {
                    // numbered list item
                    return {
                        t: NUMBERED,
                        v: '-'
                    }
                }
                break

            case '>':
                if (linePos === 1 && isSpace(ahead())) {
                    return {
                        t: QUOTE,
                        v: '>',
                    }
                }
                break

        }

        let span = ''
        while(c && !isNewLine(c) && (!isSpecial(c) || escaped)) {
            span += c
            if (c === '\\') escaped = true
            else escaped = false
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

        function backspaceIf(c) {
            if (out.endsWith(c)) {
                out = out.substring(0, out.length - 1)
            }
        }

        if (!span) return out
        else if (!nowrap) out += '<p>'

        while(span) {
            if (debug) {
                console.log('#' + tokenName(span.t) + ': ' + span.v)
            }

            if (span.t === NL) { 
                lineSpan = 0
                if (state.list) {
                    out += '</li>'
                    state.list = false
                }

                if (lastSpan.t === NL) {
                    // next paragraph - double line feed detected
                    if (state.numberedList) {
                        out += '</ol>'
                        state.numberedList = false

                    } else if (state.quote) {
                        out += '</blockquote>'
                        state.quote = false

                    } else if (!state.code) {
                        out += '</p><p>'
                    }
                }
            } else {
                lineSpan ++
            }

            if (span.t === ITEM) {
                out += '<li>'
                state.list = true

            } else if (span.t === NUMBERED) {
                if (!state.numberedList) {
                    out += '<ol>'
                    state.numberedList = 1
                }
                out += '<li>'
                state.list = true

            } else  if (span.t === STAR) {
                if (state.bold) {
                    out += '</b>'
                    state.bold = false
                } else {
                    out += '<b>'
                    state.bold = true
                }

            } else if (span.t === UNDERSCORE) {
                if (state.italic) {
                    out += '</i>'
                    state.italic = false
                } else {
                    out += '<i>'
                    state.italic = true
                }

            } else if (span.t === QUOTE) {
                if (!state.quote) {
                    out += '<blockquote>'
                    state.quote = true
                }

            } else if (span.t === SHIFT) {
                if (!state.code) {
                    state.code = true
                    out += '<pre>\n'
                }
                for (let i = 0; i < span.v; i++) out += ' '

            } else if (span.t === LINK) {
                out += '<a href="' + span.v + '">' + span.g + '</a>'

            } else if (span.t === IMAGE) {
                out += `<img src="${span.v}" alt="${span.g}"/>`

            } else {
                //if (span.t !== NL) console.log(`@${line}.${linePos}: ${span.t}:[${span.v}]`)
                if (state.code && lineSpan === 1) {
                    state.code = false
                    backspaceIf('\n')
                    backspaceIf('\r')
                    out += '</pre>'
                }
                out += span.v
            }

            lastSpan = span
            span = nextSpan()
        }

        // close open tags
        if (state.bold) out += '</b>'
        if (state.italic) out += '</i>'
        if (state.code) out += '</pre>'

        if (!nowrap) out += '</p>'
        return out
    }

    const out = process()
    return out
}

export function md2html(md, nowrap) {
    if (md.includes('Quapla')) {
        console.log('-------')
        console.log(md)
        return parse(md, nowrap, true)
    }
    return parse(md, nowrap)
}

