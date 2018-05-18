'use-strict';

const PORT = 3000
const OAuth2Server = require('oauth2-server');
const config = require('./config');

handle = function(e) {
  console.log('we had an error ->', e)
  return;
};

/*
* Setup the database connection
*/
// var mongoose = require('mongoose');
// var uristring = 'mongodb://'+config('MONGODB_URI')+'/test';
// // Makes connection asynchronously. Mongoose will queue up database
// // operations and release them when the connection is complete.
// mongoose.connect(uristring, function (err, res) {
//   if (err) {
//     console.log ('ERROR connecting to: ' + uristring + '. ' + err);
//   } else {
//     console.log ('Succeeded connected to: ' + uristring);
//   }
// });

// const auth = require('./auth')

const http = require('http')

const auth = require('./auth')
const tools = require('./tools')
const oauthRoute = require('./routes');
const records = require('./records');

let authLookup = (req,res) => {
    return auth.bearer(req, res, oauthRoute.deliver)
}

let clientApi = (req,res) => {
  return auth.bearer(req,res,records.clients)
}

const requestHandler = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Credentials', true)

    let ns = tools.stripNamespace(req.url) 
    switch (ns) {
      case 'oauth':
        return tools.bodyParser(req,res,authLookup)
        break;
      case 'users':
        console.log('fetch the users', req.rawHeaders)
        break;
      case 'clients':
        console.log('fetch clients')
        return tools.bodyParser(req,res,clientApi)
        break;
      default:
        records.deliver(req,res);
    }
    
}

const server = http.createServer(requestHandler);

// Tell our app to listen on port 3000
module.exports.server = server.listen(3000, function (err) {
  if (err) {
      return handleErr
    // throw err
  }
  console.log('Server started on port 3000')
})





