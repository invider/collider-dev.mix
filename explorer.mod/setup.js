'use strict'

module.exports = function setup() {
    _.hidden = true
    const hud = lab.spawn('hud/Hud', {
        name: 'hud',
        molden: true,
    })
}

