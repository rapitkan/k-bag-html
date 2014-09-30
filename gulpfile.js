(function () {
  
  'use strict';

  var gulp = require('gulp'),
      project = require('../projectStructure.json'),
      browserify = require('gulp-browserify'),
      jade = require('gulp-jade'),
      scss = require('gulp-ruby-sass'),
      concat = require('gulp-concat'),
      connect = require('gulp-connect'),
      debug = require('gulp-debug'),
      uglify = require('gulp-uglify'),
      jshint = require('gulp-jshint'),
      source = require('vinyl-source-stream'),
      rename = require('gulp-rename'),
      sourcemaps = require('gulp-sourcemaps'),
      // For unit tests
      karma = require('gulp-karma'),
      // For e2e tests:
      protractor = require("gulp-protractor").protractor,
      webdriver_update = require('gulp-protractor').webdriver_update;

/*******************
* TASKS
*******************/
  gulp.task('browserify', function() {
      // Single entry point to browserify
      gulp.src(project.devFolder + '/index.js')
          .pipe(browserify({
            transform: ["debowerify"],
            insertGlobals: true,
            debug: true
          }))
          .pipe(rename('bundle.js'))
          .pipe(gulp.dest(project.distFolder))          
          .pipe(connect.reload());
  });

  gulp.task('scripts', function () {
    gulp.src(project.devFolder + '/**/*.js')
      .pipe(sourcemaps.init())
        .pipe(concat('project.js'))
        .pipe(browserify({
          transform: ["debowerify"],
          insertGlobals: true,
          debug: true
        }))
        .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(project.distFolder))
  });

  gulp.task('jshint', function() {
    gulp.src([project.devFolder + '/index.js', project.devFolder + '/**/*.js'])
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('jshint-stylish'));
  });

  gulp.task('views', function () {
    gulp.src([project.devFolder + '/index.jade', project.devFolder + '/**/*.jade'])
        .pipe(jade())
        .pipe(gulp.dest(project.distFolder))
        .pipe(connect.reload());
  });

  gulp.task('connect', function () {
    connect.server({
      root: project.distFolder,
      livereload: true,
      port: project.port
    });
  });

  gulp.task('scss', function () {
    gulp.src([project.devFolder + '/index.scss'])
      .pipe(scss({sourcemap: true}))
      .pipe(gulp.dest(project.distFolder))
      .pipe(connect.reload());
  });

  gulp.task('copy-images', function () {
    gulp.src([project.devFolder + '/**/*.png',
              project.devFolder + '/**/*.JPG',
              project.devFolder + '/**/*.jpg'])
      .pipe(gulp.dest(project.distFolder));
  });

  gulp.task('karma', function() {
    gulp.src('./foobar')
      .pipe(karma({
        configFile: 'karma.conf.js',
        action: 'watch'
      }));
  });

  gulp.task('webdriver_update', webdriver_update);

  gulp.task('test-e2e', ['webdriver_update'], function(cb) {
      gulp.src(project.protractor.testFolder).pipe(protractor({
          configFile: project.protractor.configFile,
      })).on('error', function(e) {
          console.log(e);
      }).on('end', cb);
  });

  gulp.task('watch', ['jshint'], function () {
    // Watch jade files
    gulp.watch([project.devFolder +'/index.jade', project.devFolder + '/**/*.jade'], { maxListeners: 999 }, ['views']);
    // Watch the main js file
    gulp.watch([project.devFolder + '/index.js', project.devFolder + '/**/*.js'], { maxListeners: 999}, ['browserify']);
    // Watch scss files
    gulp.watch([project.devFolder + '/index.scss', project.devFolder + '/styles/*.scss'], { maxListeners: 999}, ['scss']);    
  });

/*******************
* MAIN TASKS
*******************/
  gulp.task('dev', ['connect', 'views', /*'scripts',*/ 'browserify', 'scss', 'copy-images', 'watch']);

  gulp.task('test', ['test-e2e']);

  gulp.task('build', ['views', /*'scripts',*/ 'browserify', 'scss', 'copy-images']);

}());