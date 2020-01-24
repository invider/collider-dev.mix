'use strict'

module.exports = function(e) {
    if (e.repeat) return

    if (_.hidden) {
        lab.hud.captureFocus(lab.hud.inspector.panel[1].active)
    } else {
        lab.hud.releaseFocus(lab.hud.inspector.panel[1].active)
    }

    if (_.hidden) {
        _.hidden = false
    } else {
        _.hidden = true
    }

    return false
}
