let shots = 0

module.exports = function(e) {
    if (e.repeat) return
    _.lab.hud.console.hidden = !_.lab.hud.console.hidden
}
