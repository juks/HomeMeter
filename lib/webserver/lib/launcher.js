#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../../../webapp.js');
var debug = require('debug')('smart:server');
var http = require('http');
var defaultPort = 3000;

var launch = function(options) {
  /**
   * Get port from environment and store in Express.
   */

  this.port = 'port' in options ? this.normalizePort(options.port) : defaultPort;
  app.set('port', this.port);
  if ('data' in options) app.set('mainData', options.data);

  /**
   * Create HTTP server.
   */
  this.server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  this.server.listen(this.port);
  this.server.on('error', this.onError.bind(this));
  this.server.on('listening', this.onListening.bind(this));
}

/**
 * Normalize a port into a number, string, or false.
 */
launch.prototype.normalizePort= function(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
launch.prototype.onError = function(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof this.port === 'string'
    ? 'Pipe ' + this.port
    : 'Port ' + this.port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
launch.prototype.onListening = function() {
  var addr = this.server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = launch;
