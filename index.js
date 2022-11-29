var port = process.env.PORT || 3000;
const express = require('express')
const app = express()
const cors = require('cors')

// importing mysql package
const mysql = require('mysql');
var bodyParser = require('body-parser')
// mysql connection
// var db_config = {
//   host: '184.168.119.144',
//   user: 'i8347506_wp1',
//   password: 'Y.611uXz4WSJeFSZrLP92',
//   database: 'i8347506_wp1',
//   multipleStatements: true
// };

var db_config = {
  host: '18.143.36.224',
  user: 'bn_wordpress',
  password: 'fb2d6616d96136d5b43bc36bb3aab0ae0346162c30c1b260fc3f3e0209234def',
  database: 'bitnami_wordpress',
  multipleStatements: true
};
// parse various different custom JSON types as JSON
app.use(bodyParser.json({ limit: '500mb' }))
app.use(cors())

function handleDisconnect() {
  global.connection = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  connection.connect(function (err) {              // The server is either down
    if (err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } else {
      console.log("db is connected")
    }                                    // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  connection.on('error', function (err) {
    
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    } 
  });
}

handleDisconnect();

// Routing the Employee file
const elearning = require("./routes/elearning")
app.use('/elearning', elearning);

// getting quizz questio
const quizz = require("./routes/quizz")
app.use('/quizz', quizz);
 //payemnt gasteway
 const payment = require("./routes/payment")
 app.use('/payment', payment);

 const products = require('./routes/products');
 app.use('/products',products);
 

 process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
app.listen(port, () => { console.log(`App is listening port number:${port}`) })
const auth = require("./routes/auth")
app.use('/auth', auth);