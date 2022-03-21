var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var WebSocketJSONStream = require('@teamwork/websocket-json-stream');
var path = require('path');

var backend = new ShareDB();
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
  var connection = backend.connect();
  var doc = connection.get('examples', 'textarea');
  doc.fetch(function(err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create({content: ''}, callback);
      return;
    }
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  // app.use(express.static('circuit-sandbox-master'));
  // app.use(express.static('static'));

  // app.use(express.static(path.join(__dirname, 'static')));
  // app.get('*', (req, res) => {
  //   res.sendFile(path.join(__dirname, 'static/index.html'));
  // });

  app.use(express.static(path.join(__dirname, 'circuit-sandbox-master')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'circuit-sandbox-master/index.html'));
  });

  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({server: server});
  wss.on('connection', function(ws) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  const PORT = process.env.PORT || 8080;

  server.listen(PORT);
  console.log('Listening on http://localhost:8080');
}
