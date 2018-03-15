var app = require('./server/app');
var port = process.env.PORT || 5555;

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});