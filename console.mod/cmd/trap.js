'use strict'

// trap console command
// Using alternative name to avoid name collision with trap
function trapNode(args, line, con) {
    const name = args[1]
    if(!sys.isString(name)) {
        con.print('expecting <name> argument')
        return
    }
    const params = args.slice(1)

    // need to hide to enable the root mod
    lib.control.hide()

    $.trap.echo.apply($.trap, params)
}

trapNode.info = 'trap an event'
trapNode.args = '<name> (<param>, <param> ...)'

module.exports = trapNode
