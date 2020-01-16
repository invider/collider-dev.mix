function postSetup() {
    if ($.env.config.debug) {
        _.job.helper.report()
    }
}
