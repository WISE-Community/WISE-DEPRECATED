/* */ 
'use strict';
var WS = module.exports = require('./lib/WebSocket');
WS.Server = require('./lib/WebSocketServer');
WS.Sender = require('./lib/Sender');
WS.Receiver = require('./lib/Receiver');
WS.createServer = function createServer(options, fn) {
  var server = new WS.Server(options);
  if (typeof fn === 'function') {
    server.on('connection', fn);
  }
  return server;
};
WS.connect = WS.createConnection = function connect(address, fn) {
  var client = new WS(address);
  if (typeof fn === 'function') {
    client.on('open', fn);
  }
  return client;
};
