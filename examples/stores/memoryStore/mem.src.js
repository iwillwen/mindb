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

export default MemStore
