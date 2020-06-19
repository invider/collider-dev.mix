'use strict'

function rm(args, line, con) {
    const path = args[1]
    if(!sys.isString(path)) {
        con.print('expecting <path> argument')
        return
    }
    const nodes = _$.select(path)
    nodes.forEach(n => {
        if (sys.isFrame(n.__)) {
            if (n.name) {
                con.print('removing ' + n.name)
            } else {
                con.print('removing ' + n)
            }
            n.__.detach(n)
        }
    })
}

rm.info = 'remove node from scene'
rm.args = '<path>'
