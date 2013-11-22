module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      min: {
        files: [
          {
            src: [ 'min.js' ],
            dest: 'dist/min-debug.js'
          }
        ]
      }
    },

    uglify: {
      min: {
        options: {
          sourceMap: 'dist/min.js.source'
        },
        files: {
          'dist/min.js': [ 'min.js' ],
          'min.min.js': [ 'min.js' ],
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', [ 'copy', 'uglify' ]);
};