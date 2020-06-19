'use strict'

function help(args, line, con) {
    con.print('available console commands:')

    // list commands declared in global scope
    if (sys.isFrame(_$.cmd)) {
        const dir = _$.cmd._dir
        Object.keys(dir).forEach(name => {
            const fn = dir[name]
            if (sys.isFun(fn)) {
                const args = fn.args? ' ' + fn.args : ''
                if (sys.isString(fn.info)) con.print(name + args + ' - ' + fn.info)
                else con.print(name)
            }
        })
    }

    // list local commands declared in console.mod
    if (sys.isFrame(_.cmd)) {
        const dir = _.cmd._dir
        Object.keys(dir).forEach(name => {
            const fn = dir[name]
            if (sys.isFun(fn)) {
                const args = fn.args? ' ' + fn.args : ''
                if (sys.isString(fn.info)) con.print(name + args + ' - ' + fn.info)
                else con.print(name)
            }
        })
    }

    con.print('-------------------------------------------------')
    con.print('place commands in root or console mod /cmd folder')
}

help.info = 'show this message'
