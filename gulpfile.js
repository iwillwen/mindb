var gulp = require('gulp')
var babel = require('gulp-babel')
var sourcemaps = require('gulp-sourcemaps')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var header = require('gulp-header')
var File = require('vinyl')
var path = require('path')
var fs = require('fs')

var source = gulp.src([
  'src/stores.js',
  'src/utils.js',
  'src/deps/events.js',
  'src/mix.js',
  'src/hash.js',
  'src/list.js',
  'src/set.js',
  'src/zset.js',
  'src/mise.js',
  'src/min.js'
])

gulp.task('concat', function() {
  return source
    .pipe(sourcemaps.init())
    .pipe(babel({
      stage: 0,
      modules: 'umd'
    }))
    .pipe(concat('min-debug.js'))
    .pipe(header(fs.readFileSync('src/banner.js', 'utf8')))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist'))
})

gulp.task('uglify', function() {
  return source
    .pipe(sourcemaps.init())
    .pipe(babel({
      stage: 0,
      modules: 'umd'
    }))
    .pipe(uglify())
    .pipe(concat('min.js'))
    .pipe(header(fs.readFileSync('src/banner.js', 'utf8')))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist'))
})

gulp.task('default', [ 'concat', 'uglify' ])