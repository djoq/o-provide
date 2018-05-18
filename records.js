
const say = require('say.js').prod;
let tools = require('./tools');
let fs = require('fs');
let path = require('path');
let model = require('./mongo_models')
let stubs = fs.readFileSync(path.join(__dirname,'test/stubs.json'))

module.exports.deliver = (req,res) => {
   res.statusCode = 200;
   res.write(stubs.toString());
   res.end();
}

module.exports.clients = (req,res) => {
	console.log('todo: fetch the clients')
	model.getClients().then((result) => {
	  console.log('clients ->', result)

	  res.statusCode = 200;
	  res.write(JSON.stringify(result))
	  res.end()
	})
	
}

 
