module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    uglify: {
      min: {
        options: {
          sourceMap: 'min.js.source'
        },
        files: {
          'dist/min.js': [ 'min.js' ],
          'min.min.js': [ 'min.js' ],
        }
      }
    },

    copy: {
      min: {
        files: [
          { src: [ 'min.js' ], dest: 'dist/min-debug.js'},
          { src: [ 'min.js' ], dest: 'index.js'},
          { src: [ 'min.js.source' ], dest: 'dist/min.js.source'}
        ]
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', [ 'copy', 'uglify' ]);
};