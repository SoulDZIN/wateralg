// ===========
// This file was based on another source. Updates have been made but the original can be found below.
//
// original: https://gist.github.com/Sigmus/9253068 
// ===========
var path = require('path');
var source = require( 'vinyl-source-stream' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var browserify = require( 'browserify' );
var watchify = require( 'watchify' );
var notify = require( "gulp-notify" );

function handleErrors() {
  var args = Array.prototype.slice.call( arguments );
  
  notify.onError( {
        title: "Compile Error",
        message: "<%= error.message %>"
      } )
      .apply( this, args );

  this.emit( 'end' ); // Keep gulp from hanging on this task
}


function buildScript( filePath, watch ) {
    var details = path.parse( filePath );
    var outFile = details.base + '.bundle' + details.ext;
    var outDir = details.dir;

    var props = { entries: [filePath], debug: true, cache: {}, packageCache: {} };
    var bundler = browserify( props );

    function rebundle() {
        return bundler
            .bundle()
            .on( 'error', handleErrors )
            .pipe( source( outFile ) )
            .pipe( gulp.dest( outDir ));
    }

    if ( watch ) {
        bundler = watchify(bundler);
        
        bundler.on( 'update', function () {
            rebundle();
            gutil.log( 'Rebundle...' );
        } );
    }


  return rebundle();
}

function buildTests( watch ) {
    return buildScript( './tests/graphical/scripts/main.js', watch );
}


gulp.task( 'build-tests', function() {
    return buildTests( false );
} );

gulp.task( 'watch-tests', function() {
    return buildTests( true );
} );


gulp.task( 'default', ['watch-tests']);
