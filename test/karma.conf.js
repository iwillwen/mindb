module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: [ 'mocha', 'requirejs' ],

    files: [
      './src/index.js',
      { pattern: './dist/min.js', included: false },
      { pattern: './dist/min.*.js', included: false },
      { pattern: './libs/chai.js', included: false },
      { pattern: './libs/min.js', included: false }
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

    browsers : [ 'Chrome' ]
  })
}
