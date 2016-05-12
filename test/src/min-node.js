const min = require('../libs/min')

class MemStore {
  constructor() {

    this.data = {}
    this.ready = true
  }

  set(key, value) {
    this.data[key] = value
  }

  get(key) {
    return this.data[key]
  }

  remove(key) {
    delete this.data[key]
  }
}

if ('undefined' != typeof process) {
  min.store = new MemStore()
}

export default min