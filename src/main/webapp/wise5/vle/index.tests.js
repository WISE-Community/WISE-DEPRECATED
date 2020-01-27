import 'angular';
import 'angular-mocks';

// require all test files using special Webpack feature
// https://webpack.github.io/docs/context.html#require-context
const testsContext = require.context('..', true, /test-unit\/(.*).spec.js$/);
testsContext.keys().forEach(testsContext);
