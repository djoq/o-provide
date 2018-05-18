const pmongo = require('promised-mongo');

let MONGODB_URI = 'mongodb://0.0.0.0/test';

const db = pmongo(MONGODB_URI, {
  authMechanism: 'ScramSHA1'
}, ['OAuthUsers']);


console.log('Setup db.reduxtest with "users" collections');

const users = [
  {username: 'user', password: 'password'}
];

const clients = [
  { clientId: 'client', 
    clientSecret: 'secret', 
    grants: ['authorization_code','client_credentials','refresh_token', 'password', 'introspection'],
    redirectUris: ['http://localhost:8081']
  }
];
let userId = '';

async function setup() {
  // clear users and addresses collections
  await db.OAuthUsers.drop();
  await db.OAuthClients.drop();
  await db.OAuthCodes.drop();
  await db.OAuthTokens.drop();

  console.log('Cleared collections');
  let yearFromNow = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  let token = {
    accessToken: null, //new Buffer('client:secret').toString('base64'),
    accessTokenExpiresAt: yearFromNow
  }

  let code = {
    authorization_code: null
  }
  // load users
  for (var i = 0; i < users.length; i++) {
    await db.OAuthUsers.update(users[i], {$set: users[i]}, {upsert: true}).then((user) => {
      token.user = user
        Object.assign(clients[i], {userId: user.upserted[0]._id})
    });
  }

  // load clients
  for (var i = 0; i < clients.length; i++) {
    await db.OAuthClients.update(clients[i], {$set: clients[i]}, {upsert: true}).then((client) => {
      token.client = client
    });
  }

  // await db.OAuthTokens.update(token, {$set: token}, {upsert: true})

  // await db.OAuthCodes.update(code, {$set: code}, {upsert: true})

  
  db.close();

  process.exit();
}

setup();
