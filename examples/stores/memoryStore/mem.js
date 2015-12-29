"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.memSrc = mod.exports;
  }
})(this, function (exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();

  var MemStore = (function () {
    function MemStore() {
      _classCallCheck(this, MemStore);

      this.data = {};
      this.ready = true;
    }

    _createClass(MemStore, [{
      key: "set",
      value: function set(key, value) {
        this.data[key] = value;
      }
    }, {
      key: "get",
      value: function get(key) {
        return this.data[key];
      }
    }, {
      key: "remove",
      value: function remove(key) {
        delete this.data[key];
      }
    }]);

    return MemStore;
  })();

  exports.default = MemStore;
});

