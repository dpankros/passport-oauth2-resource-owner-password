/**
 * Module dependencies.
 */
var ResourceOwnerStrategy = require('./resourceOwnerStrategy');
var RefreshTokenStrategy = require('./refreshTokenStrategy');


/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.ResourceOwnerStrategy = ResourceOwnerStrategy;
exports.RefreshTokenStrategy = RefreshTokenStrategy;
