exports.config = {
    sauceSeleniumAddress: 'localhost:4445/wd/hub',
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    //seleniumAddress: 'http://localhost:4444/wd/hub',
    suites: {
      authoringTool: [
        'authoringTool/info/info.spec.js',
        'authoringTool/node/node.spec.js',
        'authoringTool/notebook/notebook.spec.js',
        'authoringTool/project/project.spec.js',
        'authoringTool/projectList/projectList.spec.js'
      ],
      classroomMonitor: [
        //'classroomMonitor/classroomMonitor.spec.js'
      ],
      components: [
        'components/multipleChoice/multipleChoiceCheckbox.spec.js',
        'components/multipleChoice/multipleChoiceRadio.spec.js',
        'components/openResponse/openResponse.spec.js'
      ],
      portal: [
        //'portal/forgotAccount.spec.js',
        //'portal/portal.spec.js',
        //'portal/setUpRun.spec.js'
      ],
      vle: [
        //'notebook/notebook.spec.js',
        'vle/previewProject.spec.js'
      ]
    },
    multiCapabilities: [
        {
            'browserName': 'chrome',
            'username': process.env.SAUCE_USERNAME,
            'accessKey': process.env.SAUCE_ACCESS_KEY, 
            'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
            'build': process.env.TRAVIS_BUILD_NUMBER
        }
        /*,
        {
            'browserName': 'firefox',
            'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
            'build': process.env.TRAVIS_BUILD_NUMBER
        }
        */
    ],
    onPrepare: function() {
      let SpecReporter = require('jasmine-spec-reporter').SpecReporter;
      jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: 'all'}));

      global.isAngularSite = function(flag) {
        browser.ignoreSynchronization = !flag;
      }
    },
    params: {
      login: {
        user: 'preview',
        password: 'wise'
      },
      authoringProjectId: 1
    }
};

module.exports.config = exports.config;
