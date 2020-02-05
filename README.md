# ~Moved~
### ~[passport-oauth2-resource-owner-password](https://git.daplie.com/coolaj86/passport-oauth2-resource-owner-password) is now at [git.daplie.com/coolaj86/passport-oauth2-resource-owner-password](https://git.daplie.com/coolaj86/passport-oauth2-resource-owner-password)~
It's not.  That's a dead link.

Fixed the original package to not require client.  Also added a refresh token strategy that can be used alone or with the resource owner password strategy.


## Resource Owner Strategy
### Purpose
"The resource owner password credentials grant type is suitable in
cases where the resource owner has a trust relationship with the
client, such as the device operating system or a highly privileged
application.  The authorization server should take special care when
enabling this grant type and only allow it when other flows are not
viable.

This grant type is suitable for clients capable of obtaining the
resource owner's credentials (username and password, typically using
an interactive form).  It is also used to migrate existing clients
using direct authentication schemes such as HTTP Basic or Digest
authentication to OAuth by converting the stored credentials to an
access token." [RFC 6749 Oauth2 at p. 37](https://tools.ietf.org/html/rfc6749#page-37)

### Specification
[RFC 6749 Oauth2 at pp.37-39](https://tools.ietf.org/html/rfc6749#page-37)

### Implementation
#### Constructor
`ResourceOwnerStrategy(options, verify)`
* `options` (optional) - can include
    * `passReqToCallback`- Whether to pass the request object as the **first** argument of the verify function
* `verify` (required) - See description below 

#### Verify function
`verify([req], clientId, clientSecret, username, password, verified)`
* req(optional) - Only present if `passReqToCallback` was set in the constructor options.  The request that started this verfify 
* clientId - A client id that was provided by the client, if any
* clientSecret - The client secret that was provided by the client, if any
* username - The username that was provided by the client
* password - The password that was provided by the client
* verified - A function of the type `func(error, client, user, info)`
    * error (Error) - an error object, if an exception occurred
    * client (Required) - a client object.  If there is no client, `{}` is acceptable
    * user (Required) - a user object
    * info (Optional) - any additional information that should be passed back to the client.  Examples include:
        * `created_at`  - a timestamp indicating when the token was created 
        * `expires` - a timestamp indicating when the token will expire
        * `expires_in` - a duration in seconds indicating the TTL (time to live) of the token
    
### Example


```javascript
passport.use(
  'oauth2-resource-owner-password',
  new ResourceOwnerStrategy(
    async (clientId, clientSecret, username, password, done) => {
      let client = { id: null, secret: null };
      try {
        if (clientId) {
          client = await getClient(clientId, clientSecret); // fetch the client

          if (!client) {
            return done(null, null, null);
          }
        }

        const user = await getUser(username);
        if (!user) {
          return done(null, null, null);
        }

        const passwordMatches = verifyUserPassword(password, user);
        if (!passwordMatches) {
          return done(null, null, null);
        }
        return done(null, client, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

```


## Refresh Token Strategy
### Description
"If the authorization server issued a refresh token to the client, the
client [may make] a refresh request to the token endpoint" [RFC 6749 at p. 43](https://tools.ietf.org/html/rfc6749#section-6)
   
### Specification
[RFC 6749 at pp. 43-47](https://tools.ietf.org/html/rfc6749#section-6)

### Implementation
#### Constructor
`RefreshTokenStrategy(options, verify)`
* `options` (optional) - can include
    * `passReqToCallback`- Whether to pass the request object as the **first** argument of the verify function
* `verify` (required) - See description below 

#### Verify function
`verify([req], clientId, clientSecret, username, password, verified)`
* req(optional) - Only present if `passReqToCallback` was set in the constructor options.  The request that started this verfify 
* clientId - A client id that was provided by the client, if any
* clientSecret - The client secret that was provided by the client, if any
* refreshToken - The refresh token that was issued to the client
* verified - A function of the type `func(error, client, user, info)`
    * error (Error) - an error object, if an exception occurred
    * client (Required) - a client object.  If there is no client, `{}` is acceptable
    * authCode (Required) - an object representative of a new access code/refresh token
    * info (Optional) - any additional information that should be passed back to the client.  Examples include:
        * `created_at`  - a timestamp indicating when the token was created 
        * `expires` - a timestamp indicating when the token will expire
        * `expires_in` - a duration in seconds indicating the TTL (time to live) of the token

### Example
```javascript

passport.use(
  'oauth2-refresh-token',
  new RefreshTokenStrategy(
    async (clientId, clientSecret, refreshToken, done) => {
      let client = { id: null, secret: null }; 
      try {
        if (clientId) {
          client = await getClient(clientId, clientSecret);
          if (!client) {
            return done(null, null, null);
          }
        }

        const authCode = await createAuthorizationCode(clientId, refreshToken);

        if (!authCode || authCode.isExpired()) {
          return done(null, null, null);
        }

        return done(null, client, authCode);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

```
