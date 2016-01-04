/* */ 
'use strict';
try {
  module.exports = require('utf-8-validate');
} catch (e) {
  module.exports = require('./Validation.fallback');
}
