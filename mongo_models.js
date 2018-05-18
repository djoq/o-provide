
/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pmongo = require('promised-mongo');
const config = require('./config');


const passhash = `config('DB_USEER'):config('DB_PASS')`;

// let MONGODB_URI = `${passhash}@0.0.0.0/test`;
let MONGODB_URI = '0.0.0.0/test';

console.log('mongo uri ->', MONGODB_URI);

let say = require('say.js').dev;

const db = pmongo(`mongodb://${MONGODB_URI}`, {
  authMechanism: 'ScramSHA1'
}, ['OAuthUsers']);

/**
 * Schema definitions.
 */

mongoose.model('OAuthCodes', new Schema({
  authorization_code: { type: String },
  expiresAt: { type: Date },
  redirectUri: { type: String },
  scope: { type: String },
  client: { type: Object },
  user: { type: Object }
}));

mongoose.model('OAuthTokens', new Schema({
  accessToken: { type: String },
  accessTokenExpiresAt: { type: Date },
  client: { type: Object },
  refreshToken: { type: String },
  refreshTokenExpiresAt: { type: Date },
  user: { type: Object }
}));

let OAuthCodesModel = mongoose.model('OAuthCodes');
let OAuthTokensModel = mongoose.model('OAuthTokens');

mongoose.model('OAuthClients', new Schema({
  clientId: { type: String },
  clientSecret: { type: String },
  userId: { type: String },
  grants: { type: Array },
  redirectUris: { type: Array }
}));

mongoose.model('OAuthUsers', new Schema({
  email: { type: String, default: '' },
  firstname: { type: String },
  lastname: { type: String },
  password: { type: String },
  username: { type: String }
}));


let OAuthClientsModel = mongoose.model('OAuthClients');
let OAuthUsersModel = mongoose.model('OAuthUsers');


/**
 * Get access token.
 */

module.exports.getAccessToken = function (bearerToken) {
  say('in getAccessToken (bearerToken: ' + bearerToken + ')');

  return db.OAuthTokens.findOne({ accessToken: bearerToken })
};

/**
 * Get client.
 */

module.exports.getClient = function (clientId, clientSecret) {
  say('running getClient in (MODEL) (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');

  let params = {clientId: clientId};
  if (clientSecret) {
    params.clientSecret = clientSecret;
  }
  return db.OAuthClients.findOne(params)
};

module.exports.getClients = () => {
  return db.OAuthClients.find()
}


/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function *(refreshToken) {
  say('in getRefreshToken (refreshToken: ' + refreshToken + ')');

  return db.OAuthTokens.findOne({ refreshToken: refreshToken });
};

/*
 * Get user.
 */

module.exports.getUser = function (username, password) {
  say('in getUser (username: ' + username + ', password: ' + password + ')');
  return db.OAuthUsers.findOne({ username: username, password: password })
};

module.exports.getUserFromClient = (client) => {
  // imaginary DB query
  return db.OAuthUsers.findOne({_id: pmongo.ObjectId(client.userId) });
};

module.exports.getClientFromUser = (userId) => {
  // imaginary DB query
  say('in getClientsFromUser', userId)
  return db.OAuthClients.findOne({ userId: pmongo.ObjectId(userId) });
};
/**
 * Save token.
 */
module.exports.saveToken = function *(token, client, user) {
  say('in saveToken (token: ', token, ')');
  return db.OAuthTokens.insert({
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    client: client,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    user: user
  });
};

/**
 * Get authorization code
 */

module.exports.getAuthorizationCode = function (authorizationCode) {
  say('in getAuthCode (code: ', authorizationCode, ')');

  return db.OAuthCodes.findOne({authorization_code: authorizationCode });
};

module.exports.revokeAuthorizationCode = (code) => {
  say('revoke this code ->', code)
  return db.OAuthCodes.remove({authorization_code: code})
};

/**
 * Revoke token.
 */
module.exports.revokeToken = function (token) {
    say('in revokeToken (token: ', token, ')');
    return db.OAuthTokens.remove({accessToken: token});
};

module.exports.saveAuthorizationCode = (code, client, user) => {
  // imaginary DB queries
  say('saving auth code', code);
  say('user ->', user);
  say('client ->', client);
  let authCode = {
    authorization_code: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirect_uri: code.redirectUri,
    scope: code.scope,
    client: client,
    user: user
  };
  return db.OAuthCodes.insert(authCode)
    .then(function(authorizationCode) {
      return {
        authorizationCode: authorizationCode.authorization_code,
        expiresAt: authorizationCode.expires_at,
        redirectUri: authorizationCode.redirect_uri,
        scope: authorizationCode.scope,
        client: authorizationCode.client,
        user:authorizationCode.user
      };
    });
};
