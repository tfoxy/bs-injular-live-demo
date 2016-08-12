'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();


gulp.task('scripts-reload', function() {
  var files;
  if (conf._gulpWatchEvent) {
    files = conf._gulpWatchEvent.path;
  }
  return buildScripts(files)
    .pipe(browserSync.stream());
});

gulp.task('scripts-clean', ['clean:tmp'], function() {
  return buildScripts();
});

gulp.task('scripts', function() {
  return buildScripts();
});

function buildScripts(files) {
  files = files || path.join(conf.paths.src, '/app/**/*.js');
  var babelOptions = {
    presets: ['es2015'],
    plugins: []
  };
  var base = path.resolve(conf.paths.src, 'app');

  return gulp.src(files, {base: base})
    .pipe($.sourcemaps.init())
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.babel(babelOptions)).on('error', conf.errorHandler('Babel'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app')))
    .pipe($.size())
}
