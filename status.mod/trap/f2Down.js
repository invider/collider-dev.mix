let shots = 0

module.exports = function(e) {
    if (e.repeat) return
    _.lab.status.hidden = !_.lab.status.hidden
}
