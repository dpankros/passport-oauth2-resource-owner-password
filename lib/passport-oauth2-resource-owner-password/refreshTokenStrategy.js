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
function ResourceOwnerStrategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }

  if (!verify) {
    throw new Error('OAuth 2.0 refresh token strategy requires a verify function');
  }

  passport.Strategy.call(this);

  this.name = 'oauth2-resource-owner-password';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(ResourceOwnerStrategy, passport.Strategy);

/**
 * Authenticate request based on client credentials in the request body.
 *
 * @param {Object} req
 * @api protected
 */
ResourceOwnerStrategy.prototype.authenticate = function(req) {
  if (!req.body) {
    return this.fail();
  }
  var clientId = req.body['client_id'];
  var clientSecret = req.body['client_secret'];
  var refreshToken = req.body['refresh_token'];
  var grantType = req.body['grant_type'];
  var self = this;

  if (grantType === 'refresh_token' && this._verify) {
    if (!refreshToken) {
      return this.fail();
    }

    function verified(err, client, authCode, info) {
      if (err) { return self.error(err); }
      if (!client) { return self.fail(); }
      self.success(client, authCode, info);
    }

    if (self._passReqToCallback) {
      this._verify(req, clientId, clientSecret, refreshToken, verified);
    } else {
      this._verify(clientId, clientSecret, refreshToken, verified);
    }
  }
};


/**
 * Expose `Strategy`.
 */
module.exports = ResourceOwnerStrategy;
