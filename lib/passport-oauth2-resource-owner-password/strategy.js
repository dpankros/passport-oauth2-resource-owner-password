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
function Strategy(options, verifyPassword, verifyRefreshToken) {
  if (typeof options === 'function') {
    verifyRefreshToken = verifyPassword;
    verifyPassword = options;
    options = {};
  }

  if (!verifyPassword) {
    throw new Error('OAuth 2.0 resource owner password strategy requires a verify function');
  }

  passport.Strategy.call(this);

  this.name = 'oauth2-resource-owner-password';
  this._verifyPassword = verifyPassword;
  this._verifyRefreshToken = verifyRefreshToken;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on client credentials in the request body.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
  if (!req.body) {
    return this.fail();
  }
  var clientId = req.body['client_id'];
  var clientSecret = req.body['client_secret'];
  var username = req.body['username'];
  var password = req.body['password'];
  var refreshToken = req.body['refresh_token'];
  var grantType = req.body['grant_type'];
  var self = this;

  if (grantType === 'refresh_token' && this._verifyRefreshToken) {
    if (!refreshToken) {
      return this.fail();
    }

    function verified(err, client, authCode, info) {
      if (err) { return self.error(err); }
      if (!client) { return self.fail(); }
      self.success(client, authCode, info);
    }

    if (self._passReqToCallback) {
      this._verifyRefreshToken(req, clientId, clientSecret, refreshToken, verified);
    } else {
      this._verifyRefreshToken(clientId, clientSecret, refreshToken, verified);
    }
  }

  if (grantType === 'password') {
    if (!username || !password) {
      return this.fail();
    }

    function verified(err, client, user, info) {
      if (err) { return self.error(err); }
      if (!client) { return self.fail(); }
      if (!user) { return self.fail(); }
      self.success(client, user, info);
    }

    if (self._passReqToCallback) {
      this._verifyPassword(req, clientId, clientSecret, username, password, verified);
    } else {
      this._verifyPassword(clientId, clientSecret, username, password, verified);
    }
  }
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
