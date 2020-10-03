'use strict'

function spawn(args, line, con) {
    const dna = args[1]
    if(!sys.isString(dna)) {
        con.print('expecting dna')
        return
    }

    const node = lab.spawn(dna)
    con.print(node)
    return 'created [' + (node.name || dna) + ']'
}

spawn.info = 'spawn a lifeform'
spawn.args = '<dna>'
