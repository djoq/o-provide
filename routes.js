const {Request, Response} = require('oauth2-server');
const OAuth2Server = require('oauth2-server');
const AccessDeniedError = require('oauth2-server/lib/errors/access-denied-error');
const say = require('say.js').prod;
const tools = require('./tools');
const fs = require('fs');
const path = require('path');

let authenticateHandler = {
  handle: (request, response) => {
  	say('authenticatedHandler running...', request.session);

    return request.session.user /* get authenticated user */;

  }
};

let oauth

let authorize = (request,response) => {
  return oauth.authorize(request, response, oauth.options)
    .then((code) => {
        response.locals.oauth = {code: code};
        say('got code ->', code);
        return code;

    })
    .catch((err) => {
        if (err instanceof AccessDeniedError) {
            console.log('access denied')
        // The resource owner denied the access request.
        } else {
            console.log('need to debug ->', err)
            return false
        // Access was not granted due to some other error condition.
        }
    });
}

let token = (request,response) => {
  return oauth.token(request, response, oauth.options)
    .then((token) => {
      say('got token', token)

      response.locals.oauth = {token: token};  // OAuth-Node response object (unused, use native node)
      return token

  })
  .catch((err) => {
                //add other headers here...
    say('caught error on token ->', err)
    // The request was invalid or not authorized.
  });
}

let finalHandler = (location,request,result) => {
    switch (location) {
        case 'code':
            say('/code')
            return authorize(request,result)
            break;
        case 'token':
            say('/token')
            return token(request,result)
            break;
    }
}

module.exports.driver = () => {
    let model = require('./mongo_models')
    // let model = require('./psql_models');

    oauth = new OAuth2Server({
        model: model,
        allowBearerTokensInQueryString: true,
        allowEmptyState: true,
        accessTokenLifetime: 4 * 60 * 60,
        requireClientAuthentication: false,
        authenticateHandler: authenticateHandler,
        allowExtendedTokenAttributes: true
    })
    return
}


module.exports.deliver = (req,res) => {
    this.driver();
    res.locals = {};

    let request = new Request({
        body: req.body,
        headers: req.headers,
        method: "POST",
        session: req.session,
        query: "?"
    });

    let response = new Response(res);
    let location = tools.stripLocation(req.url);

    if(req.method === 'POST' ) finalHandler(location,request,response).then((result) => {
        if(!!result){
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(result))
            res.statusCode = 200
            res.end()
        } else {
            res.statusCode = 401
            res.end()
        }
    })
    if(req.method === 'GET' && location !== 'code' ) {
        console.log('handle the get case')
        fs.readFile(path.join(__dirname, 'public/index.html'), (err,file) => {
            console.log('reading file ->', file);
            res.write(file.toString());
            res.statusCode = 200;
            res.end()
        })

    }

}


 
