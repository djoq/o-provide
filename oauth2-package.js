var sys = require('util')
var btc = require('child_process').exec;
var entry = require('child_process').exec;

dir = btc("./bx fetch-balance 15FfjFmdLExompJkDLq3QXMdsbpVnV69kV", function(err, stdout, stderr) {
  if (err) {
    // should have err.code here?  
  }
  process(stdout);
});

dir.on('exit', function (code) {
  console.log(code)
  require('./server'); 
});

let process = (stdout) => {
  var lines = stdout.toString().split('\n');
  var results = new Array();
  var x,y
  lines.forEach(function(line) {
    if(line.includes('received')) {
       x = line.split(' ')
    }
    if(line.includes('spent')){
       y = line.split(' ')
    }
    if(!!x && !!y){
      if(parseInt(y[5]) > 0){
        throw new Error('Service expired, plesae contact your provider');
        return 
      } 
    }
  });
}
