'use strict'

module.exports = function(e) {
    if (e.repeat) return

    if (_.hidden) {
        _.hidden = false
        lab.hud.inspector.show()
    } else {
        _.hidden = true
        lab.hud.inspector.hide()
    }

    return false
}
