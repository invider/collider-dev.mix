module.exports = function(e) {
    if (env.created) {
        if (env.visible) {
            if (e.ctrlKey || e.altKey || e.metaKey) {
                lib.playground.syncOut()
            } else {
                lib.playground.setupMonoLayout()
                env.visible = false
            }

        } else {
            lib.playground.setupGridLayout()
            env.visible = true
        }
    } else {
        lib.playground.setupPlayground()
    }
}
