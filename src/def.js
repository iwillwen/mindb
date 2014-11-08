function def(name, deps, factory) {
  var hasDefine  = 'undefined' !== typeof define;
  var hasExports = 'undefined' !== typeof exports;

  if (!factory && deps instanceof Function) {
    factory = deps;
    deps = [];
  }

  if (hasDefine) {
    // CommonJS: SeaJS, RequireJS etc.
    if (define.amd) {
      // AMD
      define(factory);
    } else {
      // CMD
      define(name, deps, factory);
    }
  } else if (hasExports) {
    // Node.js Module
    exports = factory(require, exports, module);
  } else {
    // Normal
    var module = {
      exports: {}
    };
    def.cache[name] = this[name] = module.exports = factory(function(name) {
      if (def.cache.hasOwnProperty(name)) {
        return def.cache[name];
      } else {
        return null;
      }
    }, module.exports, module);
  }
}
def.cache = {};