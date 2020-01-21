'use strict'

module.exports = function(e) {
    if (e.repeat) return

    if (_.hidden) {
        _.hidden = false
        log('show')
    } else {
        _.hidden = true
        log('hide')
    }

    return false
}
