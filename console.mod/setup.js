'use strict'

module.exports = function setup() {

    const hud = lab.spawn('hud/Hud', {
        'name': 'hud'
    })

    const con = hud.spawn('hud/gadget/Console', {
        hidden: true,
        name: 'console',
        x: 0,
        y: 0,
        w: ctx.width,
        h: ctx.height/2,
    })

    function print(msg) {
        if (_.env.logToConsole) con.print(msg)
    }

    // bind log functions to out console
    _.env.logToConsole = true
    sys.after(_$.log, 'debug', (msg) => print('# ' + msg))
    sys.after(_$.log, 'out', (msg) => print(msg))
    sys.after(_$.log, 'warn', (msg) => print('? ' + msg))
    sys.after(_$.log, 'err', (msg) => print('! ' + msg))
    sys.after(_$.log, 'dump', (obj) => { print(obj) })

    // define command processing
    con.onCommand = function(cmd) {
        if (!cmd) return
        const words = cmd.split(' ')
        if (words.length === 0) return
        const command = words[0]

        // find a function
        let fn
        if (sys.isFrame(_$.cmd)) {
            fn = _$.cmd._dir[command]
        }
        if (!sys.isFun(fn) && sys.isFrame(_.cmd)) {
            fn = _.cmd._dir[command]
        }

        if (sys.isFun(fn)) {
            const res = fn(words, cmd, con)
            if (res) con.print(res)
        } else {
            con.print('unknown command: [' + command + ']')
        }
    }
}

