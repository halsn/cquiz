var path = require('path');
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
var spawn = require('child_process').spawn;

var jsEntries = ['./dev/js/index.js', './dev/js/t/home.js', './dev/js/test.js', './dev/js/login.js'];
var sassEntries = ['./dev/sass/index.sass', './dev/sass/home.sass', './dev/sass/test.sass', './dev/sass/login.sass'];

gulp.task('start', () => {
  var nodemon = spawn('nodemon', ['--exec', 'npm start']);
  nodemon.stdout.on('data', data => console.log(data.toString()));
  nodemon.stderr.on('data', data => console.log(data.toString()));
});

gulp.task('sass', () => {
  return gulp.src(sassEntries)
    .pipe(sass().on('error', gutil.log))
    .pipe(gulp.dest('./static/css'))
    .on('end', browserSync.reload);
});

gulp.task('jade', () => {
  return gulp.src('./views/**/*.jade')
    .on('end', browserSync.reload);
});

gulp.task('scripts', () => {
  var babelOption = {
    ignore: ['./dev/js/vendor/*'],
    compact: false,
    presets: ['es2015']
  };
  jsEntries.forEach(entry => {
    var option = {
      entries: entry,
      debug: false,
      cache: {},
      packageCache: {},
      plugin: [watchify]
    };
    var stream = browserify(option).transform(babel.configure(babelOption));
    stream.on('update', bundle);
    bundle();

    function bundle() {
      return stream.bundle()
        .on('error', gutil.log)
        .pipe(source(path.basename(entry)))
        .pipe(buffer())
        .pipe(gulp.dest('./static/js'))
        .on('end', browserSync.reload);
    }
  });
});

gulp.task('compressCSS', () => {
  return gulp.src(sassEntries)
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./static/css'));
});

gulp.task('compressJS', () => {
  return gulp.src([
      './static/js/index.js',
      './static/js/home.js',
      './static/js/test.js',
      './static/js/login.js'
    ])
    .pipe(uglify())
    .pipe(gulp.dest('./static/js'));
});

gulp.task('publish', ['compressCSS', 'compressJS'], (err) => {
  console.log(err);
});

gulp.task('default', ['start', 'jade', 'sass', 'scripts'], () => {
  browserSync.init({
    proxy: 'localhost:5000'
  });
  gulp.watch('./views/**/*.jade', ['jade']);
  gulp.watch('./dev/sass/**/*.sass', ['sass']);
});
