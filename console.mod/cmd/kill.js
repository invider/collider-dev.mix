'use strict'

function killNode(args, line, con) {
    const path = args[1]
    if(!sys.isString(path)) {
        con.print('expecting <path> argument')
        return
    }
    let nodes = _$.select(path)
    if (nodes.length === 0) nodes = _$.select('lab/' + path)

    let out = ''
    nodes.forEach(n => {
        kill(n)
        if (n.name) out += `killed ${n.name}\n`
    })

    return out.trim()
}

killNode.info = 'kill the node'
killNode.args = '<path>'

module.exports = killNode

