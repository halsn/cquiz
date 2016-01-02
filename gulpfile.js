var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var jade = require('gulp-jade');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');

gulp.task('sass', function () {
  return gulp.src('./dev/sass/main.sass')
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest('./static/css'))
    .on('end', browserSync.reload);
})

gulp.task('jade', function () {
  return gulp.src('./views/*.jade')
    .on('end', browserSync.reload);
});

gulp.task('scripts', function () {
  return gulp.src('./dev/js/main.js')
    .pipe(browserify())
    .pipe(rename('bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./static/js'))
    .on('end', browserSync.reload);
});

gulp.task('default', ['jade', 'scripts', 'sass'], function () {

  browserSync.init({
    proxy: 'localhost:5000'
  });
  gulp.watch('./views/*.jade', ['jade']);
  gulp.watch('./dev/js/*.js', ['scripts']);
  gulp.watch('./dev/sass/*.sass', ['sass']);
});
