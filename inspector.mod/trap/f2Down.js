'use strict'

module.exports = function(e) {
    if (e.repeat) return

    if (_.hidden) {
        _.disableOthers()
        lib.control.show()
    } else {
        _.enableOthers()
        lib.control.hide()
    }

    return false
}
