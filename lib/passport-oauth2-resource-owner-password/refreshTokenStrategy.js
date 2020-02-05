/**
 * Module dependencies.
 */
var passport = require('passport')
  , util = require('util')
  ;


/**
 * `ResourceOwnerPasswordStrategy` constructor.
 *
 * @api protected
 */
function RefreshTokenStrategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }

  if (!verify) {
    throw new Error('OAuth 2.0 refresh token strategy requires a verify function');
  }

  passport.Strategy.call(this);

  this.name = 'oauth2-refresh-token';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(RefreshTokenStrategy, passport.Strategy);

/**
 * Authenticate request based on client credentials in the request body.
 *
 * @param {Object} req
 * @api protected
 */
RefreshTokenStrategy.prototype.authenticate = function(req) {
  if (!req.body) {
    return this.fail();
  }
  var clientId = req.body['client_id'];
  var clientSecret = req.body['client_secret'];
  var refreshToken = req.body['refresh_token'];
  var grantType = req.body['grant_type'];
  var self = this;

  if (grantType !== 'refresh_token') {
    return this.fail();
  }

  if (!refreshToken) {
    return this.fail();
  }

  const verified = (err, client, authCode, info) => {
    if (err) { return this.error(err); }
    if (!client) { return this.fail(); }
    this.success(client, authCode, info);
  }

  if (self._passReqToCallback) {
    this._verify(req, clientId, clientSecret, refreshToken, verified);
  } else {
    this._verify(clientId, clientSecret, refreshToken, verified);
  }
};


/**
 * Expose `Strategy`.
 */
module.exports = RefreshTokenStrategy;
