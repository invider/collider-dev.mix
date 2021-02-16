'use strict'

module.exports = function(e) {
    if (e.repeat) return

    if (_.hidden) {
        lib.control.show()
    } else {
        lib.control.hide()
    }

    return false
}
