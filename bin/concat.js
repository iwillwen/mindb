#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var path = require('path');
var ejs = require('ejs');
var UglifyJS = require('uglify-js');
var zlib = require('zlib');
var program = require('commander');

var coreTmpl = fs.readFileSync(__dirname + '/core.ejs').toString();
var coreRender = ejs.compile(coreTmpl);

var srcRoot = path.join(__dirname, '/../src');

function readFileSync(filename) {
  return fs.readFileSync(path.resolve(srcRoot, filename)).toString();
}

var files = {
  shim: readFileSync('shim.js'),          // required
  def: readFileSync('def.js'),            // required
  utils: readFileSync('utils.js'),        // required
  events: readFileSync('deps/events.js'), // required
  mix: readFileSync('mix.js'),            // required
  hash: readFileSync('hash.js'),
  list: readFileSync('list.js'),
  set: readFileSync('set.js'),
  zset: readFileSync('zset.js'),
  mise: readFileSync('mise.js'),
  core: readFileSync('core.js')           // required
};

var concat = {};

var moduleNames = {
  shim: 'min.shim',
  def: 'min.def',
  utils: 'min.utils',
  events: 'min.deps.events',
  mix: 'min.mix',
  hash: 'min.hash',
  list: 'min.list',
  set: 'min.sset',
  zset: 'min.zset',
  mise: 'min.mise',
  core: 'min.core'
};

program
  .version('0.0.4')
  .usage('[options]')
  .option('-a --all', 'Import all functions')
  .option('-c --concat <functions>', 'Concat the functions of MinDB, such as hash, list, set, zset etc.', function(val, memo) {
    return memo.concat(val.split(','));
  }, [ 'shim', 'def', 'utils', 'events', 'mix' ])
  .option('-m --minify', 'Minify the output file')
  .option('-o --output <filename>', 'Output the data into a file')
  .parse(process.argv);

switch (true) {
  case program.all:
    // Output all functions
    var output = outputFile(Object.keys(moduleNames), program.minify);

    if (program.output) {
      var filename = path.join(process.cwd(), program.output);

      fs.writeFile(filename, output, function(err) {
        if (err) {
          return console.error(err);
        }

        console.info('Done!');
        return process.exit(1);
      });
    } else {
      process.stdout.write(output);
      process.exit(1);
    }
    break;

  case program.concat.length > 0:
    var output = outputFile(program.concat, program.minify);

    if (program.output) {
      var filename = path.join(process.cwd(), program.output);

      fs.writeFile(filename, output, function(err) {
        if (err) {
          return console.error(err);
        }

        console.info('Done!');
        return process.exit(1);
      });
    } else {
      process.stdout.write(output);
      process.exit(1);
    }
    break;
}

function outputFile(functions, needToMinify) {
  var keys = functions;

  var deps = {};
  var output = '';

  keys.forEach(function(key) {
    deps[key] = moduleNames[key];
    output += files[key];
  });

  var core = coreRender({
    deps: deps
  });

  output += core;

  if (needToMinify) {
    UglifyJS.base54.reset();

    var toplevel = UglifyJS.parse(output, {
      filename: '?',
      toplevel: null
    });

    toplevel.figure_out_scope();
    toplevel = toplevel.transform(UglifyJS.Compressor({
      warnings: false
    }));

    toplevel.figure_out_scope();
    toplevel.compute_char_frequency();
    toplevel.mangle_names({});

    var stream = UglifyJS.OutputStream({});
    toplevel.print(stream);

    return stream.get();
  } else {
    return output;
  }
}