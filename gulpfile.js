'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var sourcemaps = require('gulp-sourcemaps');
//var rtlscss = require('rtlcss');

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var sassOptions = { style: 'compact' };
var corePath = './src/main/webapp/wise5/style/**/*.scss';
var themesPath = './src/main/webapp/wise5/vle/themes/*/style/**/*.scss';
var autoprefixerOptions = { browsers: ['> 5%', 'last 2 versions', 'Firefox ESR', 'not ie <= 10'] };

// -----------------------------------------------------------------------------
// Sass compilation
// -----------------------------------------------------------------------------

function compileSass(file) {
    return gulp
        .src([file])
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(sourcemaps.write({includeContent: false}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(postcss([ autoprefixer(autoprefixerOptions), cssnano/*, rtlcss*/ ]) )
        .pipe(sourcemaps.write('.'))
        //.pipe(rename({suffix: ".min"}))
        //.pipe(gulp.dest('.'));
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
}

// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------

gulp.task('watch-sass', function() {
    return gulp
        // Watch folders for *.scss changes in the specified paths,
        // and run `sass` task on change
        .watch([corePath, themesPath])
        .on('change', function(event) {
            compileSass(event.path);
            console.log('File ' + event.path + ' was ' + event.type + ', compiling...');
        });
});


// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

gulp.task('default', ['watch-sass']);


// http://stackoverflow.com/questions/27859691/gulp-handling-multiple-themes-and-folders
// https://gist.github.com/HugoGiraudel/8b1d9948f925acaf10ef
// https://github.com/pawelgrzybek/Starter/blob/master/gulpfile.js
