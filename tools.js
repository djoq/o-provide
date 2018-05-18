let Credentials = (user,pass) => {
    return {username: user, password: pass}
}
let formidable = require('formidable');

exports.decoupleAuth = (string) => {
    let CRED_REGEXP = /^([^:]*) (.*)$/;
    let USER_PASS_REGEXP = /^([^:]*):(.*)$/;

    let [original, authType, creds] = CRED_REGEXP.exec(string);

    let coupled = Buffer.from(creds,'base64').toString();
    let userPass = USER_PASS_REGEXP.exec(coupled);

    return Credentials(userPass[1],userPass[2]);
}

exports.stripLocation = (string) => {
    let URL_REGEXP = /^([^:]*)\/(.*)$/;
    return URL_REGEXP.exec(string)[2]
}

exports.stripNamespace = (string) => {
    let URL_REGEXP = /^([^:]*)\/(.*)$/;
    return URL_REGEXP.exec(string)[1].substr(1)
}

exports.bodyParser = (req,res,next) => {
    form = new (formidable.IncomingForm)
    form.parse(req, (err,fields,files) => {
        console.log('incoming form ->', fields)
        req.body = fields;
    })

    form.on("end", () => {
        return next(req,res);
    })
}

exports.parseQuery = (queryString) => {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    
    return query
}
