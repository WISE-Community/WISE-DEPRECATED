/* */ 
(function(process) {
  var fs = require('fs'),
      path = require('path'),
      join = path.join,
      dirname = path.dirname,
      exists = fs.existsSync || path.existsSync,
      defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → ',
        compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled',
        platform: process.platform,
        arch: process.arch,
        version: process.versions.node,
        bindings: 'bindings.node',
        try: [['module_root', 'build', 'bindings'], ['module_root', 'build', 'Debug', 'bindings'], ['module_root', 'build', 'Release', 'bindings'], ['module_root', 'out', 'Debug', 'bindings'], ['module_root', 'Debug', 'bindings'], ['module_root', 'out', 'Release', 'bindings'], ['module_root', 'Release', 'bindings'], ['module_root', 'build', 'default', 'bindings'], ['module_root', 'compiled', 'version', 'platform', 'arch', 'bindings']]
      };
  function bindings(opts) {
    if (typeof opts == 'string') {
      opts = {bindings: opts};
    } else if (!opts) {
      opts = {};
    }
    opts.__proto__ = defaults;
    if (!opts.module_root) {
      opts.module_root = exports.getRoot(exports.getFileName());
    }
    if (path.extname(opts.bindings) != '.node') {
      opts.bindings += '.node';
    }
    var tries = [],
        i = 0,
        l = opts.try.length,
        n,
        b,
        err;
    for (; i < l; i++) {
      n = join.apply(null, opts.try[i].map(function(p) {
        return opts[p] || p;
      }));
      tries.push(n);
      try {
        b = opts.path ? require.resolve(n) : require(n);
        if (!opts.path) {
          b.path = n;
        }
        return b;
      } catch (e) {
        if (!/not find/i.test(e.message)) {
          throw e;
        }
      }
    }
    err = new Error('Could not locate the bindings file. Tried:\n' + tries.map(function(a) {
      return opts.arrow + a;
    }).join('\n'));
    err.tries = tries;
    throw err;
  }
  module.exports = exports = bindings;
  exports.getFileName = function getFileName(calling_file) {
    var origPST = Error.prepareStackTrace,
        origSTL = Error.stackTraceLimit,
        dummy = {},
        fileName;
    Error.stackTraceLimit = 10;
    Error.prepareStackTrace = function(e, st) {
      for (var i = 0,
          l = st.length; i < l; i++) {
        fileName = st[i].getFileName();
        if (fileName !== __filename) {
          if (calling_file) {
            if (fileName !== calling_file) {
              return;
            }
          } else {
            return;
          }
        }
      }
    };
    Error.captureStackTrace(dummy);
    dummy.stack;
    Error.prepareStackTrace = origPST;
    Error.stackTraceLimit = origSTL;
    return fileName;
  };
  exports.getRoot = function getRoot(file) {
    var dir = dirname(file),
        prev;
    while (true) {
      if (dir === '.') {
        dir = process.cwd();
      }
      if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
        return dir;
      }
      if (prev === dir) {
        throw new Error('Could not find module root given file: "' + file + '". Do you have a `package.json` file? ');
      }
      prev = dir;
      dir = join(dir, '..');
    }
  };
})(require('process'));
