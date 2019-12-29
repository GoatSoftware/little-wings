const express = require('express');
const http = require('http');
const app = express();

app.use(express.static(__dirname + '/dist'));

http.createServer(app)
  .listen(process.env.PORT || 9000, () => {
    console.log('Listening on port ' + (process.env.PORT || 9000) + ' https://localhost:' + (process.env.PORT || 9000) + '/');
  });
