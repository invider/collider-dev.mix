'use strict'

function getLocal(name) {
    if (!isFrame(_.cmd)) return

    const fn = _.cmd._dir[name]
    if (!isFun(fn)) return
    return fn
}

function getGlobal(name) {
    if (!isFrame($.cmd)) return

    const fn = $.cmd._dir[name]
    if (!isFun(fn)) return
    return fn
}

module.exports = function setup() {

    const hud = lab.spawn('hud/Hud', {
        'name': 'hud'
    })

    const con = hud.spawn('hud/gadget/Console', {
        hidden: true,
        name: 'console',
        x: 0,
        y: 0,

        adjust: function() {
            this.w = ctx.width
            this.h = ctx.height/2
        },
    })

    function print(msg) {
        if (_.env.logToConsole) con.print(msg)
    }

    // bind log functions to out console
    _.env.logToConsole = true
    sys.after(_$.log, 'debug', (msg, more) => print('# ' + msg + (more? more : '')))
    sys.after(_$.log, 'out', (msg, more) => print(msg +(more? more: '' )))
    sys.after(_$.log, 'warn', (msg, more) => print('? ' + msg + (more? more : '')))
    sys.after(_$.log, 'err', (msg, more) => print('! ' + msg + (more? more : '')))
    sys.after(_$.log, 'dump', (obj) => { print(obj) })

    // define command processing
    con.onCommand = function(cmd) {
        if (!cmd) return
        const words = cmd.split(' ')
        if (words.length === 0) return
        const command = words[0]

        // find a function
        let fn = getGlobal(command)
        if (!fn) fn = getLocal(command)

        if (fn) {
            const res = fn(words, cmd, con)
            if (res) con.print(res)
        } else {
            // check default handler
            fn = getGlobal('_default')
            if (!fn) fn = getLocal('_default')

            if (fn) {
                const res = fn(words, cmd, con)
                if (res) con.print(res)
            } else {
                con.print('unknown command: [' + command + ']')
            }
        }
    }
}

