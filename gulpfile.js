var gulp = require('./gulp')([
    'build-tests'
]);
 
gulp.task('build', ['build-tests']);
gulp.task('default', ['build']);
