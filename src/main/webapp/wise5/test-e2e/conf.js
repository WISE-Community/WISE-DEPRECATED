exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: [
        'previewVLE.spec.js',
        'notebook.spec.js',
        'authoringTool.spec.js'
    ]
};

// This won’t affect local tests, it will only activate when running on Travis CI:
if (process.env.TRAVIS) {
    config.sauceUser = process.env.SAUCE_USERNAME;
    config.sauceKey = process.env.SAUCE_ACCESS_KEY;
    config.capabilities = {
        'browserName': 'chrome',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'build': process.env.TRAVIS_BUILD_NUMBER
    };
}