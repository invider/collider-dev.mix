'use strict'

function ls(args, line, con) {
    // TODO make console local cd context
    const path = args[1]
    if(!sys.isString(path)) {
        con.print('expecting <path> argument')
        return
    }

    let nodes = _$.select(path)
    if (nodes.length === 1 && nodes[0]._ls) nodes = nodes[0]._ls

    const names = nodes
            .filter(Boolean)
            .filter(e => e.name)
            .map(e => e.name)

    names.forEach(name => {
        log.dump(name)
    })
}

ls.info = 'select and print node names'
ls.args = '<path>'

