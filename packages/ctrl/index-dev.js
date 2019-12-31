const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const app = express();
const handleConection = require('./src/server/main');

app.use(cors());

app.use(express.static(__dirname + '/src/web/'));

const server = https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
}, app)
  .listen(process.env.PORT || 9001, function () {
    console.log('Listening on port ' + (process.env.PORT || 9001) + ' https://localhost:' + (process.env.PORT || 9001) + '/');
  });

const io = require('socket.io').listen(server);

io.on('connection', handleConection);
