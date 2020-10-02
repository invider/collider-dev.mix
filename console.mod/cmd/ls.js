'use strict'

function ls(args, line, con) {
    // TODO make console local cd context
    const path = args[1]

    let nodes
    if(!isString(path)) {
        if (!con.cur || !con.cur._ls) con.cur = _$
        nodes = con.cur._ls

    } else {
        nodes = _$.select(path)
        if (nodes.length === 1 && nodes[0]._ls) nodes = nodes[0]._ls
    }

    // list node names 
    if (isArray(nodes)) {
        const names = nodes
                .filter(Boolean)
                .filter(e => e.name)
                .map(e => e.name)

        names.forEach(name => {
            log.dump(name)
        })
    }
}

ls.info = 'list node names'
ls.args = '<path>'

