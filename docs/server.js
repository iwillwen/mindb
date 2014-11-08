var express = require('express');
var fs = require('fs');
var util = require('util');
var path = require('path');
var ejs = require('ejs');
var UglifyJS = require('uglify-js');
var zlib = require('zlib');

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

var app = express();
app.use(express.query());
var router = express.Router();

router.get('/concat', function(req, res) {
  var concat = req.query.concat.split(',');

  var keys = null;

  if (concat[0] == 'all') {
    keys = Object.keys(moduleNames);
  } else {
    keys = concat.slice();
  }

  var deps = {};
  var mindbFile = '';

  keys.forEach(function(key) {
    deps[key] = moduleNames[key];
    mindbFile += files[key];
  });

  var core = coreRender({
    deps: deps
  });

  mindbFile += core;

  res.header('Content-Type', 'application/javascript');
  res.header('Content-Encoding', 'gzip');

  var gzip = zlib.createGzip();
  gzip.pipe(res);
  gzip.end(mindbFile);
});

router.get('/concat/minify', function(req, res) {
  var concat = req.query.concat.split(',');

  var keys = null;

  if (concat[0] == 'all') {
    keys = Object.keys(moduleNames);
  } else {
    keys = concat.slice();
  }

  var deps = {};
  var mindbFile = '';

  keys.forEach(function(key) {
    deps[key] = moduleNames[key];
    mindbFile += files[key];
  });

  var core = coreRender({
    deps: deps
  });

  mindbFile += core;

  UglifyJS.base54.reset();

  var toplevel = UglifyJS.parse(mindbFile, {
    filename: '?',
    toplevel: null
  });

  toplevel.figure_out_scope();
  toplevel = toplevel.transform(UglifyJS.Compressor());

  toplevel.figure_out_scope();
  toplevel.compute_char_frequency();
  toplevel.mangle_names({});

  var output = UglifyJS.OutputStream(output);
  toplevel.print(output);

  res.header('Content-Type', 'application/javascript');
  res.header('Content-Encoding', 'gzip');

  var gzip = zlib.createGzip();
  gzip.pipe(res);
  gzip.end(output.get());

  // res.send(output.get());
});

app.use(router);

app.listen(8080);