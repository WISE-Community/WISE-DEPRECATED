exports.config = {
    sauceSeleniumAddress: 'localhost:4445/wd/hub',
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    //seleniumAddress: 'http://localhost:4444/wd/hub',

    specs: [
        'previewVLE.spec.js',
        'notebook.spec.js',
        'authoringTool.spec.js',
        'setUpRun.spec.js',
        'classroomMonitor.spec.js'
    ],
    multiCapabilities : [
        {
            'browserName': 'chrome',
            'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
            'build': process.env.TRAVIS_BUILD_NUMBER
        },
        {
            'browserName': 'firefox',
            'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
            'build': process.env.TRAVIS_BUILD_NUMBER
        }
    ]
};

module.exports.config = exports.config;