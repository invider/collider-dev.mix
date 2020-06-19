'use strict'

function one(args, line, con) {
    const path = args[1]
    if(!sys.isString(path)) {
        con.print('expecting <path> argument')
        return
    }
    const node = _$.selectOne(path)

    log.dump(node)
}

one.info = 'select and dump a single node form provided path'
one.args = '<path>'
