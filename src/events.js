import utils from './utils.js'

const noop = utils.noop

const defaultMaxListeners = 10

export class EventEmitter {
  constructor() {
    this._events = this._events || {}
    this._maxListeners = this._maxListeners || defaultMaxListeners
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0)
      throw TypeError('n must be a positive number')
    this._maxListeners = n
  }

  emit(type) {
    let er, handler, len, args, i, listeners

    if (!this._events)
      this._events = {}

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events.error ||
          (typeof this._events.error === 'object' &&
           !this._events.error.length)) {
        er = arguments[1]
        if (this.domain) {
          if (!er) er = new TypeError('Uncaught, unspecified "error" event.')
        } else if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          throw TypeError('Uncaught, unspecified "error" event.')
        }
        return false
      }
    }

    handler = this._events[type]

    if (typeof handler === 'undefined')
      return false

    if (typeof handler === 'function') {
      switch (arguments.length) {
        // fast cases
        case 1:
          handler.call(this)
          break
        case 2:
          handler.call(this, arguments[1])
          break
        case 3:
          handler.call(this, arguments[1], arguments[2])
          break
        // slower
        default:
          len = arguments.length
          args = new Array(len - 1)
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i]
          handler.apply(this, args)
      }
    } else if (typeof handler === 'object') {
      len = arguments.length
      args = new Array(len - 1)
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i]

      listeners = handler.slice()
      len = listeners.length
      for (i = 0; i < len; i++)
        listeners[i].apply(this, args)
    }

    return true
  }

  addListener(type, listener) {
    let m

    if (typeof listener !== 'function')
      throw TypeError('listener must be a function')

    if (!this._events)
      this._events = {}

    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (this._events.newListener)
      this.emit('newListener', type, typeof listener.listener === 'function' ?
                listener.listener : listener)

    if (!this._events[type])
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener
    else if (typeof this._events[type] === 'object')
      // If we've already got an array, just append.
      this._events[type].push(listener)
    else
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener]

    // Check for listener leak
    if (typeof this._events[type] === 'object' && !this._events[type].warned) {
      m = this._maxListeners
      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length)
        console.trace()
      }
    }

    return this
  }

  once(type, listener) {
    if (typeof listener !== 'function')
      throw TypeError('listener must be a function')

    function g() {
      this.removeListener(type, g)
      listener.apply(this, arguments)
    }

    g.listener = listener
    this.on(type, g)

    return this
  }

  removeListener(type, listener) {
    let list, position, length, i

    if (typeof listener !== 'function')
      throw TypeError('listener must be a function')

    if (!this._events || !this._events[type])
      return this

    list = this._events[type]
    length = list.length
    position = -1

    if (list === listener ||
        (typeof list.listener === 'function' && list.listener === listener)) {
      this._events[type] = undefined
      if (this._events.removeListener)
        this.emit('removeListener', type, listener)

    } else if (typeof list === 'object') {
      for (i = length; i-- > 0;) {
        if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener)) {
          position = i
          break
        }
      }

      if (position < 0)
        return this

      if (list.length === 1) {
        list.length = 0
        this._events[type] = undefined
      } else {
        list.splice(position, 1)
      }

      if (this._events.removeListener)
        this.emit('removeListener', type, listener)
    }

    return this
  }

  removeAllListeners(type) {
    if (!this._events)
      return this

    // not listening for removeListener, no need to emit
    if (!this._events.removeListener) {
      if (arguments.length === 0)
        this._events = {}
      else if (this._events[type])
        this._events[type] = undefined
      return this
    }

    // emit removeListener for all listeners on all events
    if (arguments.length === 0) {
      const keys = Object.keys(this._events)

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (key === 'removeListener') continue
        this.removeAllListeners(key)
      }
      this.removeAllListeners('removeListener')
      this._events = {}
      return this
    }

    const listeners = this._events[type]

    if (typeof listeners === 'function') {
      this.removeListener(type, listeners)
    } else {
      // LIFO order
      while (listeners.length)
        this.removeListener(type, listeners[listeners.length - 1])
    }
    this._events[type] = undefined

    return this
  }

  listeners(type) {
    let ret
    if (!this._events || !this._events[type])
      ret = []
    else if (typeof this._events[type] === 'function')
      ret = [this._events[type]]
    else
      ret = this._events[type].slice()
    return ret
  }
}

EventEmitter.prototype.on = EventEmitter.prototype.addListener
EventEmitter.listenerCount = function(emitter, type) {
  let ret
  if (!emitter._events || !emitter._events[type])
    ret = 0
  else if (typeof emitter._events[type] === 'function')
    ret = 1
  else
    ret = emitter._events[type].length
  return ret
}
EventEmitter.inherits = function(ctor) {
  utils.inherits(ctor, EventEmitter)
};

class _Promise {
  constructor(resolver = noop) {

    this._settled = false
    this._success = false
    this._args = []
    this._callbacks = []
    this._onReject = noop

    resolver(this.resolve.bind(this), this.reject.bind(this))
  }

  then(onResolve, onReject = noop) {
    const promise = new _Promise()

    this._onReject = onReject
    this._callbacks.push((...args) => {
      const ret = onResolve.apply(this, args)

      if (ret && typeof ret.then == 'function') {
        ret.then(promise.resolve.bind(promise),
          promise.reject.bind(promise))
      }
    })

    if (this._settled) {
      if (this._success) {
        this.resolve.apply(this, this._args)
      } else {
        this.onReject.apply(this, this._args)
      }
    }

    return promise
  }

  catch(onReject) {
    this._onReject = onReject

    return this
  }

  resolve(...args) {
    for (let i = 0; i < this._callbacks.length; i++) {
      let handler = this._callbacks[i]
        handler.apply(this, args)
    }

    this._args = args
    this._settled = true
    this._success = true
  }

  reject(...args) {
    this._onReject.apply(this, args)

    this._args = args
    this._settled = true
  }
}

const nativePromise = (global || window).Promise || null;

export function Promise(resolver) {
  let promise = null
  let resolve = noop
  let reject = noop
  resolver = resolver || noop

  if (nativePromise) {
    promise = new nativePromise((_1, _2) => {
      resolve = _1
      reject = _2

      resolver(_1, _2)
    })
    promise.resolve = (...args) => {
      resolve.apply(promise, args)
    }
    promise.reject = (...args) => {
      reject.apply(promise, args)
    }
  } else {
    promise = new _Promise(resolver)
  }

  return promise
}
