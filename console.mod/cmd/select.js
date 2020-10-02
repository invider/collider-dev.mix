'use strict'

function sel(args, line, con) {
    const path = args[1]
    if(!sys.isString(path)) {
        con.print('expecting <path> argument')
        return
    }
    const nodes = con.cur.select(path)

    nodes.forEach(node => {
        log.dump(node)
    })
}

sel.info = 'select and dump nodes by path'
sel.args = '<path>'

module.exports = sel

