'use strict'

module.exports = function setup() {

    const hud = lab.spawn('hud/Hud', {
        'name': 'hud'
    })

    const con = hud.spawn('hud/gadget/Console', {
        hidden: false,
        name: 'console',
        x: 0,
        y: 0,
        w: ctx.width,
        h: ctx.height/2,
    })

    // bind log functions to out console
    sys.after(_$.log, 'debug', (msg) => con.print('# ' + msg))
    sys.after(_$.log, 'out', (msg) => con.print(msg))
    sys.after(_$.log, 'warn', (msg) => con.print('? ' + msg))
    sys.after(_$.log, 'err', (msg) => con.print('! ' + msg))
    sys.after(_$.log, 'dump', (obj) => {
        con.print(obj)
    })

    // define command processing
    con.onCommand = function(cmd) {
        _$.log.out('doing: ' + cmd)
    }
}

