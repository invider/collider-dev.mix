'use strict'

module.exports = function(e) {
    if (e.repeat) return

    if (_.hidden) {
        _.hidden = false

        if (lab.hud._ls.length < 2) {
            trap('explore')
        }

    } else {
        _.hidden = true
    }
}
