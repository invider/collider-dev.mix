function keyDown(e) {
    if (e.code === 'F1') {
        if (e.ctrlKey || e.altKey || e.metaKey) {
            _.job.helper.report()
        } else {
            window.open('collider-dev.mix/help.html', '_blank')
            return false
        }
    }
}
