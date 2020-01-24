'use strict'

module.exports = function(e) {
    if (e.repeat) return

    if (_.hidden) {
        _.hidden = false
    } else {
        _.hidden = true
    }

    return false
}
