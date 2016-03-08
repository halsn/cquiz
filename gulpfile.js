var gulp = require('gulp');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var browserSync = require('browser-sync').create();
var jade = require('gulp-jade');
var browserify = require('browserify');
var watchify = require('watchify');
var hmr = require('browserify-hmr');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var babel = require('babelify');
var exec = require('child_process').exec;

var opts = {
  entries: './dev/js/main.js',
  debug: true,
  cache: {},
  packageCache: {},
  plugin: [watchify]
};

var babelOpts = {
  ignore: ['./dev/js/vendor/*'],
  compact: false,
  presets: ['es2015']
};

var b = browserify(opts).transform(babel.configure(babelOpts));

function bundle() {
  return b.bundle()
    .on('error', err => console.log(err))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./static/js'))
    .on('end', browserSync.reload);
}

b.on('update', bundle);

gulp.task('start', function () {
  exec('npm start', (stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
  });
});

gulp.task('sass', function () {
  return gulp.src('./dev/sass/**/*.sass')
    .pipe(sass())
    .pipe(gulp.dest('./static/css'))
    .on('end', browserSync.reload);
});

gulp.task('jade', function () {
  return gulp.src('./views/**/*.jade')
    .on('end', browserSync.reload);
});

gulp.task('scripts', function () {
  bundle();
});

gulp.task('compressJS', function () {
  return gulp.src([
      './static/js/material.min.js',
      './static/js/vue.min.js',
      './static/js/xlsx.core.min.js',
      './static/js/bundle.js'
    ])
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./static/js'));
});

gulp.task('compressCSS', function () {
  return gulp.src('./dev/sass/**/*.sass')
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./static/css'));
});

gulp.task('default', ['start', 'jade', 'sass', 'scripts'], function () {
  browserSync.init({
    proxy: 'localhost:5000'
  });
  gulp.watch('./views/**/*.jade', ['jade']);
  gulp.watch('./dev/sass/**/*.sass', ['sass']);
});
