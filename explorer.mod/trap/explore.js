'use strict'

let nx = 30
let ny = 90

module.exports = function() {
    lab.hud.spawn('hud/gadget/Explorer', {
        x: nx,
        y: ny,
        w: 250,
        h: 400,
    })
    nx += 50
    ny += 50
}
