/**!
 * 
 * MinDB
 *
 * Database on JavaScript
 *
 *  Copyright (c) 2012-2014 Will Wen Gunn(willwengunn@gmail.com)
 *  All rights reserved.
 *
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining
 *  a copy of this software and associated documentation files (the
 *  "Software"), to deal in the Software without restriction, including
 *  without limitation the rights to use, copy, modify, merge, publish,
 *  distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to
 *  the following conditions:
 *
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.
 * 
 */

// Shims
(function(window, document) {

  if (window && document) {
    function createScript() {
      return document.createElement("script");
    }
    // JSON
    var s = document.getElementsByTagName("script")[0];
    var head = s.parentNode;

    if (!window.JSON) {
      var jsonSrc = createScript();
      jsonSrc.src = "//cdn.staticfile.org/json2/20121008/json2.min.js";
      head.insertBefore(jsonSrc, s);
    }

    if (!Function.prototype.bind || !Array.isArray) {
      // ECMAScript 5
      var shimSrc = createScript();
      shimSrc.src = "//cdn.staticfile.org/es5-shim/2.1.0/es5-shim.min.js";
      head.insertBefore(shimSrc, s);
      var shamSrc = createScript();
      shamSrc.src = "//cdn.staticfile.org/es5-shim/2.1.0/es5-sham.min.js";
      head.insertBefore(shamSrc, s);
    }

    if (!Object.create) {
      Object.create = (function() {
        function F() {}

        return function(superCtor, ctor) {
          F.prototype = {};
          for (var key in superCtor) {
            F.prototype[key] = superCtor[key];
          }
          for (var key in ctor) {
            F.prototype[key] = ctor[key];
          }
          return new F();
        }
      })();
    }
  }

})((typeof(window) !== 'undefined' ? window : this), (typeof(document) !== 'undefined' ? document : null));