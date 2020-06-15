module.exports = function(e) {
    if (env.created) {
        if (env.visible) {
            lib.playground.setupMonoLayout()
            env.visible = false
        } else {
            lib.playground.setupGridLayout()
            env.visible = true
        }
    } else {
        lib.playground.setupPlayground()
    }
}
