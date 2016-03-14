exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: [
        'previewVLE.spec.js',
        'notebook.spec.js',
        'authoringTool.spec.js'
    ]
};