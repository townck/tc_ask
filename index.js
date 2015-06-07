#!/usr/bin/env node

var app = require('./app.js')
	, debug = require('debug')('test:server')
	, http = require('http')
	, config = require('./conf/config.js')
	, port = config.port

var server = http.createServer(app)

console.log(port)
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

function onError(error) 
{	
  	if (error.syscall !== 'listen') {
    	throw error;
  	}
  	
  	switch (error.code) 
  	{
	    case 'EACCES':
	      	console.error('Port ' + port + ' requires elevated privileges')
	      	process.exit(1)
	      	break
	    case 'EADDRINUSE':
	      	console.error('Port ' + port + ' is already in use')
	      	process.exit(1)
	      	break
	    default:
	      	throw error
  	}
}

function onListening() {
  debug('Listening on port ' + server.address().port)
}

