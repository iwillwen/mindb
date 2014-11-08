module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      mindb: {
        files: {
          'min.all.js': [
            'src/shim.js',
            'src/def.js',
            'src/utils.js',
            'src/deps/events.js',
            'src/mix.js',
            'src/hash.js',
            'src/list.js',
            'src/set.js',
            'src/zset.js',
            'src/mise.js',
            'src/core.js'
          ]
        }
      }
    },

    uglify: {
      min: {
        options: {
          sourceMap: 'min.js.source'
        },
        files: {
          'dist/min.js': [ 'min.all.js' ],
          'min.min.js': [ 'min.all.js' ],
        }
      }
    },

    copy: {
      min: {
        files: [
          { src: [ 'min.all.js' ], dest: 'dist/min-debug.js'},
          { src: [ 'min.all.js' ], dest: 'index.js'},
          { src: [ 'min.js.source' ], dest: 'dist/min.js.source'}
        ]
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', [ 'concat', 'copy', 'uglify' ]);
};