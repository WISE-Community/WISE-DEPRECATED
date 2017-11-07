module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    autoWatch: true,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jspm', 'jasmine'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // list of files / patterns to load in the browser
    files: [
      {pattern: '!(lib|jspm_packages)/**/*.js', served: true, included: false, noncache: false, watched: true  },
      {pattern: '**/**', served: true, included: false, noncache: false, watched: false  }
    ],


    jspm: {
        config: 'config.js',
        beforeFiles: ['../../../../node_modules/babel-polyfill/dist/polyfill.js'],
        loadFiles: [
          'test-unit/sampleData/curriculum/SelfPropelledVehiclesChallenge/project.json',
          'test-unit/sampleData/curriculum/DemoProject/project.json',
          'test-unit/sampleData/config/config1.json',
          'test-unit/sampleData/config/config2.json',
          'test-unit/**/*.spec.js'
        ],
        serveFiles: [
        ]
    },

    proxies: {
      '/wise5': '/base'
    },

    // list of files to exclude
    exclude: [
      '**/*.es6',
      '**/*.js.map'
    ],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test-unit/sampleData/**/*.json': ['json_fixtures']
    },

    'babelPreprocessor': {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
        //modules: 'system'
      }
    },

    jsonFixturesPreprocessor: {
      // strip this from the file path \ fixture name
      //stripPrefix: 'test/fixtures',
      // strip this to the file path \ fixture name
      //prependPrefix: 'mock/',
      // change the global fixtures variable name
      variableName: 'mocks',
      // camelize fixture filenames (e.g 'fixtures/aa-bb_cc.json' becames __fixtures__['fixtures/aaBbCc'])
      //camelizeFilenames: false,
      // transform the filename
      transformPath: function(path) {
        return path + '.js';
      }
    }
  });
};
