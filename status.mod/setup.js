'use strict'

module.exports = function() {
    // link global mod env instead of the local one
    _.link(_._$.env, 'env')
}
