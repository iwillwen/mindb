var min = require('../dist/min-debug');
var MemStore = require('../examples/stores/memoryStore/mem');

min.store = new MemStore()

module.exports = min;