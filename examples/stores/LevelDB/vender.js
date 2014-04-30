var min = require('../../../min');
var LevelStore = require('./nano_level');
var net = require('net');
var util = require('util');

min.store = new LevelStore('/tmp/mydb', { encoding: 'json' });

var server = net.createServer(function(stream) {
  stream.write(util.format('Simple Redis CLI Simulator: NanoDB with LevelDB on \'%s\'\r\n', min.store.filename));
  stream.write('> ');

  stream.on('data', function(data) {
    var args = data.toString().replace(/[\r\n]/g, '').split(' ');

    var command = args.shift().toLowerCase();

    switch (true) {
      // Exit
      case command == '\\q':
        stream.end('Bye!\n');
        break;

      // Command
      case (min.hasOwnProperty(command) && 'function' === typeof min[command]):
        min[command].apply(min, args)
          .then(function() {
            var result = slice.call(arguments).join(' ') + '\n> ';

            stream.write(result);
          })
          .fail(function(err) {
            stream.write(util.format('(error) ERR %s\n> ', err.messgae));
          });
        break;

      // Unknown command
      default:
        stream.write(util.format("(error) ERR unknown command '%s'\n> ", command.replace('\n', '')));
    }
  });

  stream.on('error', function(err) {
    console.error(err);
  });
});

server.listen(8081);

var slice = [].slice;