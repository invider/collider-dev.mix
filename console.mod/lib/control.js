// show console
function show() {
    _.disableOthers()
    lab.hud.captureFocus(lab.hud.console)
    lab.hud.console.hidden = false
}

// hide console
function hide() {
    _.enableOthers()
    lab.hud.releaseFocus(lab.hud.console)
    lab.hud.console.hidden = true
}
