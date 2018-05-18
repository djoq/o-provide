if(process.env.NODE_ENV === 'development') require('dotenv').load()

let config = (name) => {
    if (!process.env[name]) {
        throw new Error('missing required env variable: '+name)
    }
    return process.env[name]
}

module.exports = config
