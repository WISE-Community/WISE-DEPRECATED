/* eslint-disable */

'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const fs = require('fs');
const gulpif = require('gulp-if');
const merge = require('gulp-merge-json');
const newer = require('gulp-newer');
const postcss = require('gulp-postcss');
const print = require('gulp-print');
const sass = require('gulp-sass');
//const rtlscss = require('rtlcss');

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const sassOptions = { style: 'compact' };
const paths = ['./src/main/webapp/wise5/style/**/*.scss',
    './src/main/webapp/wise5/themes/*/style/**/*.scss'];
const autoprefixerOptions = { browsers: ['> 5%', 'last 2 versions',
    'Firefox ESR', 'not ie <= 10'] };

// -----------------------------------------------------------------------------
// Sass compilation
// -----------------------------------------------------------------------------
gulp.task('compile-sass', function() {
  return gulp
    .src(paths, {base: './'})
    .pipe(gulpif(global.isWatching,
        newer({dest: './', ext: '.css', extra: paths })))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss([ autoprefixer(autoprefixerOptions),
        cssnano({zindex: false})/*, rtlcss*/ ]) )
    .pipe(sourcemaps.write('.'))
    //.pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./'))
    .pipe(print(function(filepath) {
      return 'Compiled: ' + filepath;
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

gulp.task('transpile', () => {
  return gulp.watch(['./src/main/webapp/wise5/**/*.es6'])
    .on('change', (event) => {
      const changedFilePath = event.path;
      let changedFileDir = '';
      const lastIndexOfForwardSlash = changedFilePath.lastIndexOf('/');
      if (lastIndexOfForwardSlash > 0) {
        changedFileDir = changedFilePath.substr(0, lastIndexOfForwardSlash);
      } else {
        changedFileDir =
          changedFilePath.substr(0, changedFilePath.lastIndexOf('\\'));
      }

      gulp.src(changedFilePath)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['es2015'] }))
        .on('error', console.error.bind(console))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(changedFileDir));
      console.log('transpiled: ' + changedFilePath);
    });
});

// -----------------------------------------------------------------------------
// merge i18n json files
// Removes extra keys from foreignLocale
// -----------------------------------------------------------------------------
gulp.task('update-i18n', function() {
  const supportedLocales = ['ar','es','fr','de','el','iw','ja','ko',
    'nl','pt','tr','zh_CN','zh_TW'];

  // update WISE5 i18n files
  const wise5_i18n_folders = [
    './src/main/webapp/wise5/i18n/',
    './src/main/webapp/wise5/authoringTool/i18n/',
    './src/main/webapp/wise5/classroomMonitor/i18n/',
    './src/main/webapp/wise5/vle/i18n/',
    './src/main/webapp/wise5/components/animation/i18n/',
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
  let updatedAtLeasetOneI18NFile = false;
  wise5_i18n_folders.map(function(i18n_folder) {
    const english = JSON.parse(fs.readFileSync(i18n_folder + 'i18n_en.json'));
    supportedLocales.map(function(supportedLocale) {
      let result = JSON.parse(fs.readFileSync(i18n_folder + 'i18n_en.json'));
      let foreignLocale = {};
      try {
        // if the file doesn't exist, it will throw an exception
        foreignLocale = JSON.parse(fs.readFileSync(i18n_folder +
            'i18n_' + supportedLocale + '.json'));
      } catch (ex) {
        // do nothing. we'll use the default {} object
      }
      for (let key in foreignLocale) {
        if (result[key]) {
          result[key] = foreignLocale[key];
        }
      }
      // look for keys that don't exist in the foreignLocale and set value to ''
      for (let key in english) {
        if (foreignLocale[key] == null || foreignLocale[key] == '') {
          delete result[key];
        }
      }

      let jsonReplacer = null;
      let jsonSpace = 2;  // use 2 spaces
      result = JSON.stringify(result, jsonReplacer, jsonSpace);
      fs.writeFileSync(i18n_folder +
          'i18n_' + supportedLocale + '.json', result);
    });
  });
  if (updatedAtLeasetOneI18NFile) {
    console.log('I18N file(s) were updated as a result of ' +
        'running gulp update-i18n task.');
    process.exit(1);
  }
});


// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

gulp.task('default', ['watch-sass', 'transpile']);


// http://stackoverflow.com/questions/27859691/gulp-handling-multiple-themes-and-folders
// https://gist.github.com/HugoGiraudel/8b1d9948f925acaf10ef
// https://github.com/pawelgrzybek/Starter/blob/master/gulpfile.js
