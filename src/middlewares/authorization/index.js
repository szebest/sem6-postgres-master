const isLoggedInValidator = require('./isLoggedInValidator')
const isAtLeastServerAdminValidator = require('./isAtLeastServerAdminValidator')
const isAtLeastDatabaseAdminValidator = require('./isAtLeastDatabaseAdminValidator')
const isSpecificUserValidator = require('./isSpecificUserValidator')
const isRefreshTokenValid = require('./isRefreshTokenValid')
const isSlave = require('./isSlave')
const hasUserValues = require('./hasUserValues')

module.exports = {
    isLoggedInValidator,
    isAtLeastServerAdminValidator,
    isAtLeastDatabaseAdminValidator,
    isSpecificUserValidator,
    isRefreshTokenValid,
    isSlave,
    hasUserValues
}