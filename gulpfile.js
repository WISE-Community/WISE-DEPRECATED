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
var newer = require('gulp-newer');
var gulpif = require('gulp-if');
//var rtlscss = require('rtlcss');

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var sassOptions = { style: 'compact' };
var paths = ['./src/main/webapp/wise5/style/**/*.scss', './src/main/webapp/wise5/vle/themes/*/style/**/*.scss'];
var autoprefixerOptions = { browsers: ['> 5%', 'last 2 versions', 'Firefox ESR', 'not ie <= 10'] };

// -----------------------------------------------------------------------------
// Sass compilation
// -----------------------------------------------------------------------------
gulp.task('compile-sass', function() {
    return gulp
        .src(paths, {base: './'})
        .pipe(gulpif(global.isWatching, newer({dest: './', ext: '.css'})))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(postcss([ autoprefixer(autoprefixerOptions), cssnano/*, rtlcss*/ ]) )
        .pipe(sourcemaps.write('.'))
        //.pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest('./'));
        //.pipe(gulp.dest(function(file) {
            //return file.base;
        //}));
});

// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------
gulp.task('set-watch', function() {
    global.isWatching = true;
});

gulp.task('watch-sass', ['set-watch'], function() {
    return gulp
        // Watch folders for *.scss changes in the specified paths,
        // and run `compile-sass` task on change
        .watch(paths, ['compile-sass'])
        .on('change', function(event) {
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
