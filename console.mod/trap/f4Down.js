module.exports = function(e) {
    if (e && e.repeat) return

    if (lab.hud.console.hidden) {
        lib.control.show()
    } else {
        lib.control.hide()
    }
}
