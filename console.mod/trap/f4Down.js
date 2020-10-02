module.exports = function(e) {
    if (e && e.repeat) return

    if (lab.hud.console.hidden) {
        lab.hud.captureFocus(lab.hud.console)
    } else {
        lab.hud.releaseFocus(lab.hud.console)
    }
    lab.hud.console.hidden = !_.lab.hud.console.hidden
}
