var path = require('path');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var uglify = require('gulp-uglify');

module.exports = function (){

    var files = [
        './tests/graphical/scripts/main.js'
    ];

    var tasks = files.map( function ( filePath ){
        var pathDetails = path.parse( filePath );
        var outputDirectory = pathDetails.dir;
        var outputName = pathDetails.name + '.bundle' + pathDetails.ext;

        return browserify( filePath )
            .bundle()
            .pipe( source( outputName ) )
            .pipe( buffer() )
            .pipe( uglify() )
            .pipe( gulp.dest( outputDirectory ) );
    } );
};
