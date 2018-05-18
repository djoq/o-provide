// index.js
var pm2 = require('pm2');

var pmx = require('pmx').init({
  network       : true,  // Network monitoring at the application level
  ports         : true,  // Shows which ports your app is listening on (default: false)
});


pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start({
    script    : 'server.js',         // Script to be run
    exec_mode : 'cluster',        // Allows your app to be clustered
    instances : 1,                // Optional: Scales your app by 4
    max_memory_restart : '100M'   // Optional: Restarts your app if it reaches 100Mo
  }, function(err, apps) {
    pm2.disconnect();   // Disconnects from PM2
    if (err) throw err
  });
});


