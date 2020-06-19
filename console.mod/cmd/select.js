'use strict'

function select(args, line, con) {
    const path = args[1]
    if(!sys.isString(path)) {
        con.print('expecting <path> argument')
        return
    }
    const nodes = _$.select(path)

    nodes.forEach(node => {
        log.dump(node)
    })
}

select.info = 'select and dump nodes by path'
select.args = '<path>'

