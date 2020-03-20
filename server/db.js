var mongoose = require('mongoose');
 var db = require('./config').db;
//var db = 'localhost:8080/jwt-token-test';
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>console.log('Connected to: ' + db ))
.catch((err)=>console.error('Failed to connect to mongoose... ERROR: ' + err))