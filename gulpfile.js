const gulp = require('gulp');
const babel = require('gulp-babel');
const header = require('gulp-header');

gulp.task('transpile', _ => {
    gulp.src('./src/redshirt.js')
        .pipe(babel())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['transpile']);

gulp.task('default', ['build']);
