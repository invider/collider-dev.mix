'use strict'

let nx = 30
let ny = 90

module.exports = function(e) {
    if (e.repeat) return

    if (_.hidden) {
        _.hidden = false

        console.log('spawning')
        console.dir(lab.hud)
        lab.hud.spawn('hud/gadget/Explorer', {
            x: nx,
            y: ny,
            w: 250,
            h: 400,
        })

        nx += 50
        ny += 50
    } else {
        _.hidden = true
    }
}
