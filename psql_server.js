'use-strict';

const PORT = 3000
const OAuth2Server = require('oauth2-server');
const config = require('./config');


const { Pool, Client } = require('pg')

// pools will use environment variables
process.env.PGHOST = 'localhost';
process.env.PGDATABASE = 'test';

const pool = new Pool()
console.log('DB client connecting...', process.env.PGHOST )

pool.query('SELECT * FROM users', (err, res) => {
  // say(err, res)
  if (err) console.log('error ->', err)

  console.log('select * from users ->', res)
})



