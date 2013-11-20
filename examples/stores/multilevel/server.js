var net = require('net');
var multilevel = require('multilevel');
var level = require('level');
var db = level('/tmp/test.db', { encoding: 'json' });

net.createServer(function(stream) {
  stream.pipe(multilevel.server(db)).pipe(stream);
}).listen(8080);