module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: [ 'mocha', 'requirejs' ],

    files: [
      './dist/index.js',
      { pattern: './dist/min.js', included: false, served: true },
      { pattern: './dist/min.*.js', included: false, served: true },
      { pattern: './libs/chai.js', included: true, served: true },
      { pattern: './libs/min.js', included: false, served: true }
    ],

    reporters: [ 'progress', 'coverage' ],

    preprocessors: {
      './libs/min.js': [ 'coverage' ]
    },

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    client: {
      mocha: {
        reporter: 'html', // change Karma's debug.html to the mocha web reporter
        ui: 'bdd'
      }
    },

    singleRun: true,

    browsers : [ 'Chrome', 'Safari' ]
  })
}
