let tools = require('./tools')
const say = require('say.js').dev

let Credentials = (user,pass) => {
    return {username: user, password: pass}
}

// Use mongo
let model = require('./mongo_models')
let id = '_id'

// Use psql
//let model = require('./psql_models');
//let id = 'id'

let reject = (res) => {
    res.statusCode = 401
    res.write('Unauthorized')
    res.end()
    return
}
exports.bearer = (req,res,next) => {

    let { authorization } = req.headers
    console.log('req headers ->', req.headers)
    console.log('req.body ->', req.body)

    if(authorization) {
        let creds = tools.decoupleAuth(decodeURIComponent(authorization))

        say('has auth ->', creds)

        model.getUser(creds.username, creds.password).then((result) => {
          if (result == null) return reject(res)

          console.log('user ->', result)

          let user = result;

          req.body.username = user.username
          req.body.password = user.password

          req.session = { user: user }
          console.log('next step: ', next)
          return next(req,res)

        })
    } else if(req.body.username && req.body.password) {
        say('auth header not set!', req.body)
        model.getUser(req.body.username,req.body.password).then((result) => {
            if(!result) return reject(res)

            req.session = {user: result}
            req.body.username = result.username
            req.body.password = result.password
            // req.body.client_id = 'client'
            // req.body.client_sedcret = 'secret'
            // return next(req,res)

            model.getClientFromUser(result._id).then((client) => {
                req.body.client_id = client.clientId
                req.body.client_secret = client.clientSecret
                say('req.body -> (missing auth)', client)
                // Introspection
            //    return next(req,res);
                return next(req,res)
            }).catch((err) => {
              console.log('handle get client from user error', err)
            })
        }).catch((err) => {
            console.log('handle model call error ->', err)
        })
        // return next(req,res);
    } else if(req.url.includes('oauth')) {
        return next(req,res)
     } else {
        let [na, query] = req.url.split('?')

        let {accessToken} = tools.parseQuery(query)
        if(accessToken) {
            model.getAccessToken(accessToken).then((result) => {
                if(!!result) {
                    console.log('[AUTHORIZED::TOKEN]')
                    next(req,res)
                }
            })
        } else {
            return reject(res)
        }

     
    }


}
