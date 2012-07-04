/**
 * NanoDB
 * Cross-Browsers Local Database Library
 *
 * Copyright 2012
 *
 * Gatekeeper:
 *     Will Wen Gunn (C61 Labs)
 *     Jason Gui (KissJs)
 *
 * Browsers Support:
 *     IE 8/9/10
 *     Chrome
 *     Firefox
 *     Safari
 *     Opera
 *     ther modern browsers
 *
 * MIT Licensed
 * 
 */

var nano = (function (w, d) {
    'use strict';

    var lS = localStorage;
    var sS = sessionStorage;
    var cP = w.RawDeflate.deflate;
    var uCP = w.RawDeflate.inflate;

    // base64
    (function(){var a=typeof w!="undefined"?w:exports,b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c=function(){try{d.createElement("$")}catch(a){return a}}();a.btoa||(a.btoa=function(a){for(var d,e,f=0,g=b,h="";a.charAt(f|0)||(g="=",f%1);h+=g.charAt(63&d>>8-f%1*8)){e=a.charCodeAt(f+=.75);if(e>255)throw c;d=d<<8|e}return h}),a.atob||(a.atob=function(a){a=a.replace(/=+$/,"");if(a.length%4==1)throw c;for(var d=0,e,f,g=0,h="";f=a.charAt(g++);~f&&(e=d%4?e*64+f:f,d++%4)?h+=String.fromCharCode(255&e>>(-2*d&6)):0)f=b.indexOf(f);return h})})();

    // json
    if(!w.JSON)(function(){w.JSON={};(function(){'use strict';function f(n){return n<10?'0'+n:n}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key)}if(typeof rep==='function'){value=rep.call(holder,key,value)}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null'}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null'}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==='string'){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v}}if(typeof w.JSON.stringify!=='function'){w.JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' '}}else if(typeof space==='string'){indent=space}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value})}}if(typeof w.JSON.parse!=='function'){w.JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j}throw new SyntaxError('JSON.parse');}}if(!Object.prototype.toJSONString){Object.prototype.toJSONString=function(filter){return w.JSON.stringify(this,filter)};Object.prototype.parseJSON=function(filter){return w.JSON.parse(this,filter)}}}())})();
    var jP = JSON.parse;
    var jS = JSON.stringify;

    // Util
    var addEvent = (function(){if(document.addEventListener){return function(el,type,fn){if(el&&el.nodeName||el===window){el.addEventListener(type,fn,false)}else if(el&&el.length){for(var i=0;i<el.length;i++){addEvent(el[i],type,fn)}}}}else{return function(el,type,fn){if(el&&el.nodeName||el===window){el.attachEvent('on'+type,function(){return fn.call(el,window.event)})}else if(el&&el.length){for(var i=0;i<el.length;i++){addEvent(el[i],type,fn)}}}}})();
    function isArray(ar){return Array.isArray(ar)||(typeof ar==='object'&&ar.toLocalString()==='[object Array]');}

    // Navite Store Interface
    function memStore () {}
    memStore.prototype.get = function (key) {
        return sS.getItem(key);
    };
    memStore.prototype.set = function (key, value) {
        return sS.setItem(key, value);
    };
    memStore.prototype.remove = function (key) {
        return sS.removeItem(key);
    };

    function localStore () {}
    localStore.prototype.get = function (key) {
        return lS.getItem(key);
    };
    localStore.prototype.set = function (key, value) {
        return lS.setItem(key, value);
    };
    localStore.prototype.remove = function (key) {
        return lS.removeItem(key);
    };

    var nano = {
        memStore: memStore,
        localStore: localStore,
        dbs: {}
    };
    /**
     * Fetch a new or existing nano database
     * @param  {String} dbName the name of the database you wanted to fetch
     * @return {nanoDB}        the database
     *
     * var myapp = nano.db('myapp');
     * 
     */
    nano.db = function (dbName, option) {
        option = option || { store: new localStore };
        var db = new nanoDB(dbName, option);
        this.dbs[dbName] = db;
        return db;
    };

    /**
     * Nano Database Class
     * @param {String} dbName the name of the database you wanted to fetch
     *
     * var myapp = new nanoDB('myapp');
     * 
     */
    function nanoDB (dbName, option) {
        this.name = dbName;
        this.option = option;
    }
    /**
     * Fetch a new or existing nano collection of the database.
     * @param {String} collName the name of the collection you wanted to fetch
     * @return {nanoCollection} the collection
     *
     * var items = myapp.collection('items');
     * 
     */
    nanoDB.prototype.collection = function (collName) {
        var collection = new nanoCollection(collName, this.name);
        if (!this.collections) this.collections = {};
        this.collections[collName] = collection;
        return collection;
    };

    /**
     * Nano Collection Class
     * @param  {String} collName the name of the collection you wanted to fetch
     * @param {String} dbName the parent database of the collection you wanted to fetch
     *
     * var items = new nanoCollection('items', 'myapp');
     * 
     */
    function nanoCollection (collName, dbName) {
        this.name = collName;
        this.parent = dbName;
        var store = nano.dbs[dbName].option.store;
        if (!store.get('nano-' + dbName + '-' + collName)) {
            store.set('nano-' + dbName + '-' + collName, btoa(cP('{}')));
            store.set('nano-' + dbName + '-' + collName + '-indexs', btoa(cP('[]')));
        }
        this.collection = jP(uCP(atob(store.get('nano-' + dbName + '-' + collName))));
        this.indexs = jP(uCP(atob(store.get('nano-' + dbName + '-' + collName + '-indexs'))));
    }
    /**
     * Find items in the collection
     * @param {Object} selector the items selector
     * @param {Object} options the query option
     * @param {Function} callback the query callback
     *
     * //Callback
     * items.find({ foo: "bar" }, function (err, resItems) {
     *     if (err) return console.log('Not found!');
     *     console.log(resItems);
     * });
     *
     * //Cursor
     * items.find({ foo: "bar" }).sort(...).skip(...).limit(...).toArray(function (err, resItems) {
     *     if (err) return console.log('Not found!');
     *     console.log(resItems);
     * });
     * 
     */
    nanoCollection.prototype.find = function () {
        var callback = typeof arguments[arguments.length - 1] == 'function' ? arguments[arguments.length - 1] : false;
        var selector = typeof arguments[0] == 'object' ? arguments[0] : {};
        var options = arguments.length > 2 ? arguments[1] : {};

        var results = [];
        var resultIndexs = [];

        function check (item, _id) {
            if (jS(selector) === '{}') return true;
            if (selector._id === _id) return true;
            for (var key in selector) {
                if (item[key] !== selector[key]) return false;
            }
            return true;
        }

        for (var i = 0; i < this.indexs.length; i++) {
            if (check(this.collection[this.indexs[i]], this.indexs[i])) {
                results.push(this.collection[this.indexs[i]]);
                resultIndexs.push(this.indexs[i]);
            }
        }

        if (callback) {
            if (results.length !== 0) {
                for (var i = 0; i < results.length; i++) {
                    results[i]._id = resultIndexs[i];
                }
                callback(null, results);
            } else {
                callback(new Error('Not item found.'));
            }
        } else {
            if (results.length !== 0) {
                for (var i = 0; i < results.length; i++) {
                    results[i]._id = resultIndexs[i];
                }
                return new nanoCursor(results, this.name);
            } else {
                return new nanoCursor([], this.name);
            }
        }
    };

    nanoCollection.prototype.insert = function (doc, callback) {
        var store = nano.dbs[this.parent].option.store;
        var last = this.indexs[this.indexs.length - 1];
        if (last) {
            var theNew = last.substr(0, last.length - 1) + (Number(last.substr(last.length - 1)) + 1);
        } else {
            var theNew = btoa('nano' + this.name) + Math.random().toString().substr(2) + '0';
        }

        this.indexs.push(theNew);
        this.collection[theNew] = doc;

        store.set('nano-' + this.parent + '-' + this.name, btoa(cP(jS(this.collection))));
        store.set('nano-' + this.parent + '-' + this.name + '-indexs', btoa(cP(jS(this.indexs))));
        this.emit('insert', doc);
        callback(null);
    };

    nanoCollection.prototype.remove = function (selector) {
        var callback = typeof arguments[arguments.length - 1] == 'function' ? arguments[arguments.length - 1] : false;
        selector = selector || {};

        var store = nano.dbs[this.parent].option.store;

        function check (item) {
            if (jS(selector) === '{}') return true;
            for (var key in selector) {
                if (item[key] !== selector[key]) return false;
            }
            return true;
        }

        var res = [];

        var i = 0;
        var f = this.indexs.length;
        for (var i = f - 1; i >= 0; i--) {
            if (check(this.collection[this.indexs[i]])) {
                var t = this.collection[this.indexs[i]];
                t._id = this.indexs[i];
                res.push(t);
                t = null;
                delete this.collection[this.indexs[i]];
                this.indexs.splice(i, 1);
            }
        }
        if (i == 0) return callback(new Error('Not items matched'));

        store.set('nano-' + this.parent + '-' + this.name, btoa(cP(jS(this.collection))));
        store.set('nano-' + this.parent + '-' + this.name + '-indexs', btoa(cP(jS(this.indexs))));
        this.emit('remove', res);

        if (callback) callback(null, res);
    };

    nanoCollection.prototype.on = function (event, fn) {
        if (!this._events) this._events = {};
        if (!this._events[event]) return this._events[event] = [fn];
        this._events[event].push(event);
        return this;
    };

    nanoCollection.prototype.emit = function () {
        var event = arguments[0];
        if (!this._events) return false;
        var handler = this._events[event];
        if (!handler) return false;

        if (isArray(handler)) {
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) {
                args[i - 1] = arguments[i];
            }
            var listeners = handler.slice();
            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args);
            }
            return true;
        } else {
            return false;
        }
    };

    addEvent(w, 'storage', function (evt) {
        if (!/^nano/.test(evt.key)) {
            return;
        } else if (/^nano-([\w]+)-([\w]+)-indexs$/.test(evt.key)) {
            var foo = evt.key.match(/nano-([\w]+)-([\w]+)/);
            var dbName = foo[1];
            var collname = foo[2];
            var collection = jP(uCP(atob(store.get('nano-' + dbName + '-' + collName))));
            var indexs = jP(uCP(atob(store.get('nano-' + dbName + '-' + collName + '-indexs'))));
            var theNew = collection[indexs[indexs.length - 1]];
            theNew._id = indexs[indexs.length - 1];
            nano.dbs[dbName].collections[collname].emit('storage', theNew);
        } else {
            return;
        }
    });


    function nanoCursor (collection, collName) {
        this.collection = collection;
        this.parent = collName;
    }
    nanoCursor.prototype.toArray = function (callback) {
        if (results.length !== 0) {
            callback(null, this.collection);
        } else {
            callback(new Error('Not item found.'));
        }
    };
    return nano;
})(window, document);