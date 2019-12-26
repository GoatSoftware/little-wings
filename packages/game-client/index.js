var express = require('express')
var fs = require('fs')
var https = require('https')
var app = express()

app.use(express.static(__dirname + '/dist'));

https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
}, app)
.listen(process.env.PORT || 9000, function () {
  console.log('Listening on port ' + (process.env.PORT || 9000) + ' https://localhost:' + (process.env.PORT || 9000) + '/')
})
