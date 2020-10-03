'use strict'

function cd(args, line, con) {
    // TODO make console local cd context
    const path = args[1]

    let node
    if(!isString(path)) {
        con.cur = _$

    } else {

        if (path === '..') {
            if (con.cur.__) con.cur = con.cur.__
        } else if (path === '/') {
            con.cur = _$
        } else {
            node = _$.selectOne(path)
            if (node && node._ls) con.cur = node
            else con.print(`can't cd into [${path}]`)
        }
    }
}

cd.info = 'set working node'
cd.args = '<path>'

