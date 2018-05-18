/**
 * Module dependencies.
 */
// let dbUrl = process.env.DATABASE_URL;
let dbUrl = 'postgres://localhost:5432/test'
const initOptions = {

  // pg-promise initialization options...

  connect(client, dc, isFresh) {
    const cp = client.connectionParameters;
    console.log('Connected to database:', cp.database);
  },

  query(e) {
    console.log('QUERY:', e.query);
  }
};

// pools will use environment variables
process.env.PGHOST = 'localhost';
process.env.PGDATABASE = 'test';


var pgp = require('pg-promise')(initOptions);

var pg = pgp(dbUrl)

const { Client } = require('pg')

const client = new Client({
  host: 'localhost',
  port: 5334
})

pg.connect(Client, pgp)


/*
 * Get access token.
 */

module.exports.getAccessToken = (bearerToken) => {
  return pg.query('SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE access_token = $1', [bearerToken])
    .then(function(result) {
      var token = result.rows[0];

      return {
        accessToken: token.access_token,
        client: {id: token.client_id},
        expires: token.expires,
        user: {id: token.userId}, // could be any object
      };
    });
};

/**
 * Get client.
 */

module.exports.getClient = (clientId, clientSecret) => {
  return pg.query('SELECT client_id, client_secret, redirect_uri FROM oauth_clients WHERE client_id = $1 AND client_secret = $2', [clientId, clientSecret])
    .then(function(result) {
      var oAuthClient = result[0];

      if (!oAuthClient) {
        return;
      }

      return {
        clientId: oAuthClient.client_id,
        clientSecret: oAuthClient.client_secret,
        grants: ['password'], // the list of OAuth2 grant types that should be allowed
      };
    });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = (bearerToken) => {
  return pg.query('SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE refresh_token = $1', [bearerToken])
    .then(function(result) {
      return result.rowCount ? result.rows[0] : false;
    });
};

/*
 * Get user.
 */

module.exports.getUser = (username, password) => {
  return pg.query('SELECT id, username, password FROM users WHERE username = $1 AND password = $2', [username, password])
    // .then(function(result) {
    //   return result.rowCount ? result.rows[0] : false;
    // });
};

/**
 * Save token.
 */

module.exports.saveToken = (token, client, user) => {
  console.log('in saveToken ->', token, client, user)
  return pg.query('INSERT INTO oauth_tokens(access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id) VALUES ($1, $2, $3, $4, $5, $6)', [
    token.accessToken,
    token.accessTokenExpiresAt,
    client.clientId,
    token.refreshToken,
    token.refreshTokenExpiresAt,
    user[0].id
  ]).then(function(result) {
    return { accessToken: token.accessToken, client: client, user: user}
    // return result.rowCount ? result[0] : false; // TODO return object with client: {id: clientId} and user: {id: userId} defined
  });
};