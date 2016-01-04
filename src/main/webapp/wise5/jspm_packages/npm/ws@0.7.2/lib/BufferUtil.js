/* */ 
(function(Buffer) {
  'use strict';
  try {
    module.exports = require('bufferutil');
  } catch (e) {
    module.exports = require('./BufferUtil.fallback');
  }
})(require('buffer').Buffer);
