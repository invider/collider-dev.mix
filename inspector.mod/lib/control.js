// show node inspector
function show() {
    _.disableOthers()
    _.hidden = false
    lab.hud.inspector.show()
}

function open(node, layoutMode, panelMode) {
    if (isString(node)) {
        node = $.selectOne(node)
    }
    lab.hud.inspector.open(node, layoutMode, panelMode)
    if (_.hidden) lib.control.show()
}

// hide node inspector
function hide() {
    _.enableOthers()
    _.hidden = true
    lab.hud.inspector.hide()
}
