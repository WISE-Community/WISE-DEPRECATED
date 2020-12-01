/* eslint-disable */

'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

const gulp = require('gulp');
const babel = require('gulp-babel');
const exec = require('child_process').exec;
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const fs = require('fs');
const gulpif = require('gulp-if');
const merge = require('gulp-merge-json');
const newer = require('gulp-newer');
const postcss = require('gulp-postcss');
const print = require('gulp-print').default;
const sass = require('gulp-sass');
const rename = require("gulp-rename");
const replace = require('gulp-replace');
//const rtlscss = require('rtlcss');

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const sassOptions = { style: 'compact' };
const paths = ['./src/main/webapp/wise5/style/**/*.scss',
  './src/main/webapp/wise5/themes/*/style/**/*.scss'];
const sitePaths = ['./src/main/webapp/site/src/**/*.ts',
  './src/main/webapp/site/src/**/*.html'
];

// -----------------------------------------------------------------------------
// Sass compilation
// -----------------------------------------------------------------------------
gulp.task('compile-sass', gulp.series(function() {
  return gulp
    .src(paths, {base: './'})
    .pipe(gulpif(global.isWatching,
      newer({dest: './', ext: '.css', extra: paths })))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss([ autoprefixer(),
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
}));

// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------
gulp.task('set-watch', gulp.series(function(done) {
  global.isWatching = true;
  done();
}));

gulp.task('watch-sass', gulp.series('set-watch', function(done) {
  done();
  return gulp
  // Watch folders for *.scss changes in the specified paths,
  // and run `compile-sass` task on change
    .watch(paths, gulp.series('compile-sass'))
    .on('change', function(path, stat) {
      console.log('File ' + path + ' was changed');
    });
}));

gulp.task('site-i18n', (cb) => {
  console.log('[ng xi18n] Generating messages start...');
  exec('ng xi18n', (err, stdout, stderr) => {
    console.log('[ng xi18n] Generating messages complete!');
    console.log('[npm run ngx-extractor] Generating messages start...');
    exec('npm run ngx-extractor', (err, stdout, stderr) => {
      console.log('[npm run ngx-extractor] Generating messages complete!');
      cb(err);
    });
    cb(err);
  });
});

// -----------------------------------------------------------------------------
// merge i18n json files
// Removes extra keys from foreignLocale
// -----------------------------------------------------------------------------
gulp.task('update-i18n', gulp.series(function() {
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
      let foreignLocaleStringBefore;
      let foreignLocale = {};
      try {
        // if the file doesn't exist, it will throw an exception
        foreignLocale = JSON.parse(fs.readFileSync(i18n_folder +
          'i18n_' + supportedLocale + '.json'));
        foreignLocaleStringBefore = fs.readFileSync(i18n_folder +
          'i18n_' + supportedLocale + '.json');
      } catch (ex) {
        // do nothing. we'll use the default {} object
        updatedAtLeasetOneI18NFile = true;
      }
      for (let key in foreignLocale) {
        if (result[key]) {
          result[key] = foreignLocale[key];
        }
      }
      // look for keys that don't exist in the foreignLocale
      // remove it from the result
      for (let key in english) {
        if (foreignLocale[key] == null || foreignLocale[key] == '') {
          delete result[key];
        }
      }

      let jsonReplacer = null;
      let jsonSpace = 2;  // use 2 spaces
      let foreignLocaleStringAfter = JSON.stringify(result, jsonReplacer, jsonSpace);
      if (foreignLocaleStringAfter != foreignLocaleStringBefore) {
        fs.writeFileSync(i18n_folder + 'i18n_' + supportedLocale + '.json', foreignLocaleStringAfter);
        updatedAtLeasetOneI18NFile = true;
      }
    });
  });
  if (updatedAtLeasetOneI18NFile) {
    console.log('I18N file(s) were updated as a result of ' +
      'running gulp update-i18n task.');
    process.exit(1);
  }
  done();
}));

gulp.task('rename-styles-bundle', (done) => {
  const statsJSON = JSON.parse(fs.readFileSync('./src/main/webapp/site/dist/stats.json'));
  const siteStylesPath = statsJSON.assetsByChunkName.siteStyles[0];
  gulp.src('./src/main/webapp/site/dist/*.js')
    .pipe(replace('siteStyles.css', siteStylesPath))
    .pipe(gulp.dest('./src/main/webapp/site/dist'));
  done();
});


// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

gulp.task('default', gulp.series('watch-sass'));


// http://stackoverflow.com/questions/27859691/gulp-handling-multiple-themes-and-folders
// https://gist.github.com/HugoGiraudel/8b1d9948f925acaf10ef
// https://github.com/pawelgrzybek/Starter/blob/master/gulpfile.js
