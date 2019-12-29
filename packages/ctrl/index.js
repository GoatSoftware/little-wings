const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const handleConection = require('./src/server/main');

app.use(cors());

app.use(express.static(__dirname + '/src/web/'));

const server = http.createServer(app)
  .listen(process.env.PORT || 9001, function () {
    console.log('Listening on port ' + (process.env.PORT || 9001) + ' https://localhost:' + (process.env.PORT || 9001) + '/');
  });

const io = require('socket.io').listen(server);

io.on('connection', handleConection);
