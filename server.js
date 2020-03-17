var app = require('./server/app');
var port = process.env.PORT || 5555;

app.listen(port, function(err, success) {
  console.log(err)
  !err ? 
  console.log('Express server listening on port ' + port) : 
  console.error('Failed to start express server. Error message: ' + err);
});