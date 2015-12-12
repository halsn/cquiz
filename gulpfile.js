var gulp = require('gulp');
var browserSync = require('browser-sync');
var jade = require('gulp-jade');
var reload = browserSync.roload;

gulp.task('templates', function () {
    return gulp.src('./views/*.jade')
        .pipe(jade())
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});

gulp.task('jade-watch', ['templates'], reload);

gulp.task('default', ['templates'], function () {
    browserSync({
        server: './dist'
    });
    gulp.watch('./views/*.jade', ['jade-watch']);
});
