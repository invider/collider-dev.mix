module.exports = function(e) {
    if (e && e.repeat) return

    if (lab.hud.console.hidden) {
        _.disableOthers()
        lab.hud.captureFocus(lab.hud.console)
    } else {
        _.enableOthers()
        lab.hud.releaseFocus(lab.hud.console)
    }
    lab.hud.console.hidden = !_.lab.hud.console.hidden
}
