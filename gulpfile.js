/* eslint-disable */

'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var gulp = require('gulp');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var fs = require('fs');
var gulpif = require('gulp-if');
var merge = require('gulp-merge-json');
var newer = require('gulp-newer');
var postcss = require('gulp-postcss');
var print = require('gulp-print');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
//var rtlscss = require('rtlcss');

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var sassOptions = { style: 'compact' };
var paths = ['./src/main/webapp/wise5/style/**/*.scss', './src/main/webapp/wise5/themes/*/style/**/*.scss'];
var autoprefixerOptions = { browsers: ['> 5%', 'last 2 versions', 'Firefox ESR', 'not ie <= 10'] };

// -----------------------------------------------------------------------------
// Sass compilation
// -----------------------------------------------------------------------------
gulp.task('compile-sass', function() {
    return gulp
        .src(paths, {base: './'})
        .pipe(gulpif(global.isWatching, newer({dest: './', ext: '.css', extra: paths })))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(postcss([ autoprefixer(autoprefixerOptions), cssnano/*, rtlcss*/ ]) )
        .pipe(sourcemaps.write('.'))
        //.pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest('./'))
        .pipe(print(function(filepath) {
            return "Compiled: " + filepath;
        }));
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
            console.log('File ' + event.path + ' was ' + event.type);
        });
});

// -----------------------------------------------------------------------------
// merge i18n json files
// If key doesn't exist in foreignLocale, sets it value to "".
// Removes extra keys from foreignLocale
// -----------------------------------------------------------------------------
gulp.task('update-i18n', function() {
    var supportedLocales = ['ar','es','iw','ja','ko','nl','pt','tr','zh_CN','zh_TW'];
    // update WISE5 i18n files
    var wise5_i18n_folders = [
        './src/main/webapp/wise5/authoringTool/i18n/',
        './src/main/webapp/wise5/classroomMonitor/i18n/',
        './src/main/webapp/wise5/vle/i18n/',
        './src/main/webapp/wise5/components/audioOscillator/i18n/',
        './src/main/webapp/wise5/components/conceptMap/i18n/',
        './src/main/webapp/wise5/components/discussion/i18n/',
        './src/main/webapp/wise5/components/draw/i18n/',
        './src/main/webapp/wise5/components/embedded/i18n/',
        './src/main/webapp/wise5/components/graph/i18n/',
        './src/main/webapp/wise5/components/html/i18n/',
        './src/main/webapp/wise5/components/label/i18n/',
        './src/main/webapp/wise5/components/match/i18n/',
        './src/main/webapp/wise5/components/multipleChoice/i18n/',
        './src/main/webapp/wise5/components/openResponse/i18n/',
        './src/main/webapp/wise5/components/outsideURL/i18n/',
        './src/main/webapp/wise5/components/table/i18n/'
    ];
    wise5_i18n_folders.map(function(i18n_folder) {
      var english = JSON.parse(fs.readFileSync(i18n_folder + "i18n_en.json"));
        supportedLocales.map(function(supportedLocale) {
            var result = JSON.parse(fs.readFileSync(i18n_folder + "i18n_en.json"));
            var foreignLocale = {};
            try {
              // if the file doesn't exist, it will throw an exception
              foreignLocale = JSON.parse(fs.readFileSync(i18n_folder + "i18n_" + supportedLocale + ".json"));
            } catch (ex) {
              // do nothing. we'll use the default {} object
            }
            for (var key in foreignLocale) {
              if (result[key]) {
                result[key] = foreignLocale[key];
              }
            }
            // now look for keys that don't exist in the foreignLocale and set value to ""
            for (var key in english) {
              if (foreignLocale[key] == null) {
                result[key] = "";
              }
            }

            var jsonReplacer = null;
            var jsonSpace = '\t';
            var result = JSON.stringify(result, jsonReplacer, jsonSpace);
            fs.writeFileSync(i18n_folder + "i18n_" + supportedLocale + ".json", result);
        });
    });
});


// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

gulp.task('default', ['watch-sass']);


// http://stackoverflow.com/questions/27859691/gulp-handling-multiple-themes-and-folders
// https://gist.github.com/HugoGiraudel/8b1d9948f925acaf10ef
// https://github.com/pawelgrzybek/Starter/blob/master/gulpfile.js
