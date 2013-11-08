/*  Prototype JavaScript framework, version 1.6.0.3
 *  (c) 2005-2008 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {
  Version: '1.6.0.3',

  Browser: {
    IE:     !!(window.attachEvent &&
      navigator.userAgent.indexOf('Opera') === -1),
    Opera:  navigator.userAgent.indexOf('Opera') > -1,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 &&
      navigator.userAgent.indexOf('KHTML') === -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions:
      document.createElement('div')['__proto__'] &&
      document.createElement('div')['__proto__'] !==
        document.createElement('form')['__proto__']
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


/* Based on Alex Arnell's inheritance implementation. */
var Class = {
  create: function() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;

    return klass;
  }
};

Class.Methods = {
  addMethods: function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length)
      properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments) };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }
};

var Abstract = { };

Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Object, {
  inspect: function(object) {
    try {
      if (Object.isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },

  toJSON: function(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (Object.isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = Object.toJSON(object[property]);
      if (!Object.isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  },

  toQueryString: function(object) {
    return $H(object).toQueryString();
  },

  toHTML: function(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  },

  keys: function(object) {
    var keys = [];
    for (var property in object)
      keys.push(property);
    return keys;
  },

  values: function(object) {
    var values = [];
    for (var property in object)
      values.push(object[property]);
    return values;
  },

  clone: function(object) {
    return Object.extend({ }, object);
  },

  isElement: function(object) {
    return !!(object && object.nodeType == 1);
  },

  isArray: function(object) {
    return object != null && typeof object == "object" &&
      'splice' in object && 'join' in object;
  },

  isHash: function(object) {
    return object instanceof Hash;
  },

  isFunction: function(object) {
    return typeof object == "function";
  },

  isString: function(object) {
    return typeof object == "string";
  },

  isNumber: function(object) {
    return typeof object == "number";
  },

  isUndefined: function(object) {
    return typeof object == "undefined";
  }
});

Object.extend(Function.prototype, {
  argumentNames: function() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  },

  bind: function() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
      return __method.apply(object, args.concat($A(arguments)));
    }
  },

  bindAsEventListener: function() {
    var __method = this, args = $A(arguments), object = args.shift();
    return function(event) {
      return __method.apply(object, [event || window.event].concat(args));
    }
  },

  curry: function() {
    if (!arguments.length) return this;
    var __method = this, args = $A(arguments);
    return function() {
      return __method.apply(this, args.concat($A(arguments)));
    }
  },

  delay: function() {
    var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  },

  defer: function() {
    var args = [0.01].concat($A(arguments));
    return this.delay.apply(this, args);
  },

  wrap: function(wrapper) {
    var __method = this;
    return function() {
      return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
    }
  },

  methodize: function() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      return __method.apply(null, [this].concat($A(arguments)));
    };
  }
});

Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, {
  gsub: function(pattern, replacement) {
    var result = '', source = this, match;
    replacement = arguments.callee.prepareReplacement(replacement);

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  },

  sub: function(pattern, replacement, count) {
    replacement = this.gsub.prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  },

  scan: function(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  },

  truncate: function(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  },

  strip: function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  },

  stripTags: function() {
    return this.replace(/<\/?[^>]+>/gi, '');
  },

  stripScripts: function() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  },

  extractScripts: function() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  },

  evalScripts: function() {
    return this.extractScripts().map(function(script) { return eval(script) });
  },

  escapeHTML: function() {
    var self = arguments.callee;
    self.text.data = this;
    return self.div.innerHTML;
  },

  unescapeHTML: function() {
    var div = new Element('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ?
      $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
      div.childNodes[0].nodeValue) : '';
  },

  toQueryParams: function(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  },

  toArray: function() {
    return this.split('');
  },

  succ: function() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  },

  times: function(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  },

  camelize: function() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  },

  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  underscore: function() {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
  },

  dasherize: function() {
    return this.gsub(/_/,'-');
  },

  inspect: function(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  },

  toJSON: function() {
    return this.inspect(true);
  },

  unfilterJSON: function(filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
  },

  isJSON: function() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  },

  evalJSON: function(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  },

  include: function(pattern) {
    return this.indexOf(pattern) > -1;
  },

  startsWith: function(pattern) {
    return this.indexOf(pattern) === 0;
  },

  endsWith: function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  },

  empty: function() {
    return this == '';
  },

  blank: function() {
    return /^\s*$/.test(this);
  },

  interpolate: function(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }
});

if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {
  escapeHTML: function() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  unescapeHTML: function() {
    return this.stripTags().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
  if (Object.isFunction(replacement)) return replacement;
  var template = new Template(replacement);
  return function(match) { return template.evaluate(match) };
};

String.prototype.parseQuery = String.prototype.toQueryParams;

Object.extend(String.prototype.escapeHTML, {
  div:  document.createElement('div'),
  text: document.createTextNode('')
});

String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return '';

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = {
  each: function(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  },

  eachSlice: function(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  },

  all: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  },

  any: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  },

  collect: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  },

  detect: function(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  },

  findAll: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  grep: function(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(filter);

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  },

  include: function(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  },

  inGroupsOf: function(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  },

  inject: function(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  },

  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  },

  max: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  },

  min: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  },

  partition: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  },

  pluck: function(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  },

  reject: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  sortBy: function(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

  toArray: function() {
    return this.map();
  },

  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  },

  size: function() {
    return this.toArray().length;
  },

  inspect: function() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
};

Object.extend(Enumerable, {
  map:     Enumerable.collect,
  find:    Enumerable.detect,
  select:  Enumerable.findAll,
  filter:  Enumerable.findAll,
  member:  Enumerable.include,
  entries: Enumerable.toArray,
  every:   Enumerable.all,
  some:    Enumerable.any
});
function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

if (Prototype.Browser.WebKit) {
  $A = function(iterable) {
    if (!iterable) return [];
    if (!(typeof iterable === 'function' && typeof iterable.length ===
        'number' && typeof iterable.item === 'function') && iterable.toArray)
      return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  };
}

Array.from = $A;

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse) Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  },

  clear: function() {
    this.length = 0;
    return this;
  },

  first: function() {
    return this[0];
  },

  last: function() {
    return this[this.length - 1];
  },

  compact: function() {
    return this.select(function(value) {
      return value != null;
    });
  },

  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(Object.isArray(value) ?
        value.flatten() : [value]);
    });
  },

  without: function() {
    var values = $A(arguments);
    return this.select(function(value) {
      return !values.include(value);
    });
  },

  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

  reduce: function() {
    return this.length > 1 ? this : this[0];
  },

  uniq: function(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  },

  intersect: function(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  },

  clone: function() {
    return [].concat(this);
  },

  size: function() {
    return this.length;
  },

  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  },

  toJSON: function() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }
});

if (Object.isFunction(Array.prototype.forEach))
  Array.prototype._each = Array.prototype.forEach;

if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item, i) {
  i || (i = 0);
  var length = this.length;
  if (i < 0) i = length + i;
  for (; i < length; i++)
    if (this[i] === item) return i;
  return -1;
};

if (!Array.prototype.lastIndexOf) Array.prototype.lastIndexOf = function(item, i) {
  i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
  var n = this.slice(0, i).reverse().indexOf(item);
  return (n < 0) ? n : i - n - 1;
};

Array.prototype.toArray = Array.prototype.clone;

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

if (Prototype.Browser.Opera){
  Array.prototype.concat = function() {
    var array = [];
    for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);
    for (var i = 0, length = arguments.length; i < length; i++) {
      if (Object.isArray(arguments[i])) {
        for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
          array.push(arguments[i][j]);
      } else {
        array.push(arguments[i]);
      }
    }
    return array;
  };
}
Object.extend(Number.prototype, {
  toColorPart: function() {
    return this.toPaddedString(2, 16);
  },

  succ: function() {
    return this + 1;
  },

  times: function(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  },

  toPaddedString: function(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  },

  toJSON: function() {
    return isFinite(this) ? this.toString() : 'null';
  }
});

$w('abs round ceil floor').each(function(method){
  Number.prototype[method] = Math[method].methodize();
});
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  return {
    initialize: function(object) {
      this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
    },

    _each: function(iterator) {
      for (var key in this._object) {
        var value = this._object[key], pair = [key, value];
        pair.key = key;
        pair.value = value;
        iterator(pair);
      }
    },

    set: function(key, value) {
      return this._object[key] = value;
    },

    get: function(key) {
      if (this._object[key] !== Object.prototype[key])
        return this._object[key];
    },

    unset: function(key) {
      var value = this._object[key];
      delete this._object[key];
      return value;
    },

    toObject: function() {
      return Object.clone(this._object);
    },

    keys: function() {
      return this.pluck('key');
    },

    values: function() {
      return this.pluck('value');
    },

    index: function(value) {
      var match = this.detect(function(pair) {
        return pair.value === value;
      });
      return match && match.key;
    },

    merge: function(object) {
      return this.clone().update(object);
    },

    update: function(object) {
      return new Hash(object).inject(this, function(result, pair) {
        result.set(pair.key, pair.value);
        return result;
      });
    },

    toQueryString: function() {
      return this.inject([], function(results, pair) {
        var key = encodeURIComponent(pair.key), values = pair.value;

        if (values && typeof values == 'object') {
          if (Object.isArray(values))
            return results.concat(values.map(toQueryPair.curry(key)));
        } else results.push(toQueryPair(key, values));
        return results;
      }).join('&');
    },

    inspect: function() {
      return '#<Hash:{' + this.map(function(pair) {
        return pair.map(Object.inspect).join(': ');
      }).join(', ') + '}>';
    },

    toJSON: function() {
      return Object.toJSON(this.toObject());
    },

    clone: function() {
      return new Hash(this);
    }
  }
})());

Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
Hash.from = $H;
var ObjectRange = Class.create(Enumerable, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  },

  include: function(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
});

var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
};

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});

Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});

Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,
  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}

(function() {
  var element = this.Element;
  this.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (Prototype.Browser.IE && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(this.Element, element || { });
  if (element) this.Element.prototype = element.prototype;
}).call(window);

Element.cache = { };

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);
    content = Object.toHTML(content);
    element.innerHTML = content.stripScripts();
    content.evalScripts.bind(content).defer();
    return element;
  },

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },

  descendants: function(element) {
    return $(element).select("*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },

  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    return Object.isNumber(expression) ? element.descendants()[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },

  select: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },

  adjacent: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = element.readAttribute('id'), self = arguments.callee;
    if (id) return id;
    do { id = 'anonymous_element_' + self.counter++ } while ($(id));
    element.writeAttribute('id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return $(element).getDimensions().height;
  },

  getWidth: function(element) {
    return $(element).getDimensions().width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!element.hasClassName(className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return element[element.hasClassName(className) ?
      'removeClassName' : 'addClassName'](className);
  },

  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = element.getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'absolute') return element;

    var offsets = element.positionedOffset();
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'relative') return element;

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    source = $(source);
    var p = source.viewportOffset();

    element = $(element);
    var delta = [0, 0];
    var parent = null;
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = element.getOffsetParent();
      delta = parent.viewportOffset();
    }

    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Element.Methods.identify.counter = 1;

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,
  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          if (!Element.visible(element)) return null;

          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);
      try { element.offsetParent }
      catch(e) { return $(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = {
    read: {
      names: {
        'class': 'className',
        'for':   'htmlFor'
      },
      values: {
        _getAttr: function(element, attribute) {
          return element.getAttribute(attribute, 2);
        },
        _getAttrNode: function(element, attribute) {
          var node = element.getAttributeNode(attribute);
          return node ? node.value : "";
        },
        _getEv: function(element, attribute) {
          attribute = element.getAttribute(attribute);
          return attribute ? attribute.toString().slice(23, -2) : null;
        },
        _flag: function(element, attribute) {
          return $(element).hasAttribute(attribute) ? attribute : null;
        },
        style: function(element) {
          return element.style.cssText.toLowerCase();
        },
        title: function(element) {
          return element.title;
        }
      }
    }
  };

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr,
      src:         v._getAttr,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };

  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {
  Element.Methods.update = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);

    content = Object.toHTML(content);
    var tagName = element.tagName.toUpperCase();

    if (tagName in Element._insertionTranslations.tags) {
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      Element._getContentFromAnonymousElement(tagName, content.stripScripts())
        .each(function(node) { element.appendChild(node) });
    }
    else element.innerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

if ('outerHTML' in document.createElement('div')) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  Object.extend(this.tags, {
    THEAD: this.tags.TBODY,
    TFOOT: this.tags.TBODY,
    TH:    this.tags.TD
  });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

if (!Prototype.BrowserFeatures.ElementExtensions &&
    document.createElement('div')['__proto__']) {
  window.HTMLElement = { };
  window.HTMLElement.prototype = document.createElement('div')['__proto__'];
  Prototype.BrowserFeatures.ElementExtensions = true;
}

Element.extend = (function() {
  if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
      tagName = element.tagName.toUpperCase(), property, value;

    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    for (property in methods) {
      value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    window[klass] = { };
    window[klass].prototype = document.createElement(tagName)['__proto__'];
    return window[klass];
  }

  if (F.ElementExtensions) {
    copy(Element.Methods, HTMLElement.prototype);
    copy(Element.Methods.Simulated, HTMLElement.prototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};

document.viewport = {
  getDimensions: function() {
    var dimensions = { }, B = Prototype.Browser;
    $w('width height').each(function(d) {
      var D = d.capitalize();
      if (B.WebKit && !document.evaluate) {
        dimensions[d] = self['inner' + D];
      } else if (B.Opera && parseFloat(window.opera.version()) < 9.5) {
        dimensions[d] = document.body['client' + D]
      } else {
        dimensions[d] = document.documentElement['client' + D];
      }
    });
    return dimensions;
  },

  getWidth: function() {
    return this.getDimensions().width;
  },

  getHeight: function() {
    return this.getDimensions().height;
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
  }
};
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();

    if (this.shouldUseSelectorsAPI()) {
      this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
      this.mode = 'xpath';
      this.compileXPathMatcher();
    } else {
      this.mode = "normal";
      this.compileMatcher();
    }

  },

  shouldUseXPath: function() {
    if (!Prototype.BrowserFeatures.XPath) return false;

    var e = this.expression;

    if (Prototype.Browser.WebKit &&
     (e.include("-of-type") || e.include(":empty")))
      return false;

    if ((/(\[[\w-]*?:|:checked)/).test(e))
      return false;

    return true;
  },

  shouldUseSelectorsAPI: function() {
    if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

    if (!Selector._div) Selector._div = new Element('div');

    try {
      Selector._div.querySelector(this.expression);
    } catch(e) {
      return false;
    }

    return true;
  },

  compileMatcher: function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[i]) ? c[i](m) :
            new Template(c[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        if (m = e.match(ps[i])) {
          this.matcher.push(Object.isFunction(x[i]) ? x[i](m) :
            new Template(x[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    var e = this.expression, results;

    switch (this.mode) {
      case 'selectorsAPI':
        if (root !== document) {
          var oldId = root.id, id = $(root).identify();
          e = "#" + id + " " + e;
        }

        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;

        return results;
      case 'xpath':
        return document._getElementsByXPath(this.xpath, root);
      default:
       return this.matcher(root);
    }
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          if (as[i]) {
            this.tokens.push([i, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {
            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0)]",
      'checked':     "[@checked]",
      'disabled':    "[(@disabled) and (@type!='hidden')]",
      'enabled':     "[not(@disabled) and (@type!='hidden')]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i in p) {
            if (m = e.match(p[i])) {
              v = Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: {
    laterSibling: /^\s*~\s*/,
    child:        /^\s*>\s*/,
    adjacent:     /^\s*\+\s*/,
    descendant:   /^\s/,

    tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,
    id:           /^#([\w\-\*]+)(\b|$)/,
    className:    /^\.([\w\-\*]+)(\b|$)/,
    pseudo:
/^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/,
    attrPresence: /^\[((?:[\w]+:)?[\w]+)\]/,
    attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
  },

  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = undefined;
      return nodes;
    },

    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },

    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (!(n = nodes[i])._countedByPrototype) {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;
      if (!targetNode) return [];
      if (!nodes && root == document) return [targetNode];
      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (node.tagName == '!' || node.firstChild) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
          results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
    '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
    '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
    '$=': function(nv, v) { return nv.endsWith(v); },
    '*=': function(nv, v) { return nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
     '-').include('-' + (v || "").toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    },

    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node.removeAttribute('_countedByPrototype');
      return nodes;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}
var Form = {
  reset: function(form) {
    $(form).reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    return $A($(form).getElementsByTagName('*')).inject([],
      function(elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
          elements.push(Element.extend(child));
        return elements;
      }
    );
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/

Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {
  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !['button', 'reset', 'submit'].include(element.type)))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
if (!window.Event) var Event = { };

Object.extend(Event, {
  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,

  cache: { },

  relatedTarget: function(event) {
    var element;
    switch(event.type) {
      case 'mouseover': element = event.fromElement; break;
      case 'mouseout':  element = event.toElement;   break;
      default: return null;
    }
    return Element.extend(element);
  }
});

Event.Methods = (function() {
  var isButton;

  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    isButton = function(event, code) {
      return event.button == buttonMap[code];
    };

  } else if (Prototype.Browser.WebKit) {
    isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };

  } else {
    isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  return {
    isLeftClick:   function(event) { return isButton(event, 0) },
    isMiddleClick: function(event) { return isButton(event, 1) },
    isRightClick:  function(event) { return isButton(event, 2) },

    element: function(event) {
      event = Event.extend(event);

      var node          = event.target,
          type          = event.type,
          currentTarget = event.currentTarget;

      if (currentTarget && currentTarget.tagName) {
        if (type === 'load' || type === 'error' ||
          (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
            && currentTarget.type === 'radio'))
              node = currentTarget;
      }
      if (node.nodeType == Node.TEXT_NODE) node = node.parentNode;
      return Element.extend(node);
    },

    findElement: function(event, expression) {
      var element = Event.element(event);
      if (!expression) return element;
      var elements = [element].concat(element.ancestors());
      return Selector.findElement(elements, expression, 0);
    },

    pointer: function(event) {
      var docElement = document.documentElement,
      body = document.body || { scrollLeft: 0, scrollTop: 0 };
      return {
        x: event.pageX || (event.clientX +
          (docElement.scrollLeft || body.scrollLeft) -
          (docElement.clientLeft || 0)),
        y: event.pageY || (event.clientY +
          (docElement.scrollTop || body.scrollTop) -
          (docElement.clientTop || 0))
      };
    },

    pointerX: function(event) { return Event.pointer(event).x },
    pointerY: function(event) { return Event.pointer(event).y },

    stop: function(event) {
      Event.extend(event);
      event.preventDefault();
      event.stopPropagation();
      event.stopped = true;
    }
  };
})();

Event.extend = (function() {
  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE) {
    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return "[object Event]" }
    });

    return function(event) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);
      Object.extend(event, {
        target: event.srcElement,
        relatedTarget: Event.relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });
      return Object.extend(event, methods);
    };

  } else {
    Event.prototype = Event.prototype || document.createEvent("HTMLEvents")['__proto__'];
    Object.extend(Event.prototype, methods);
    return Prototype.K;
  }
})();

Object.extend(Event, (function() {
  var cache = Event.cache;

  function getEventID(element) {
    if (element._prototypeEventID) return element._prototypeEventID[0];
    arguments.callee.id = arguments.callee.id || 1;
    return element._prototypeEventID = [++arguments.callee.id];
  }

  function getDOMEventName(eventName) {
    if (eventName && eventName.include(':')) return "dataavailable";
    return eventName;
  }

  function getCacheForID(id) {
    return cache[id] = cache[id] || { };
  }

  function getWrappersForEventName(id, eventName) {
    var c = getCacheForID(id);
    return c[eventName] = c[eventName] || [];
  }

  function createWrapper(element, eventName, handler) {
    var id = getEventID(element);
    var c = getWrappersForEventName(id, eventName);
    if (c.pluck("handler").include(handler)) return false;

    var wrapper = function(event) {
      if (!Event || !Event.extend ||
        (event.eventName && event.eventName != eventName))
          return false;

      Event.extend(event);
      handler.call(element, event);
    };

    wrapper.handler = handler;
    c.push(wrapper);
    return wrapper;
  }

  function findWrapper(id, eventName, handler) {
    var c = getWrappersForEventName(id, eventName);
    return c.find(function(wrapper) { return wrapper.handler == handler });
  }

  function destroyWrapper(id, eventName, handler) {
    var c = getCacheForID(id);
    if (!c[eventName]) return false;
    c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
  }

  function destroyCache() {
    for (var id in cache)
      for (var eventName in cache[id])
        cache[id][eventName] = null;
  }


  if (window.attachEvent) {
    window.attachEvent("onunload", destroyCache);
  }

  if (Prototype.Browser.WebKit) {
    window.addEventListener('unload', Prototype.emptyFunction, false);
  }

  return {
    observe: function(element, eventName, handler) {
      element = $(element);
      var name = getDOMEventName(eventName);

      var wrapper = createWrapper(element, eventName, handler);
      if (!wrapper) return element;

      if (element.addEventListener) {
        element.addEventListener(name, wrapper, false);
      } else {
        element.attachEvent("on" + name, wrapper);
      }

      return element;
    },

    stopObserving: function(element, eventName, handler) {
      element = $(element);
      var id = getEventID(element), name = getDOMEventName(eventName);

      if (!handler && eventName) {
        getWrappersForEventName(id, eventName).each(function(wrapper) {
          element.stopObserving(eventName, wrapper.handler);
        });
        return element;

      } else if (!eventName) {
        Object.keys(getCacheForID(id)).each(function(eventName) {
          element.stopObserving(eventName);
        });
        return element;
      }

      var wrapper = findWrapper(id, eventName, handler);
      if (!wrapper) return element;

      if (element.removeEventListener) {
        element.removeEventListener(name, wrapper, false);
      } else {
        element.detachEvent("on" + name, wrapper);
      }

      destroyWrapper(id, eventName, handler);

      return element;
    },

    fire: function(element, eventName, memo) {
      element = $(element);
      if (element == document && document.createEvent && !element.dispatchEvent)
        element = document.documentElement;

      var event;
      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent("dataavailable", true, true);
      } else {
        event = document.createEventObject();
        event.eventType = "ondataavailable";
      }

      event.eventName = eventName;
      event.memo = memo || { };

      if (document.createEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent(event.eventType, event);
      }

      return Event.extend(event);
    }
  };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
  fire:          Event.fire,
  observe:       Event.observe,
  stopObserving: Event.stopObserving
});

Object.extend(document, {
  fire:          Element.Methods.fire.methodize(),
  observe:       Element.Methods.observe.methodize(),
  stopObserving: Element.Methods.stopObserving.methodize(),
  loaded:        false
});

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards and John Resig. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearInterval(timer);
    document.fire("dom:loaded");
    document.loaded = true;
  }

  if (document.addEventListener) {
    if (Prototype.Browser.WebKit) {
      timer = window.setInterval(function() {
        if (/loaded|complete/.test(document.readyState))
          fireContentLoadedEvent();
      }, 0);

      Event.observe(window, "load", fireContentLoadedEvent);

    } else {
      document.addEventListener("DOMContentLoaded",
        fireContentLoadedEvent, false);
    }

  } else {
    document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
    $("__onDOMContentLoaded").onreadystatechange = function() {
      if (this.readyState == "complete") {
        this.onreadystatechange = null;
        fireContentLoadedEvent();
      }
    };
  }
})();
/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
  includeScrollOffsets: false,

  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },


  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

Element.addMethods();
/*
 * Raphael 1.2.2 - JavaScript Vector Library
 *
 * Copyright (c) 2008 - 2009 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
window.Raphael=(function(){var a=/[, ]+/,D=document,aj=window,k={was:"Raphael" in aj,is:aj.Raphael},af=function(){if(af.is(arguments[0],"array")){var e=arguments[0],E=s[aI](af,e.splice(0,3+af.is(e[0],ad))),aM=E.set();for(var S=0,aN=e[l];S<aN;S++){var R=e[S]||{};({circle:1,rect:1,path:1,ellipse:1,text:1,image:1})[J](R.type)&&aM[d](E[R.type]().attr(R));}return aM;}return s[aI](af,arguments);},az="appendChild",aI="apply",aF="concat",ai="",y=["click","dblclick","mousedown","mousemove","mouseout","mouseover","mouseup"],J="hasOwnProperty",ab=/^\[object\s+|\]$/gi,an="join",l="length",aK="prototype",aL=String[aK].toLowerCase,f=Math.max,aw=Math.min,ad="number",ao="toString",al=Object[aK][ao],aD={},aA=Math.pow,d="push",aG=/^(?=[\da-f]$)/,c=/^url\(['"]?([^\)]+)['"]?\)$/i,H=Math.round,ae=" ",r="setAttribute",u="split",N=parseFloat,z=parseInt,aB=String[aK].toUpperCase,h={"clip-rect":"0 0 10e9 10e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:'10px "Arial"',"font-family":'"Arial"',"font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/",opacity:1,path:"M0,0",r:0,rotation:0,rx:0,ry:0,scale:"1 1",src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt","stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",translation:"0 0",width:0,x:0,y:0},Q={"clip-rect":"csv",cx:ad,cy:ad,fill:"colour","fill-opacity":ad,"font-size":ad,height:ad,opacity:ad,path:"path",r:ad,rotation:"csv",rx:ad,ry:ad,scale:"csv",stroke:"colour","stroke-opacity":ad,"stroke-width":ad,translation:"csv",width:ad,x:ad,y:ad},aC="replace";af.version="1.2.2";af.type=(aj.SVGAngle||D.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?"SVG":"VML");af.svg=!(af.vml=af.type=="VML");af._id=0;af._oid=0;af.fn={};af.is=function(i,e){e=aL.call(e);return((e=="object"||e=="undefined")&&typeof i==e)||(i==null&&e=="null")||aL.call(al.call(i)[aC](ab,ai))==e;};af.setWindow=function(e){aj=e;D=aj.document;};var aq=function(E){if(af.vml){var e=/^\s+|\s+$/g;aq=aa(function(aM){var aN;aM=(aM+ai).replace(e,ai);try{var i=new ActiveXObject("htmlfile");i.write("<body>");i.close();aN=i.body;}catch(aP){aN=createPopup().document.body;}var S=aN.createTextRange();try{aN.style.color=aM;var aO=S.queryCommandValue("ForeColor");aO=((aO&255)<<16)|(aO&65280)|((aO&16711680)>>>16);return"#"+("000000"+aO[ao](16)).slice(-6);}catch(aP){return"none";}});}else{var R=D.createElement("i");R.className="Rapha\xebl Colour Picker";R.style.cssText="display:none";D.body[az](R);aq=aa(function(i){R.style.color=i;return D.defaultView.getComputedStyle(R,ai).getPropertyValue("color");});}return aq(E);};af.hsb2rgb=aa(function(aQ,aO,aU){if(af.is(aQ,"object")&&"h" in aQ&&"s" in aQ&&"b" in aQ){aU=aQ.b;aO=aQ.s;aQ=aQ.h;}var S,aM,aV;if(aU==0){return{r:0,g:0,b:0,hex:"#000"};}if(aQ>1||aO>1||aU>1){aQ/=255;aO/=255;aU/=255;}var aN=~~(aQ*6),aR=(aQ*6)-aN,R=aU*(1-aO),E=aU*(1-(aO*aR)),aW=aU*(1-(aO*(1-aR)));S=[aU,E,R,R,aW,aU,aU][aN];aM=[aW,aU,aU,E,R,R,aW][aN];aV=[R,R,aW,aU,aU,E,R][aN];S*=255;aM*=255;aV*=255;var aS={r:S,g:aM,b:aV},e=(~~S)[ao](16),aP=(~~aM)[ao](16),aT=(~~aV)[ao](16);e=e[aC](aG,"0");aP=aP[aC](aG,"0");aT=aT[aC](aG,"0");aS.hex="#"+e+aP+aT;return aS;},af);af.rgb2hsb=aa(function(e,i,aO){if(af.is(e,"object")&&"r" in e&&"g" in e&&"b" in e){aO=e.b;i=e.g;e=e.r;}if(af.is(e,"string")){var aQ=af.getRGB(e);e=aQ.r;i=aQ.g;aO=aQ.b;}if(e>1||i>1||aO>1){e/=255;i/=255;aO/=255;}var aN=f(e,i,aO),E=aw(e,i,aO),S,R,aM=aN;if(E==aN){return{h:0,s:0,b:aN};}else{var aP=(aN-E);R=aP/aN;if(e==aN){S=(i-aO)/aP;}else{if(i==aN){S=2+((aO-e)/aP);}else{S=4+((e-i)/aP);}}S/=6;S<0&&S++;S>1&&S--;}return{h:S,s:R,b:aM};},af);var ar=/,?([achlmqrstvxz]),?/gi;af._path2string=function(){return this.join(",")[aC](ar,"$1");};function aa(R,i,e){function E(){var S=Array[aK].slice.call(arguments,0),aN=S[an]("\u25ba"),aM=E.cache=E.cache||{},aO=E.count=E.count||[];if(aM[J](aN)){return e?e(aM[aN]):aM[aN];}aO[l]>=1000&&delete aM[aO.shift()];aO[d](aN);aM[aN]=R[aI](i,S);return e?e(aM[aN]):aM[aN];}return E;}af.getRGB=aa(function(e){if(!e||!!((e+ai).indexOf("-")+1)){return{r:-1,g:-1,b:-1,hex:"none",error:1};}e=e+ai;if(e=="none"){return{r:-1,g:-1,b:-1,hex:"none"};}!({hs:1,rg:1})[J](e.substring(0,2))&&(e=aq(e));var aM,E,R,aP,aN=e.match(/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgb\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|rgb\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\)|hs[bl]\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|hs[bl]\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\))\s*$/i);if(aN){if(aN[2]){aP=z(aN[2].substring(5),16);R=z(aN[2].substring(3,5),16);E=z(aN[2].substring(1,3),16);}if(aN[3]){aP=z(aN[3].substring(3)+aN[3].substring(3),16);R=z(aN[3].substring(2,3)+aN[3].substring(2,3),16);E=z(aN[3].substring(1,2)+aN[3].substring(1,2),16);}if(aN[4]){aN=aN[4][u](/\s*,\s*/);E=N(aN[0]);R=N(aN[1]);aP=N(aN[2]);}if(aN[5]){aN=aN[5][u](/\s*,\s*/);E=N(aN[0])*2.55;R=N(aN[1])*2.55;aP=N(aN[2])*2.55;}if(aN[6]){aN=aN[6][u](/\s*,\s*/);E=N(aN[0]);R=N(aN[1]);aP=N(aN[2]);return af.hsb2rgb(E,R,aP);}if(aN[7]){aN=aN[7][u](/\s*,\s*/);E=N(aN[0])*2.55;R=N(aN[1])*2.55;aP=N(aN[2])*2.55;return af.hsb2rgb(E,R,aP);}aN={r:E,g:R,b:aP};var i=(~~E)[ao](16),S=(~~R)[ao](16),aO=(~~aP)[ao](16);i=i[aC](aG,"0");S=S[aC](aG,"0");aO=aO[aC](aG,"0");aN.hex="#"+i+S+aO;return aN;}return{r:-1,g:-1,b:-1,hex:"none",error:1};},af);af.getColor=function(i){var E=this.getColor.start=this.getColor.start||{h:0,s:1,b:i||0.75},e=this.hsb2rgb(E.h,E.s,E.b);E.h+=0.075;if(E.h>1){E.h=0;E.s-=0.2;E.s<=0&&(this.getColor.start={h:0,s:1,b:E.b});}return e.hex;};af.getColor.reset=function(){delete this.start;};af.parsePathString=aa(function(e){if(!e){return null;}var E={a:7,c:6,h:1,l:2,m:2,q:4,s:4,t:2,v:1,z:0},i=[];if(af.is(e,"array")&&af.is(e[0],"array")){i=ak(e);}if(!i[l]){(e+ai)[aC](/([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,function(S,R,aO){var aN=[],aM=aL.call(R);aO[aC](/(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,function(aQ,aP){aP&&aN[d](+aP);});while(aN[l]>=E[aM]){i[d]([R][aF](aN.splice(0,E[aM])));if(!E[aM]){break;}}});}i[ao]=af._path2string;return i;});var L=aa(function(aR){if(!aR){return{x:0,y:0,width:0,height:0};}aR=A(aR);var aO=0,aN=0,R=[],E=[];for(var S=0,aQ=aR[l];S<aQ;S++){if(aR[S][0]=="M"){aO=aR[S][1];aN=aR[S][2];R[d](aO);E[d](aN);}else{var aM=ap(aO,aN,aR[S][1],aR[S][2],aR[S][3],aR[S][4],aR[S][5],aR[S][6]);R=R[aF](aM.min.x,aM.max.x);E=E[aF](aM.min.y,aM.max.y);}}var e=aw[aI](0,R),aP=aw[aI](0,E);return{x:e,y:aP,width:f[aI](0,R)-e,height:f[aI](0,E)-aP};}),ak=function(aN){var R=[];if(!af.is(aN,"array")||!af.is(aN&&aN[0],"array")){aN=af.parsePathString(aN);}for(var E=0,S=aN[l];E<S;E++){R[E]=[];for(var e=0,aM=aN[E][l];e<aM;e++){R[E][e]=aN[E][e];}}R[ao]=af._path2string;return R;},V=aa(function(S){if(!af.is(S,"array")||!af.is(S&&S[0],"array")){S=af.parsePathString(S);}var aR=[],aT=0,aS=0,aW=0,aV=0,R=0;if(S[0][0]=="M"){aT=S[0][1];aS=S[0][2];aW=aT;aV=aS;R++;aR[d](["M",aT,aS]);}for(var aO=R,aX=S[l];aO<aX;aO++){var e=aR[aO]=[],aU=S[aO];if(aU[0]!=aL.call(aU[0])){e[0]=aL.call(aU[0]);switch(e[0]){case"a":e[1]=aU[1];e[2]=aU[2];e[3]=aU[3];e[4]=aU[4];e[5]=aU[5];e[6]=+(aU[6]-aT).toFixed(3);e[7]=+(aU[7]-aS).toFixed(3);break;case"v":e[1]=+(aU[1]-aS).toFixed(3);break;case"m":aW=aU[1];aV=aU[2];default:for(var aN=1,aP=aU[l];aN<aP;aN++){e[aN]=+(aU[aN]-((aN%2)?aT:aS)).toFixed(3);}}}else{e=aR[aO]=[];if(aU[0]=="m"){aW=aU[1]+aT;aV=aU[2]+aS;}for(var aM=0,E=aU[l];aM<E;aM++){aR[aO][aM]=aU[aM];}}var aQ=aR[aO][l];switch(aR[aO][0]){case"z":aT=aW;aS=aV;break;case"h":aT+=+aR[aO][aQ-1];break;case"v":aS+=+aR[aO][aQ-1];break;default:aT+=+aR[aO][aQ-2];aS+=+aR[aO][aQ-1];}}aR[ao]=af._path2string;return aR;},0,ak),p=aa(function(S){if(!af.is(S,"array")||!af.is(S&&S[0],"array")){S=af.parsePathString(S);}var aQ=[],aS=0,aR=0,aV=0,aU=0,R=0;if(S[0][0]=="M"){aS=+S[0][1];aR=+S[0][2];aV=aS;aU=aR;R++;aQ[0]=["M",aS,aR];}for(var aO=R,aW=S[l];aO<aW;aO++){var e=aQ[aO]=[],aT=S[aO];if(aT[0]!=aB.call(aT[0])){e[0]=aB.call(aT[0]);switch(e[0]){case"A":e[1]=aT[1];e[2]=aT[2];e[3]=aT[3];e[4]=aT[4];e[5]=aT[5];e[6]=+(aT[6]+aS);e[7]=+(aT[7]+aR);break;case"V":e[1]=+aT[1]+aR;break;case"H":e[1]=+aT[1]+aS;break;case"M":aV=+aT[1]+aS;aU=+aT[2]+aR;default:for(var aN=1,aP=aT[l];aN<aP;aN++){e[aN]=+aT[aN]+((aN%2)?aS:aR);}}}else{for(var aM=0,E=aT[l];aM<E;aM++){aQ[aO][aM]=aT[aM];}}switch(e[0]){case"Z":aS=aV;aR=aU;break;case"H":aS=e[1];break;case"V":aR=e[1];break;default:aS=aQ[aO][aQ[aO][l]-2];aR=aQ[aO][aQ[aO][l]-1];}}aQ[ao]=af._path2string;return aQ;},null,ak),aJ=function(i,R,e,E){return[i,R,e,E,e,E];},ay=function(i,R,aN,S,e,E){var aM=1/3,aO=2/3;return[aM*i+aO*aN,aM*R+aO*S,aM*e+aO*aN,aM*E+aO*S,e,E];},C=function(aW,bq,a5,a3,aX,aR,aM,aV,bp,aY){var S=Math.PI,a2=S*120/180,e=S/180*(+aX||0),a9=[],a6,bm=aa(function(br,bu,i){var bt=br*Math.cos(i)-bu*Math.sin(i),bs=br*Math.sin(i)+bu*Math.cos(i);return{x:bt,y:bs};});if(!aY){a6=bm(aW,bq,-e);aW=a6.x;bq=a6.y;a6=bm(aV,bp,-e);aV=a6.x;bp=a6.y;var E=Math.cos(S/180*aX),aT=Math.sin(S/180*aX),bb=(aW-aV)/2,ba=(bq-bp)/2;a5=f(a5,Math.abs(bb));a3=f(a3,Math.abs(ba));var R=a5*a5,be=a3*a3,bg=(aR==aM?-1:1)*Math.sqrt(Math.abs((R*be-R*ba*ba-be*bb*bb)/(R*ba*ba+be*bb*bb))),a0=bg*a5*ba/a3+(aW+aV)/2,aZ=bg*-a3*bb/a5+(bq+bp)/2,aQ=Math.asin((bq-aZ)/a3),aP=Math.asin((bp-aZ)/a3);aQ=aW<a0?S-aQ:aQ;aP=aV<a0?S-aP:aP;aQ<0&&(aQ=S*2+aQ);aP<0&&(aP=S*2+aP);if(aM&&aQ>aP){aQ=aQ-S*2;}if(!aM&&aP>aQ){aP=aP-S*2;}}else{aQ=aY[0];aP=aY[1];a0=aY[2];aZ=aY[3];}var aU=aP-aQ;if(Math.abs(aU)>a2){var a1=aP,a4=aV,aS=bp;aP=aQ+a2*(aM&&aP>aQ?1:-1);aV=a0+a5*Math.cos(aP);bp=aZ+a3*Math.sin(aP);a9=C(aV,bp,a5,a3,aX,0,aM,a4,aS,[aP,a1,a0,aZ]);}aU=aP-aQ;var aO=Math.cos(aQ),bo=Math.sin(aQ),aN=Math.cos(aP),bn=Math.sin(aP),bc=Math.tan(aU/4),bf=4/3*a5*bc,bd=4/3*a3*bc,bl=[aW,bq],bk=[aW+bf*bo,bq-bd*aO],bj=[aV+bf*bn,bp-bd*aN],bh=[aV,bp];bk[0]=2*bl[0]-bk[0];bk[1]=2*bl[1]-bk[1];if(aY){return[bk,bj,bh][aF](a9);}else{a9=[bk,bj,bh][aF](a9)[an](",")[u](",");var a7=[];for(var bi=0,a8=a9[l];bi<a8;bi++){a7[bi]=bi%2?bm(a9[bi-1],a9[bi],e).y:bm(a9[bi],a9[bi+1],e).x;}return a7;}},F=aa(function(i,e,aZ,aX,aM,S,aO,aN,aT){var aR=aA(1-aT,3)*i+aA(1-aT,2)*3*aT*aZ+(1-aT)*3*aT*aT*aM+aA(aT,3)*aO,aP=aA(1-aT,3)*e+aA(1-aT,2)*3*aT*aX+(1-aT)*3*aT*aT*S+aA(aT,3)*aN,aV=i+2*aT*(aZ-i)+aT*aT*(aM-2*aZ+i),aU=e+2*aT*(aX-e)+aT*aT*(S-2*aX+e),aY=aZ+2*aT*(aM-aZ)+aT*aT*(aO-2*aM+aZ),aW=aX+2*aT*(S-aX)+aT*aT*(aN-2*S+aX),aS=(1-aT)*i+aT*aZ,aQ=(1-aT)*e+aT*aX,R=(1-aT)*aM+aT*aO,E=(1-aT)*S+aT*aN;return{x:aR,y:aP,m:{x:aV,y:aU},n:{x:aY,y:aW},start:{x:aS,y:aQ},end:{x:R,y:E}};}),ap=aa(function(i,e,R,E,aX,aW,aT,aQ){var aV=(aX-2*R+i)-(aT-2*aX+R),aS=2*(R-i)-2*(aX-R),aP=i-R,aN=(-aS+Math.sqrt(aS*aS-4*aV*aP))/2/aV,S=(-aS-Math.sqrt(aS*aS-4*aV*aP))/2/aV,aR=[e,aQ],aU=[i,aT],aO=F(i,e,R,E,aX,aW,aT,aQ,aN>0&&aN<1?aN:0),aM=F(i,e,R,E,aX,aW,aT,aQ,S>0&&S<1?S:0);aU=aU[aF](aO.x,aM.x);aR=aR[aF](aO.y,aM.y);aV=(aW-2*E+e)-(aQ-2*aW+E);aS=2*(E-e)-2*(aW-E);aP=e-E;aN=(-aS+Math.sqrt(aS*aS-4*aV*aP))/2/aV;S=(-aS-Math.sqrt(aS*aS-4*aV*aP))/2/aV;aO=F(i,e,R,E,aX,aW,aT,aQ,aN>0&&aN<1?aN:0);aM=F(i,e,R,E,aX,aW,aT,aQ,S>0&&S<1?S:0);aU=aU[aF](aO.x,aM.x);aR=aR[aF](aO.y,aM.y);return{min:{x:aw[aI](0,aU),y:aw[aI](0,aR)},max:{x:f[aI](0,aU),y:f[aI](0,aR)}};}),A=aa(function(aW,aR){var S=p(aW),aS=aR&&p(aR),aT={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},e={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},aN=function(aX,aY){var i,aZ;if(!aX){return["C",aY.x,aY.y,aY.x,aY.y,aY.x,aY.y];}!(aX[0] in {T:1,Q:1})&&(aY.qx=aY.qy=null);switch(aX[0]){case"M":aY.X=aX[1];aY.Y=aX[2];break;case"A":aX=["C"][aF](C[aI](0,[aY.x,aY.y][aF](aX.slice(1))));break;case"S":i=aY.x+(aY.x-(aY.bx||aY.x));aZ=aY.y+(aY.y-(aY.by||aY.y));aX=["C",i,aZ][aF](aX.slice(1));break;case"T":aY.qx=aY.x+(aY.x-(aY.qx||aY.x));aY.qy=aY.y+(aY.y-(aY.qy||aY.y));aX=["C"][aF](ay(aY.x,aY.y,aY.qx,aY.qy,aX[1],aX[2]));break;case"Q":aY.qx=aX[1];aY.qy=aX[2];aX=["C"][aF](ay(aY.x,aY.y,aX[1],aX[2],aX[3],aX[4]));break;case"L":aX=["C"][aF](aJ(aY.x,aY.y,aX[1],aX[2]));break;case"H":aX=["C"][aF](aJ(aY.x,aY.y,aX[1],aY.y));break;case"V":aX=["C"][aF](aJ(aY.x,aY.y,aY.x,aX[1]));break;case"Z":aX=["C"][aF](aJ(aY.x,aY.y,aY.X,aY.Y));break;}return aX;},E=function(aX,aY){if(aX[aY][l]>7){aX[aY].shift();var aZ=aX[aY];while(aZ[l]){aX.splice(aY++,0,["C"][aF](aZ.splice(0,6)));}aX.splice(aY,1);aU=f(S[l],aS&&aS[l]||0);}},R=function(a3,a0,aY,aX,aZ){if(a3&&a0&&a3[aZ][0]=="M"&&a0[aZ][0]!="M"){a0.splice(aZ,0,["M",aX.x,aX.y]);aY.bx=0;aY.by=0;aY.x=a3[aZ][1];aY.y=a3[aZ][2];aU=f(S[l],aS&&aS[l]||0);}};for(var aP=0,aU=f(S[l],aS&&aS[l]||0);aP<aU;aP++){S[aP]=aN(S[aP],aT);E(S,aP);aS&&(aS[aP]=aN(aS[aP],e));aS&&E(aS,aP);R(S,aS,aT,e,aP);R(aS,S,e,aT,aP);var aO=S[aP],aV=aS&&aS[aP],aM=aO[l],aQ=aS&&aV[l];aT.x=aO[aM-2];aT.y=aO[aM-1];aT.bx=N(aO[aM-4])||aT.x;aT.by=N(aO[aM-3])||aT.y;e.bx=aS&&(N(aV[aQ-4])||e.x);e.by=aS&&(N(aV[aQ-3])||e.y);e.x=aS&&aV[aQ-2];e.y=aS&&aV[aQ-1];}return aS?[S,aS]:S;},null,ak),n=aa(function(aQ){var aP=[];for(var aM=0,aR=aQ[l];aM<aR;aM++){var e={},aO=aQ[aM].match(/^([^:]*):?([\d\.]*)/);e.color=af.getRGB(aO[1]);if(e.color.error){return null;}e.color=e.color.hex;aO[2]&&(e.offset=aO[2]+"%");aP[d](e);}for(var aM=1,aR=aP[l]-1;aM<aR;aM++){if(!aP[aM].offset){var E=N(aP[aM-1].offset||0),R=0;for(var S=aM+1;S<aR;S++){if(aP[S].offset){R=aP[S].offset;break;}}if(!R){R=100;S=aR;}R=N(R);var aN=(R-E)/(S-aM+1);for(;aM<S;aM++){E+=aN;aP[aM].offset=E+"%";}}}return aP;}),ag=function(){var E,i,S,R,e;if(af.is(arguments[0],"string")||af.is(arguments[0],"object")){if(af.is(arguments[0],"string")){E=D.getElementById(arguments[0]);}else{E=arguments[0];}if(E.tagName){if(arguments[1]==null){return{container:E,width:E.style.pixelWidth||E.offsetWidth,height:E.style.pixelHeight||E.offsetHeight};}else{return{container:E,width:arguments[1],height:arguments[2]};}}}else{if(af.is(arguments[0],ad)&&arguments[l]>3){return{container:1,x:arguments[0],y:arguments[1],width:arguments[2],height:arguments[3]};}}},au=function(e,E){var i=this;for(var R in E){if(E[J](R)&&!(R in e)){switch(typeof E[R]){case"function":(function(S){e[R]=e===i?S:function(){return S[aI](i,arguments);};})(E[R]);break;case"object":e[R]=e[R]||{};au.call(this,e[R],E[R]);break;default:e[R]=E[R];break;}}}},ac=function(e,i){e==i.top&&(i.top=e.prev);e==i.bottom&&(i.bottom=e.next);e.next&&(e.next.prev=e.prev);e.prev&&(e.prev.next=e.next);},P=function(e,i){ac(e,i);e.next=null;e.prev=i.top;i.top.next=e;i.top=e;},j=function(e,i){ac(e,i);e.next=i.bottom;e.prev=null;i.bottom.prev=e;i.bottom=e;},v=function(i,e,E){ac(i,E);e==E.top&&(E.top=i);e.next&&(e.next.prev=i);i.next=e.next;i.prev=e;e.next=i;},ah=function(i,e,E){ac(i,E);e==E.bottom&&(E.bottom=i);e.prev&&(e.prev.next=i);i.prev=e.prev;e.prev=i;i.next=e;};if(af.svg){aD.svgns="http://www.w3.org/2000/svg";aD.xlink="http://www.w3.org/1999/xlink";var H=function(e){return +e+(~~e===e)*0.5;},M=function(aM){for(var E=0,R=aM[l];E<R;E++){if(aL.call(aM[E][0])!="a"){for(var e=1,S=aM[E][l];e<S;e++){aM[E][e]=H(aM[E][e]);}}else{aM[E][6]=H(aM[E][6]);aM[E][7]=H(aM[E][7]);}}return aM;},ax=function(E,e){if(e){for(var i in e){if(e[J](i)){E[r](i,e[i]);}}}else{return D.createElementNS(aD.svgns,E);}};af[ao]=function(){return"Your browser supports SVG.\nYou are running Rapha\xebl "+this.version;};var o=function(e,R){var i=ax("path");R.canvas&&R.canvas[az](i);var E=new am(i,R);E.type="path";T(E,{fill:"none",stroke:"#000",path:e});return E;};var b=function(R,aU,e){var aR="linear",aO=0.5,aM=0.5,aW=R.style;aU=(aU+ai)[aC](/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,function(aX,i,aY){aR="radial";if(i&&aY){aO=N(i);aM=N(aY);if(aA(aO-0.5,2)+aA(aM-0.5,2)>0.25){aM=Math.sqrt(0.25-aA(aO-0.5,2))+0.5;}}return ai;});aU=aU[u](/\s*\-\s*/);if(aR=="linear"){var aN=aU.shift();aN=-N(aN);if(isNaN(aN)){return null;}var S=[0,0,Math.cos(aN*Math.PI/180),Math.sin(aN*Math.PI/180)],aT=1/(f(Math.abs(S[2]),Math.abs(S[3]))||1);S[2]*=aT;S[3]*=aT;if(S[2]<0){S[0]=-S[2];S[2]=0;}if(S[3]<0){S[1]=-S[3];S[3]=0;}}var aQ=n(aU);if(!aQ){return null;}var E=ax(aR+"Gradient");E.id="r"+(af._id++)[ao](36);aR=="radial"?ax(E,{fx:aO,fy:aM}):ax(E,{x1:S[0],y1:S[1],x2:S[2],y2:S[3]});e.defs[az](E);for(var aP=0,aV=aQ[l];aP<aV;aP++){var aS=ax("stop");ax(aS,{offset:aQ[aP].offset?aQ[aP].offset:!aP?"0%":"100%","stop-color":aQ[aP].color||"#fff"});E[az](aS);}ax(R,{fill:"url(#"+E.id+")",opacity:1,"fill-opacity":1});aW.fill=ai;aW.opacity=1;aW.fillOpacity=1;return 1;};var G=function(i){var e=i.getBBox();ax(i.pattern,{patternTransform:af.format("translate({0},{1})",e.x,e.y)});};var T=function(aT,a2){var aW={"":[0],none:[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},aY=aT.node,aU=aT.attrs,aQ=aT.rotate(),aM=function(a9,a8){a8=aW[aL.call(a8)];if(a8){var a6=a9.attrs["stroke-width"]||"1",a4={round:a6,square:a6,butt:0}[a9.attrs["stroke-linecap"]||a2["stroke-linecap"]]||0,a7=[];var a5=a8[l];while(a5--){a7[a5]=a8[a5]*a6+((a5%2)?1:-1)*a4;}ax(aY,{"stroke-dasharray":a7[an](",")});}};a2[J]("rotation")&&(aQ=a2.rotation);var aP=(aQ+ai)[u](a);if(!(aP.length-1)){aP=null;}else{aP[1]=+aP[1];aP[2]=+aP[2];}N(aQ)&&aT.rotate(0,true);for(var aX in a2){if(a2[J](aX)){if(!h[J](aX)){continue;}var aV=a2[aX];aU[aX]=aV;switch(aX){case"rotation":aT.rotate(aV,true);break;case"href":case"title":case"target":var a0=aY.parentNode;if(aL.call(a0.tagName)!="a"){var R=ax("a");a0.insertBefore(R,aY);R[az](aY);a0=R;}a0.setAttributeNS(aT.paper.xlink,aX,aV);break;case"cursor":aY.style.cursor=aV;break;case"clip-rect":var i=(aV+ai)[u](a);if(i[l]==4){aT.clip&&aT.clip.parentNode.parentNode.removeChild(aT.clip.parentNode);var E=ax("clipPath"),aZ=ax("rect");E.id="r"+(af._id++)[ao](36);ax(aZ,{x:i[0],y:i[1],width:i[2],height:i[3]});E[az](aZ);aT.paper.defs[az](E);ax(aY,{"clip-path":"url(#"+E.id+")"});aT.clip=aZ;}if(!aV){var a1=D.getElementById(aY.getAttribute("clip-path")[aC](/(^url\(#|\)$)/g,ai));a1&&a1.parentNode.removeChild(a1);ax(aY,{"clip-path":ai});delete aT.clip;}break;case"path":if(aV&&aT.type=="path"){aU.path=M(p(aV));ax(aY,{d:aU.path});}break;case"width":aY[r](aX,aV);if(aU.fx){aX="x";aV=aU.x;}else{break;}case"x":if(aU.fx){aV=-aU.x-(aU.width||0);}case"rx":if(aX=="rx"&&aT.type=="rect"){break;}case"cx":aP&&(aX=="x"||aX=="cx")&&(aP[1]+=aV-aU[aX]);aY[r](aX,H(aV));aT.pattern&&G(aT);break;case"height":aY[r](aX,aV);if(aU.fy){aX="y";aV=aU.y;}else{break;}case"y":if(aU.fy){aV=-aU.y-(aU.height||0);}case"ry":if(aX=="ry"&&aT.type=="rect"){break;}case"cy":aP&&(aX=="y"||aX=="cy")&&(aP[2]+=aV-aU[aX]);aY[r](aX,H(aV));aT.pattern&&G(aT);break;case"r":if(aT.type=="rect"){ax(aY,{rx:aV,ry:aV});}else{aY[r](aX,aV);}break;case"src":if(aT.type=="image"){aY.setAttributeNS(aT.paper.xlink,"href",aV);}break;case"stroke-width":aY.style.strokeWidth=aV;aY[r](aX,aV);if(aU["stroke-dasharray"]){aM(aT,aU["stroke-dasharray"]);}break;case"stroke-dasharray":aM(aT,aV);break;case"translation":var aN=(aV+ai)[u](a);if(aP){aP[1]+=+aN[0];aP[2]+=+aN[1];}q.call(aT,(+aN[0]+1||2)-1,(+aN[1]+1||2)-1);break;case"scale":var aN=(aV+ai)[u](a);aT.scale(+aN[0]||1,+aN[1]||+aN[0]||1,+aN[2]||null,+aN[3]||null);break;case"fill":var S=(aV+ai).match(c);if(S){var E=ax("pattern"),aS=ax("image");E.id="r"+(af._id++)[ao](36);ax(E,{x:0,y:0,patternUnits:"userSpaceOnUse"});ax(aS,{x:0,y:0});aS.setAttributeNS(aT.paper.xlink,"href",S[1]);E[az](aS);var a3=D.createElement("img");a3.style.cssText="position:absolute;left:-9999em;top-9999em";a3.onload=function(){ax(E,{width:this.offsetWidth,height:this.offsetHeight});ax(aS,{width:this.offsetWidth,height:this.offsetHeight});D.body.removeChild(this);aD.safari();};D.body[az](a3);a3.src=S[1];aT.paper.defs[az](E);aY.style.fill="url(#"+E.id+")";ax(aY,{fill:"url(#"+E.id+")"});aT.pattern=E;aT.pattern&&G(aT);break;}if(!af.getRGB(aV).error){delete a2.gradient;delete aU.gradient;!af.is(aU.opacity,"undefined")&&af.is(a2.opacity,"undefined")&&ax(aY,{opacity:aU.opacity});!af.is(aU["fill-opacity"],"undefined")&&af.is(a2["fill-opacity"],"undefined")&&ax(aY,{"fill-opacity":aU["fill-opacity"]});}else{if((({circle:1,ellipse:1})[J](aT.type)||(aV+ai).charAt()!="r")&&b(aY,aV,aT.paper)){aU.gradient=aV;aU.fill="none";break;}}case"stroke":aY[r](aX,af.getRGB(aV).hex);break;case"gradient":(({circle:1,ellipse:1})[J](aT.type)||(aV+ai).charAt()!="r")&&b(aY,aV,aT.paper);break;case"opacity":case"fill-opacity":if(aU.gradient){var e=D.getElementById(aY.getAttribute("fill")[aC](/^url\(#|\)$/g,ai));if(e){var aO=e.getElementsByTagName("stop");aO[aO[l]-1][r]("stop-opacity",aV);}break;}default:aX=="font-size"&&(aV=z(aV,10)+"px");var aR=aX[aC](/(\-.)/g,function(a4){return aB.call(a4.substring(1));});aY.style[aR]=aV;aY[r](aX,aV);break;}}}x(aT,a2);if(aP){aT.rotate(aP.join(ae));}else{N(aQ)&&aT.rotate(aQ,true);}};var g=1.2;var x=function(e,S){if(e.type!="text"||!(S[J]("text")||S[J]("font")||S[J]("font-size")||S[J]("x")||S[J]("y"))){return;}var aQ=e.attrs,E=e.node,aS=E.firstChild?z(D.defaultView.getComputedStyle(E.firstChild,ai).getPropertyValue("font-size"),10):10;if(S[J]("text")){aQ.text=S.text;while(E.firstChild){E.removeChild(E.firstChild);}var R=(S.text+ai)[u]("\n");for(var aM=0,aR=R[l];aM<aR;aM++){if(R[aM]){var aO=ax("tspan");aM&&ax(aO,{dy:aS*g,x:aQ.x});aO[az](D.createTextNode(R[aM]));E[az](aO);}}}else{var R=E.getElementsByTagName("tspan");for(var aM=0,aR=R[l];aM<aR;aM++){aM&&ax(R[aM],{dy:aS*g,x:aQ.x});}}ax(E,{y:aQ.y});var aN=e.getBBox(),aP=aQ.y-(aN.y+aN.height/2);aP&&isFinite(aP)&&ax(E,{y:aQ.y+aP});};var am=function(i,e){var R=0,E=0;this[0]=i;this.id=af._oid++;this.node=i;i.raphael=this;this.paper=e;this.attrs=this.attrs||{};this.transformations=[];this._={tx:0,ty:0,rt:{deg:0,cx:0,cy:0},sx:1,sy:1};!e.bottom&&(e.bottom=this);this.prev=e.top;e.top&&(e.top.next=this);e.top=this;this.next=null;};am[aK].rotate=function(i,e,R){if(this.removed){return this;}if(i==null){if(this._.rt.cx){return[this._.rt.deg,this._.rt.cx,this._.rt.cy][an](ae);}return this._.rt.deg;}var E=this.getBBox();i=(i+ai)[u](a);if(i[l]-1){e=N(i[1]);R=N(i[2]);}i=N(i[0]);if(e!=null){this._.rt.deg=i;}else{this._.rt.deg+=i;}(R==null)&&(e=null);this._.rt.cx=e;this._.rt.cy=R;e=e==null?E.x+E.width/2:e;R=R==null?E.y+E.height/2:R;if(this._.rt.deg){this.transformations[0]=af.format("rotate({0} {1} {2})",this._.rt.deg,e,R);this.clip&&ax(this.clip,{transform:af.format("rotate({0} {1} {2})",-this._.rt.deg,e,R)});}else{this.transformations[0]=ai;this.clip&&ax(this.clip,{transform:ai});}ax(this.node,{transform:this.transformations[an](ae)});return this;};am[aK].hide=function(){!this.removed&&(this.node.style.display="none");return this;};am[aK].show=function(){!this.removed&&(this.node.style.display="");return this;};am[aK].remove=function(){if(this.removed){return;}ac(this,this.paper);this.node.parentNode.removeChild(this.node);for(var e in this){delete this[e];}this.removed=true;};am[aK].getBBox=function(){if(this.removed){return this;}if(this.type=="path"){return L(this.attrs.path);}if(this.node.style.display=="none"){this.show();var R=true;}var aO={};try{aO=this.node.getBBox();}catch(aM){}finally{aO=aO||{};}if(this.type=="text"){aO={x:aO.x,y:Infinity,width:0,height:0};for(var E=0,S=this.node.getNumberOfChars();E<S;E++){var aN=this.node.getExtentOfChar(E);(aN.y<aO.y)&&(aO.y=aN.y);(aN.y+aN.height-aO.y>aO.height)&&(aO.height=aN.y+aN.height-aO.y);(aN.x+aN.width-aO.x>aO.width)&&(aO.width=aN.x+aN.width-aO.x);}}R&&this.hide();return aO;};am[aK].attr=function(){if(this.removed){return this;}if(arguments[l]==1&&af.is(arguments[0],"string")){if(arguments[0]=="translation"){return q.call(this);}if(arguments[0]=="rotation"){return this.rotate();}if(arguments[0]=="scale"){return this.scale();}return this.attrs[arguments[0]];}if(arguments[l]==1&&af.is(arguments[0],"array")){var e={};for(var i in arguments[0]){if(arguments[0][J](i)){e[arguments[0][i]]=this.attrs[arguments[0][i]];}}return e;}if(arguments[l]==2){var E={};E[arguments[0]]=arguments[1];T(this,E);}else{if(arguments[l]==1&&af.is(arguments[0],"object")){T(this,arguments[0]);}}return this;};am[aK].toFront=function(){if(this.removed){return this;}this.node.parentNode[az](this.node);var e=this.paper;e.top!=this&&P(this,e);return this;};am[aK].toBack=function(){if(this.removed){return this;}if(this.node.parentNode.firstChild!=this.node){this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild);j(this,this.paper);var e=this.paper;}return this;};am[aK].insertAfter=function(i){if(this.removed){return this;}var e=this.paper,E=i.node;if(E.nextSibling){E.parentNode.insertBefore(this.node,E.nextSibling);}else{E.parentNode[az](this.node);}v(this,i,this.paper);return this;};am[aK].insertBefore=function(e){if(this.removed){return this;}var i=e.node;i.parentNode.insertBefore(this.node,i);ah(this,e,this.paper);return this;};var I=function(i,e,aM,S){e=H(e);aM=H(aM);var R=ax("circle");i.canvas&&i.canvas[az](R);var E=new am(R,i);E.attrs={cx:e,cy:aM,r:S,fill:"none",stroke:"#000"};E.type="circle";ax(R,E.attrs);return E;};var at=function(E,e,aO,i,aM,aN){e=H(e);aO=H(aO);var S=ax("rect");E.canvas&&E.canvas[az](S);var R=new am(S,E);R.attrs={x:e,y:aO,width:i,height:aM,r:aN||0,rx:aN||0,ry:aN||0,fill:"none",stroke:"#000"};R.type="rect";ax(S,R.attrs);return R;};var Z=function(i,e,aN,aM,S){e=H(e);aN=H(aN);var R=ax("ellipse");i.canvas&&i.canvas[az](R);var E=new am(R,i);E.attrs={cx:e,cy:aN,rx:aM,ry:S,fill:"none",stroke:"#000"};E.type="ellipse";ax(R,E.attrs);return E;};var m=function(E,aN,e,aO,i,aM){var S=ax("image");ax(S,{x:e,y:aO,width:i,height:aM,preserveAspectRatio:"none"});S.setAttributeNS(E.xlink,"href",aN);E.canvas&&E.canvas[az](S);var R=new am(S,E);R.attrs={x:e,y:aO,width:i,height:aM,src:aN};R.type="image";return R;};var O=function(i,e,aM,S){var R=ax("text");ax(R,{x:e,y:aM,"text-anchor":"middle"});i.canvas&&i.canvas[az](R);var E=new am(R,i);E.attrs={x:e,y:aM,"text-anchor":"middle",text:S,font:h.font,stroke:"none",fill:"#000"};E.type="text";T(E,E.attrs);return E;};var aH=function(i,e){this.width=i||this.width;this.height=e||this.height;this.canvas[r]("width",this.width);this.canvas[r]("height",this.height);return this;};var s=function(){var R=ag[aI](null,arguments),E=R&&R.container,i=R.x,aO=R.y,S=R.width,e=R.height;if(!E){throw new Error("SVG container not found.");}aD.canvas=ax("svg");var aN=aD.canvas;aD.width=S||512;aD.height=e||342;aN[r]("width",aD.width);aN[r]("height",aD.height);if(E==1){aN.style.cssText="position:absolute;left:"+i+"px;top:"+aO+"px";D.body[az](aN);}else{if(E.firstChild){E.insertBefore(aN,E.firstChild);}else{E[az](aN);}}E={canvas:aN};for(var aM in aD){if(aD[J](aM)){E[aM]=aD[aM];}}E.bottom=E.top=null;au.call(E,E,af.fn);E.clear();E.raphael=af;return E;};aD.clear=function(){var e=this.canvas;while(e.firstChild){e.removeChild(e.firstChild);}this.bottom=this.top=null;(this.desc=ax("desc"))[az](D.createTextNode("Created with Rapha\xebl"));e[az](this.desc);e[az](this.defs=ax("defs"));};aD.remove=function(){this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var e in this){delete this[e];}};}if(af.vml){var av=function(aV){var aS=/[ahqtv]/ig,aN=p;(aV+ai).match(aS)&&(aN=A);aS=/[clmz]/g;if(aN==p&&!(aV+ai).match(aS)){var E={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},S=/([clmz]),?([^clmz]*)/gi,aM=/-?[^,\s-]+/g;var aR=(aV+ai)[aC](S,function(aW,aY,i){var aX=[];i[aC](aM,function(aZ){aX[d](H(aZ));});return E[aY]+aX;});return aR;}var aT=aN(aV),R,aR=[],e;for(var aP=0,aU=aT[l];aP<aU;aP++){R=aT[aP];e=aL.call(aT[aP][0]);e=="z"&&(e="x");for(var aO=1,aQ=R[l];aO<aQ;aO++){e+=H(R[aO])+(aO!=aQ-1?",":ai);}aR[d](e);}return aR[an](ae);};af[ao]=function(){return"Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl "+this.version;};var o=function(e,aM){var R=Y("group");R.style.cssText="position:absolute;left:0;top:0;width:"+aM.width+"px;height:"+aM.height+"px";R.coordsize=aM.coordsize;R.coordorigin=aM.coordorigin;var E=Y("shape"),i=E.style;i.width=aM.width+"px";i.height=aM.height+"px";E.coordsize=this.coordsize;E.coordorigin=this.coordorigin;R[az](E);var S=new am(E,R,aM);S.isAbsolute=true;S.type="path";S.path=[];S.Path=ai;e&&T(S,{fill:"none",stroke:"#000",path:e});aM.canvas[az](R);return S;};var T=function(aQ,aV){aQ.attrs=aQ.attrs||{};var aT=aQ.node,aW=aQ.attrs,aN=aT.style,R,a0=aQ;for(var aO in aV){if(aV[J](aO)){aW[aO]=aV[aO];}}aV.href&&(aT.href=aV.href);aV.title&&(aT.title=aV.title);aV.target&&(aT.target=aV.target);aV.cursor&&(aN.cursor=aV.cursor);if(aV.path&&aQ.type=="path"){aW.path=aV.path;aT.path=av(aW.path);}if(aV.rotation!=null){aQ.rotate(aV.rotation,true);}if(aV.translation){R=(aV.translation+ai)[u](a);q.call(aQ,R[0],R[1]);if(aQ._.rt.cx!=null){aQ._.rt.cx+=+R[0];aQ._.rt.cy+=+R[1];aQ.setBox(aQ.attrs,R[0],R[1]);}}if(aV.scale){R=(aV.scale+ai)[u](a);aQ.scale(+R[0]||1,+R[1]||+R[0]||1,+R[2]||null,+R[3]||null);}if("clip-rect" in aV){var e=(aV["clip-rect"]+ai)[u](a);if(e[l]==4){e[2]=+e[2]+(+e[0]);e[3]=+e[3]+(+e[1]);var aP=aT.clipRect||D.createElement("div"),aZ=aP.style,aM=aT.parentNode;aZ.clip=af.format("rect({1}px {2}px {3}px {0}px)",e);if(!aT.clipRect){aZ.position="absolute";aZ.top=0;aZ.left=0;aZ.width=aQ.paper.width+"px";aZ.height=aQ.paper.height+"px";aM.parentNode.insertBefore(aP,aM);aP[az](aM);aT.clipRect=aP;}}if(!aV["clip-rect"]){aT.clipRect&&(aT.clipRect.style.clip=ai);}}if(aQ.type=="image"&&aV.src){aT.src=aV.src;}if(aQ.type=="image"&&aV.opacity){aT.filterOpacity=" progid:DXImageTransform.Microsoft.Alpha(opacity="+(aV.opacity*100)+")";aN.filter=(aT.filterMatrix||ai)+(aT.filterOpacity||ai);}aV.font&&(aN.font=aV.font);aV["font-family"]&&(aN.fontFamily='"'+aV["font-family"][u](",")[0][aC](/^['"]+|['"]+$/g,ai)+'"');aV["font-size"]&&(aN.fontSize=aV["font-size"]);aV["font-weight"]&&(aN.fontWeight=aV["font-weight"]);aV["font-style"]&&(aN.fontStyle=aV["font-style"]);if(aV.opacity!=null||aV["stroke-width"]!=null||aV.fill!=null||aV.stroke!=null||aV["stroke-width"]!=null||aV["stroke-opacity"]!=null||aV["fill-opacity"]!=null||aV["stroke-dasharray"]!=null||aV["stroke-miterlimit"]!=null||aV["stroke-linejoin"]!=null||aV["stroke-linecap"]!=null){aT=aQ.shape||aT;var aU=(aT.getElementsByTagName("fill")&&aT.getElementsByTagName("fill")[0]),aX=false;!aU&&(aX=aU=Y("fill"));if("fill-opacity" in aV||"opacity" in aV){var i=((+aW["fill-opacity"]+1||2)-1)*((+aW.opacity+1||2)-1);i<0&&(i=0);i>1&&(i=1);aU.opacity=i;}aV.fill&&(aU.on=true);if(aU.on==null||aV.fill=="none"){aU.on=false;}if(aU.on&&aV.fill){var E=aV.fill.match(c);if(E){aU.src=E[1];aU.type="tile";}else{aU.color=af.getRGB(aV.fill).hex;aU.src=ai;aU.type="solid";if(af.getRGB(aV.fill).error&&(a0.type in {circle:1,ellipse:1}||(aV.fill+ai).charAt()!="r")&&b(a0,aV.fill)){aW.fill="none";aW.gradient=aV.fill;}}}aX&&aT[az](aU);var S=(aT.getElementsByTagName("stroke")&&aT.getElementsByTagName("stroke")[0]),aY=false;!S&&(aY=S=Y("stroke"));if((aV.stroke&&aV.stroke!="none")||aV["stroke-width"]||aV["stroke-opacity"]!=null||aV["stroke-dasharray"]||aV["stroke-miterlimit"]||aV["stroke-linejoin"]||aV["stroke-linecap"]){S.on=true;}(aV.stroke=="none"||S.on==null||aV.stroke==0||aV["stroke-width"]==0)&&(S.on=false);S.on&&aV.stroke&&(S.color=af.getRGB(aV.stroke).hex);var i=((+aW["stroke-opacity"]+1||2)-1)*((+aW.opacity+1||2)-1),aR=(N(aV["stroke-width"])||1)*0.75;i<0&&(i=0);i>1&&(i=1);aV["stroke-width"]==null&&(aR=aW["stroke-width"]);aV["stroke-width"]&&(S.weight=aR);aR&&aR<1&&(i*=aR)&&(S.weight=1);S.opacity=i;aV["stroke-linejoin"]&&(S.joinstyle=aV["stroke-linejoin"]||"miter");S.miterlimit=aV["stroke-miterlimit"]||8;aV["stroke-linecap"]&&(S.endcap=aV["stroke-linecap"]=="butt"?"flat":aV["stroke-linecap"]=="square"?"square":"round");if(aV["stroke-dasharray"]){var aS={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};S.dashstyle=aS[J](aV["stroke-dasharray"])?aS[aV["stroke-dasharray"]]:ai;}aY&&aT[az](S);}if(a0.type=="text"){var aN=a0.paper.span.style;aW.font&&(aN.font=aW.font);aW["font-family"]&&(aN.fontFamily=aW["font-family"]);aW["font-size"]&&(aN.fontSize=aW["font-size"]);aW["font-weight"]&&(aN.fontWeight=aW["font-weight"]);aW["font-style"]&&(aN.fontStyle=aW["font-style"]);a0.node.string&&(a0.paper.span.innerHTML=(a0.node.string+ai)[aC](/</g,"&#60;")[aC](/&/g,"&#38;")[aC](/\n/g,"<br>"));a0.W=aW.w=a0.paper.span.offsetWidth;a0.H=aW.h=a0.paper.span.offsetHeight;a0.X=aW.x;a0.Y=aW.y+H(a0.H/2);switch(aW["text-anchor"]){case"start":a0.node.style["v-text-align"]="left";a0.bbx=H(a0.W/2);break;case"end":a0.node.style["v-text-align"]="right";a0.bbx=-H(a0.W/2);break;default:a0.node.style["v-text-align"]="center";break;}}};var b=function(e,aO){e.attrs=e.attrs||{};var aP=e.attrs,aR=e.node.getElementsByTagName("fill"),aM="linear",aN=".5 .5";e.attrs.gradient=aO;aO=(aO+ai)[aC](/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,function(aT,aU,i){aM="radial";if(aU&&i){aU=N(aU);i=N(i);if(aA(aU-0.5,2)+aA(i-0.5,2)>0.25){i=Math.sqrt(0.25-aA(aU-0.5,2))+0.5;}aN=aU+ae+i;}return ai;});aO=aO[u](/\s*\-\s*/);if(aM=="linear"){var E=aO.shift();E=-N(E);if(isNaN(E)){return null;}}var S=n(aO);if(!S){return null;}e=e.shape||e.node;aR=aR[0]||Y("fill");if(S[l]){aR.on=true;aR.method="none";aR.type=(aM=="radial")?"gradientradial":"gradient";aR.color=S[0].color;aR.color2=S[S[l]-1].color;var aS=[];for(var R=0,aQ=S[l];R<aQ;R++){S[R].offset&&aS[d](S[R].offset+ae+S[R].color);}aR.colors.value=aS[l]?aS[an](","):"0% "+aR.color;if(aM=="radial"){aR.focus="100%";aR.focussize=aN;aR.focusposition=aN;}else{aR.angle=(270-E)%360;}}return 1;};var am=function(S,aN,e){var aM=0,E=0,i=0,R=1;this[0]=S;this.id=af._oid++;this.node=S;S.raphael=this;this.X=0;this.Y=0;this.attrs={};this.Group=aN;this.paper=e;this._={tx:0,ty:0,rt:{deg:0},sx:1,sy:1};!e.bottom&&(e.bottom=this);this.prev=e.top;e.top&&(e.top.next=this);e.top=this;this.next=null;};am[aK].rotate=function(i,e,E){if(this.removed){return this;}if(i==null){if(this._.rt.cx){return[this._.rt.deg,this._.rt.cx,this._.rt.cy][an](ae);}return this._.rt.deg;}i=(i+ai)[u](a);if(i[l]-1){e=N(i[1]);E=N(i[2]);}i=N(i[0]);if(e!=null){this._.rt.deg=i;}else{this._.rt.deg+=i;}E==null&&(e=null);this._.rt.cx=e;this._.rt.cy=E;this.setBox(this.attrs,e,E);this.Group.style.rotation=this._.rt.deg;return this;};am[aK].setBox=function(aM,aN,S){if(this.removed){return this;}var E=this.Group.style,aO=(this.shape&&this.shape.style)||this.node.style;aM=aM||{};for(var aP in aM){if(aM[J](aP)){this.attrs[aP]=aM[aP];}}aN=aN||this._.rt.cx;S=S||this._.rt.cy;var aS=this.attrs,aV,aU,aW,aR;switch(this.type){case"circle":aV=aS.cx-aS.r;aU=aS.cy-aS.r;aW=aR=aS.r*2;break;case"ellipse":aV=aS.cx-aS.rx;aU=aS.cy-aS.ry;aW=aS.rx*2;aR=aS.ry*2;break;case"rect":case"image":aV=+aS.x;aU=+aS.y;aW=aS.width||0;aR=aS.height||0;break;case"text":this.textpath.v=["m",H(aS.x),", ",H(aS.y-2),"l",H(aS.x)+1,", ",H(aS.y-2)][an](ai);aV=aS.x-H(this.W/2);aU=aS.y-this.H/2;aW=this.W;aR=this.H;break;case"path":if(!this.attrs.path){aV=0;aU=0;aW=this.paper.width;aR=this.paper.height;}else{var aQ=L(this.attrs.path);aV=aQ.x;aU=aQ.y;aW=aQ.width;aR=aQ.height;}break;default:aV=0;aU=0;aW=this.paper.width;aR=this.paper.height;break;}aN=(aN==null)?aV+aW/2:aN;S=(S==null)?aU+aR/2:S;var R=aN-this.paper.width/2,aT=S-this.paper.height/2;if(this.type=="path"||this.type=="text"){(E.left!=R+"px")&&(E.left=R+"px");(E.top!=aT+"px")&&(E.top=aT+"px");this.X=this.type=="text"?aV:-R;this.Y=this.type=="text"?aU:-aT;this.W=aW;this.H=aR;(aO.left!=-R+"px")&&(aO.left=-R+"px");(aO.top!=-aT+"px")&&(aO.top=-aT+"px");}else{(E.left!=R+"px")&&(E.left=R+"px");(E.top!=aT+"px")&&(E.top=aT+"px");this.X=aV;this.Y=aU;this.W=aW;this.H=aR;(E.width!=this.paper.width+"px")&&(E.width=this.paper.width+"px");(E.height!=this.paper.height+"px")&&(E.height=this.paper.height+"px");(aO.left!=aV-R+"px")&&(aO.left=aV-R+"px");(aO.top!=aU-aT+"px")&&(aO.top=aU-aT+"px");(aO.width!=aW+"px")&&(aO.width=aW+"px");(aO.height!=aR+"px")&&(aO.height=aR+"px");var aX=(+aM.r||0)/(aw(aW,aR));if(this.type=="rect"&&this.arcsize!=aX&&(aX||this.arcsize)){var e=Y(aX?"roundrect":"rect");e.arcsize=aX;this.Group[az](e);this.node.parentNode.removeChild(this.node);this.node=e;this.arcsize=aX;this.attr(this.attrs);}}};am[aK].hide=function(){!this.removed&&(this.Group.style.display="none");return this;};am[aK].show=function(){!this.removed&&(this.Group.style.display="block");return this;};am[aK].getBBox=function(){if(this.removed){return this;}if(this.type=="path"){return L(this.attrs.path);}return{x:this.X+(this.bbx||0),y:this.Y,width:this.W,height:this.H};};am[aK].remove=function(){if(this.removed){return;}ac(this,this.paper);this.node.parentNode.removeChild(this[0]);this.Group.parentNode.removeChild(this.Group);this.shape&&this.shape.parentNode.removeChild(this.shape);for(var e in this){delete this[e];}this.removed=true;};am[aK].attr=function(){if(this.removed){return this;}if(arguments[l]==1&&af.is(arguments[0],"string")){if(arguments[0]=="translation"){return q.call(this);}if(arguments[0]=="rotation"){return this.rotate();}if(arguments[0]=="scale"){return this.scale();}return this.attrs[arguments[0]];}if(this.attrs&&arguments[l]==1&&af.is(arguments[0],"array")){var e={};for(var E=0,R=arguments[0][l];E<R;E++){e[arguments[0][E]]=this.attrs[arguments[0][E]];}return e;}var S;if(arguments[l]==2){S={};S[arguments[0]]=arguments[1];}arguments[l]==1&&af.is(arguments[0],"object")&&(S=arguments[0]);if(S){if(S.text&&this.type=="text"){this.node.string=S.text;}T(this,S);if(S.gradient&&(({circle:1,ellipse:1})[J](this.type)||(S.gradient+ai).charAt()!="r")){b(this,S.gradient);}(this.type!="path"||this._.rt.deg)&&this.setBox(this.attrs);}return this;};am[aK].toFront=function(){!this.removed&&this.Group.parentNode[az](this.Group);this.paper.top!=this&&P(this,this.paper);return this;};am[aK].toBack=function(){if(this.removed){return this;}if(this.Group.parentNode.firstChild!=this.Group){this.Group.parentNode.insertBefore(this.Group,this.Group.parentNode.firstChild);j(this,this.paper);}return this;};am[aK].insertAfter=function(e){if(this.removed){return this;}if(e.Group.nextSibling){e.Group.parentNode.insertBefore(this.Group,e.Group.nextSibling);}else{e.Group.parentNode[az](this.Group);}v(this,e,this.paper);return this;};am[aK].insertBefore=function(e){if(this.removed){return this;}e.Group.parentNode.insertBefore(this.Group,e.Group);ah(this,e,this.paper);return this;};var I=function(i,e,aO,aM){var S=Y("group"),aN=Y("oval"),E=aN.style;S.style.cssText="position:absolute;left:0;top:0;width:"+i.width+"px;height:"+i.height+"px";S.coordsize=i.coordsize;S.coordorigin=i.coordorigin;S[az](aN);var R=new am(aN,S,i);R.type="circle";T(R,{stroke:"#000",fill:"none"});R.attrs.cx=e;R.attrs.cy=aO;R.attrs.r=aM;R.setBox({x:e-aM,y:aO-aM,width:aM*2,height:aM*2});i.canvas[az](S);return R;};var at=function(i,aO,aN,aP,R,e){var S=Y("group"),E=Y(e?"roundrect":"rect"),aQ=(+e||0)/(aw(aP,R));E.arcsize=aQ;S.style.cssText="position:absolute;left:0;top:0;width:"+i.width+"px;height:"+i.height+"px";S.coordsize=i.coordsize;S.coordorigin=i.coordorigin;S[az](E);var aM=new am(E,S,i);aM.type="rect";T(aM,{stroke:"#000"});aM.arcsize=aQ;aM.setBox({x:aO,y:aN,width:aP,height:R,r:+e});i.canvas[az](S);return aM;};var Z=function(e,aP,aO,E,i){var S=Y("group"),R=Y("oval"),aN=R.style;S.style.cssText="position:absolute;left:0;top:0;width:"+e.width+"px;height:"+e.height+"px";S.coordsize=e.coordsize;S.coordorigin=e.coordorigin;S[az](R);var aM=new am(R,S,e);aM.type="ellipse";T(aM,{stroke:"#000"});aM.attrs.cx=aP;aM.attrs.cy=aO;aM.attrs.rx=E;aM.attrs.ry=i;aM.setBox({x:aP-E,y:aO-i,width:E*2,height:i*2});e.canvas[az](S);return aM;};var m=function(i,e,aP,aO,aQ,R){var S=Y("group"),E=Y("image"),aN=E.style;S.style.cssText="position:absolute;left:0;top:0;width:"+i.width+"px;height:"+i.height+"px";S.coordsize=i.coordsize;S.coordorigin=i.coordorigin;E.src=e;S[az](E);var aM=new am(E,S,i);aM.type="image";aM.attrs.src=e;aM.attrs.x=aP;aM.attrs.y=aO;aM.attrs.w=aQ;aM.attrs.h=R;aM.setBox({x:aP,y:aO,width:aQ,height:R});i.canvas[az](S);return aM;};var O=function(i,aP,aO,aQ){var S=Y("group"),R=Y("shape"),aN=R.style,aR=Y("path"),e=aR.style,E=Y("textpath");S.style.cssText="position:absolute;left:0;top:0;width:"+i.width+"px;height:"+i.height+"px";S.coordsize=i.coordsize;S.coordorigin=i.coordorigin;aR.v=af.format("m{0},{1}l{2},{1}",H(aP),H(aO),H(aP)+1);aR.textpathok=true;aN.width=i.width;aN.height=i.height;E.string=aQ+ai;E.on=true;R[az](E);R[az](aR);S[az](R);var aM=new am(E,S,i);aM.shape=R;aM.textpath=aR;aM.type="text";aM.attrs.text=aQ;aM.attrs.x=aP;aM.attrs.y=aO;aM.attrs.w=1;aM.attrs.h=1;T(aM,{font:h.font,stroke:"none",fill:"#000"});aM.setBox();i.canvas[az](S);return aM;};var aH=function(E,e){var i=this.canvas.style;this.width=N(E||this.width);this.height=N(e||this.height);i.width=this.width+"px";i.height=this.height+"px";i.clip="rect(0 "+this.width+"px "+this.height+"px 0)";this.coordsize=this.width+ae+this.height;var R=this.bottom;while(R){R.Group.coordsize=this.coordsize;R.attr(R.attrs);R=R.next;}return this;};D.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{!D.namespaces.rvml&&D.namespaces.add("rvml","urn:schemas-microsoft-com:vml");var Y=function(e){return D.createElement("<rvml:"+e+' class="rvml">');};}catch(X){var Y=function(e){return D.createElement("<"+e+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');};}var s=function(){var R=ag[aI](null,arguments),i=R.container,aQ=R.height,aR,E=R.width,aP=R.x,aO=R.y;if(!i){throw new Error("VML container not found.");}var aM={},aN=aM.canvas=D.createElement("div"),S=aN.style;E=N(E)||512;aQ=N(aQ)||342;aM.width=E;aM.height=aQ;aM.coordsize=E+ae+aQ;aM.coordorigin="0 0";aM.span=D.createElement("span");aM.span.style.cssText="position:absolute;left:-9999px;top:-9999px;padding:0;margin:0;line-height:1;display:inline;";aN[az](aM.span);S.cssText=af.format("width:{0}px;height:{1}px;position:absolute;clip:rect(0 {0}px {1}px 0)",E,aQ);if(i==1){D.body[az](aN);S.left=aP+"px";S.top=aO+"px";i={style:{width:E,height:aQ}};}else{i.style.width=E;i.style.height=aQ;if(i.firstChild){i.insertBefore(aN,i.firstChild);}else{i[az](aN);}}for(var e in aD){if(aD[J](e)){aM[e]=aD[e];}}au.call(aM,aM,af.fn);aM.top=aM.bottom=null;aM.raphael=af;return aM;};aD.clear=function(){this.canvas.innerHTML=ai;this.bottom=this.top=null;};aD.remove=function(){this.canvas.parentNode.removeChild(this.canvas);for(var e in this){delete this[e];}};}if({"Apple Computer, Inc.":1,"Google Inc.":1}[navigator.vendor]){aD.safari=function(){var e=this.rect(-99,-99,this.width+99,this.height+99);setTimeout(function(){e.remove();});};}else{aD.safari=function(){};}var W=(function(){if(D.addEventListener){return function(S,E,i,e){var R=function(aM){return i.call(e,aM);};S.addEventListener(E,R,false);return function(){S.removeEventListener(E,R,false);return true;};};}else{if(D.attachEvent){return function(aM,R,E,i){var S=function(aN){return E.call(i,aN||aj.event);};aM.attachEvent("on"+R,S);var e=function(){aM.detachEvent("on"+R,S);return true;};if(R=="mouseover"){aM.attachEvent("onmouseenter",S);return function(){aM.detachEvent("onmouseenter",S);return e();};}else{if(R=="mouseout"){aM.attachEvent("onmouseleave",S);return function(){aM.detachEvent("onmouseleave",S);return e();};}}return e;};}}})();for(var U=y[l];U--;){(function(e){am[aK][e]=function(i){if(af.is(i,"function")){this.events=this.events||{};this.events[e]=this.events[e]||{};this.events[e][i]=this.events[e][i]||[];this.events[e][i][d](W(this.shape||this.node,e,i,this));}return this;};am[aK]["un"+e]=function(i){var E=this.events;E&&E[e]&&E[e][i]&&E[e][i][l]&&E[e][i].shift()()&&!E[e][i][l]&&delete E[e][i];return this;};})(y[U]);}am[aK].hover=function(i,e){return this.mouseover(i).mouseout(e);};aD.circle=function(e,E,i){return I(this,e||0,E||0,i||0);};aD.rect=function(e,S,i,E,R){return at(this,e||0,S||0,i||0,E||0,R||0);};aD.ellipse=function(e,R,E,i){return Z(this,e||0,R||0,E||0,i||0);};aD.path=function(e){e&&!af.is(e,"string")&&!af.is(e[0],"array")&&(e+=ai);return o(af.format[aI](af,arguments),this);};aD.image=function(R,e,S,i,E){return m(this,R||"about:blank",e||0,S||0,i||0,E||0);};aD.text=function(e,E,i){return O(this,e||0,E||0,i||ai);};aD.set=function(e){arguments[l]>1&&(e=Array[aK].splice.call(arguments,0,arguments[l]));return new K(e);};aD.setSize=aH;am[aK].scale=function(aW,aV,R,E){if(aW==null&&aV==null){return{x:this._.sx,y:this._.sy,toString:function(){return this.x+ae+this.y;}};}aV=aV||aW;!+aV&&(aV=aW);var a0,aY,aZ,aX,bd=this.attrs;if(aW!=0){var aT=this.getBBox(),aQ=aT.x+aT.width/2,aM=aT.y+aT.height/2,bc=aW/this._.sx,ba=aV/this._.sy;R=(+R||R==0)?R:aQ;E=(+E||E==0)?E:aM;var aS=~~(aW/Math.abs(aW)),aP=~~(aV/Math.abs(aV)),a3=this.node.style,bf=R+(aQ-R)*aS*bc,be=E+(aM-E)*aP*ba;switch(this.type){case"rect":case"image":var aR=bd.width*aS*bc,a2=bd.height*aP*ba,aU=bd.r*aw(bc,ba),aO=bf-aR/2,S=be-a2/2;this.attr({width:aR,height:a2,x:aO,y:S,r:aU});break;case"circle":case"ellipse":this.attr({rx:bd.rx*bc,ry:bd.ry*ba,r:bd.r*aw(bc,ba),cx:bf,cy:be});break;case"path":var a5=V(bd.path),a6=true;for(var a8=0,a1=a5[l];a8<a1;a8++){var a4=a5[a8],aN=aB.call(a4[0]);if(aN=="M"&&a6){continue;}else{a6=false;}if(af.svg&&aN=="A"){a4[a5[a8][l]-2]*=bc;a4[a5[a8][l]-1]*=ba;a4[1]*=bc;a4[2]*=ba;a4[5]=+(aS+aP?!!+a4[5]:!+a4[5]);}else{for(var a7=1,a9=a4[l];a7<a9;a7++){a4[a7]*=(a7%2&&aN!="V")?bc:ba;}}}var e=L(a5),a0=bf-e.x-e.width/2,aY=be-e.y-e.height/2;a5[0][1]+=a0;a5[0][2]+=aY;this.attr({path:a5});break;}if(this.type in {text:1,image:1}&&(aS!=1||aP!=1)){if(this.transformations){this.transformations[2]="scale("[aF](aS,",",aP,")");this.node[r]("transform",this.transformations[an](ae));a0=(aS==-1)?-bd.x-(aR||0):bd.x;aY=(aP==-1)?-bd.y-(a2||0):bd.y;this.attr({x:a0,y:aY});bd.fx=aS-1;bd.fy=aP-1;}else{this.node.filterMatrix=" progid:DXImageTransform.Microsoft.Matrix(M11="[aF](aS,", M12=0, M21=0, M22=",aP,", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");a3.filter=(this.node.filterMatrix||ai)+(this.node.filterOpacity||ai);}}else{if(this.transformations){this.transformations[2]=ai;this.node[r]("transform",this.transformations[an](ae));bd.fx=0;bd.fy=0;}else{this.node.filterMatrix=ai;a3.filter=(this.node.filterMatrix||ai)+(this.node.filterOpacity||ai);}}bd.scale=[aW,aV,R,E][an](ae);this._.sx=aW;this._.sy=aV;}return this;};af.easing_formulas={linear:function(e){return e;},"<":function(e){return aA(e,3);},">":function(e){return aA(e-1,3)+1;},"<>":function(e){e=e*2;if(e<1){return aA(e,3)/2;}e-=2;return(aA(e,3)+2)/2;},backIn:function(i){var e=1.70158;return i*i*((e+1)*i-e);},backOut:function(i){i=i-1;var e=1.70158;return i*i*((e+1)*i+e)+1;},elastic:function(E){if(E==0||E==1){return E;}var i=0.3,e=i/4;return aA(2,-10*E)*Math.sin((E-e)*(2*Math.PI)/i)+1;},bounce:function(R){var i=7.5625,E=2.75,e;if(R<(1/E)){e=i*R*R;}else{if(R<(2/E)){R-=(1.5/E);e=i*R*R+0.75;}else{if(R<(2.5/E)){R-=(2.25/E);e=i*R*R+0.9375;}else{R-=(2.625/E);e=i*R*R+0.984375;}}}return e;}};var B={length:0},aE=function(){var aP=+new Date;for(var a0 in B){if(a0!="length"&&B[J](a0)){var a5=B[a0];if(a5.stop){delete B[a0];B[l]--;continue;}var aN=aP-a5.start,aY=a5.ms,aX=a5.easing,a1=a5.from,aU=a5.diff,R=a5.to,aT=a5.t,aW=a5.prev||0,aO=a5.el,S=a5.callback,aV={},E;if(aN<aY){var aM=af.easing_formulas[aX]?af.easing_formulas[aX](aN/aY):aN/aY;for(var aZ in a1){if(a1[J](aZ)){switch(Q[aZ]){case"number":E=+a1[aZ]+aM*aY*aU[aZ];break;case"colour":E="rgb("+[w(H(a1[aZ].r+aM*aY*aU[aZ].r)),w(H(a1[aZ].g+aM*aY*aU[aZ].g)),w(H(a1[aZ].b+aM*aY*aU[aZ].b))][an](",")+")";break;case"path":E=[];for(var a3=0,aS=a1[aZ][l];a3<aS;a3++){E[a3]=[a1[aZ][a3][0]];for(var a2=1,a4=a1[aZ][a3][l];a2<a4;a2++){E[a3][a2]=+a1[aZ][a3][a2]+aM*aY*aU[aZ][a3][a2];}E[a3]=E[a3][an](ae);}E=E[an](ae);break;case"csv":switch(aZ){case"translation":var aR=aU[aZ][0]*(aN-aW),aQ=aU[aZ][1]*(aN-aW);aT.x+=aR;aT.y+=aQ;E=aR+ae+aQ;break;case"rotation":E=+a1[aZ][0]+aM*aY*aU[aZ][0];a1[aZ][1]&&(E+=","+a1[aZ][1]+","+a1[aZ][2]);break;case"scale":E=[+a1[aZ][0]+aM*aY*aU[aZ][0],+a1[aZ][1]+aM*aY*aU[aZ][1],(2 in R[aZ]?R[aZ][2]:ai),(3 in R[aZ]?R[aZ][3]:ai)][an](ae);break;case"clip-rect":E=[];var a3=4;while(a3--){E[a3]=+a1[aZ][a3]+aM*aY*aU[aZ][a3];}break;}break;}aV[aZ]=E;}}aO.attr(aV);aO._run&&aO._run.call(aO);}else{(aT.x||aT.y)&&aO.translate(-aT.x,-aT.y);R.scale&&(R.scale=R.scale+ai);aO.attr(R);delete B[a0];B[l]--;aO.in_animation=null;af.is(S,"function")&&S.call(aO);}a5.prev=aN;}}af.svg&&aD.safari();B[l]&&setTimeout(aE);},w=function(e){return e>255?255:(e<0?0:e);},q=function(e,E){if(e==null){return{x:this._.tx,y:this._.ty};}this._.tx+=+e;this._.ty+=+E;switch(this.type){case"circle":case"ellipse":this.attr({cx:+e+this.attrs.cx,cy:+E+this.attrs.cy});break;case"rect":case"image":case"text":this.attr({x:+e+this.attrs.x,y:+E+this.attrs.y});break;case"path":var i=V(this.attrs.path);i[0][1]+=+e;i[0][2]+=+E;this.attr({path:i});break;}return this;};am[aK].animateWith=function(i,E,e,S,R){B[i.id]&&(E.start=B[i.id].start);return this.animate(E,e,S,R);};am[aK].onAnimation=function(e){this._run=e||null;return this;};am[aK].animate=function(R,e,aR,aX){if(af.is(aR,"function")||!aR){aX=aR||null;}var aS={},aT={},aU={};for(var aQ in R){if(R[J](aQ)){if(Q[J](aQ)){aS[aQ]=this.attr(aQ);(aS[aQ]==null)&&(aS[aQ]=h[aQ]);aT[aQ]=R[aQ];switch(Q[aQ]){case"number":aU[aQ]=(aT[aQ]-aS[aQ])/e;break;case"colour":aS[aQ]=af.getRGB(aS[aQ]);var aO=af.getRGB(aT[aQ]);aU[aQ]={r:(aO.r-aS[aQ].r)/e,g:(aO.g-aS[aQ].g)/e,b:(aO.b-aS[aQ].b)/e};break;case"path":var E=A(aS[aQ],aT[aQ]);aS[aQ]=E[0];aT[aQ]=E[1];aU[aQ]=[];for(var aN=0,aW=aS[aQ][l];aN<aW;aN++){aU[aQ][aN]=[0];for(var S=1,aP=aS[aQ][aN][l];S<aP;S++){aU[aQ][aN][S]=(aT[aQ][aN][S]-aS[aQ][aN][S])/e;}}break;case"csv":var aV=(R[aQ]+ai)[u](a),aM=(aS[aQ]+ai)[u](a);switch(aQ){case"translation":aS[aQ]=[0,0];aU[aQ]=[aV[0]/e,aV[1]/e];break;case"rotation":aS[aQ]=(aM[1]==aV[1]&&aM[2]==aV[2])?aM:[0,aV[1],aV[2]];aU[aQ]=[(aV[0]-aS[aQ][0])/e,0,0];break;case"scale":R[aQ]=aV;aS[aQ]=(aS[aQ]+ai)[u](a);aU[aQ]=[(aV[0]-aS[aQ][0])/e,(aV[1]-aS[aQ][1])/e,0,0];break;case"clip-rect":aS[aQ]=(aS[aQ]+ai)[u](a);aU[aQ]=[];var aN=4;while(aN--){aU[aQ][aN]=(aV[aN]-aS[aQ][aN])/e;}break;}aT[aQ]=aV;}}}}this.stop();this.in_animation=1;B[this.id]={start:R.start||+new Date,ms:e,easing:aR,from:aS,diff:aU,to:aT,el:this,callback:aX,t:{x:0,y:0}};++B[l]==1&&aE();return this;};am[aK].stop=function(){B[this.id]&&B[l]--;delete B[this.id];return this;};am[aK].translate=function(e,i){return this.attr({translation:e+" "+i});};am[aK][ao]=function(){return"Rapha\xebl\u2019s object";};af.ae=B;var K=function(e){this.items=[];this[l]=0;if(e){for(var E=0,R=e[l];E<R;E++){if(e[E]&&(e[E].constructor==am||e[E].constructor==K)){this[this.items[l]]=this.items[this.items[l]]=e[E];this[l]++;}}}};K[aK][d]=function(){var S,e;for(var E=0,R=arguments[l];E<R;E++){S=arguments[E];if(S&&(S.constructor==am||S.constructor==K)){e=this.items[l];this[e]=this.items[e]=S;this[l]++;}}return this;};K[aK].pop=function(){delete this[this[l]--];return this.items.pop();};for(var t in am[aK]){if(am[aK][J](t)){K[aK][t]=(function(e){return function(){for(var E=0,R=this.items[l];E<R;E++){this.items[E][e][aI](this.items[E],arguments);}return this;};})(t);}}K[aK].attr=function(E,aN){if(E&&af.is(E,"array")&&af.is(E[0],"object")){for(var e=0,aM=E[l];e<aM;e++){this.items[e].attr(E[e]);}}else{for(var R=0,S=this.items[l];R<S;R++){this.items[R].attr[aI](this.items[R],arguments);}}return this;};K[aK].animate=function(aM,E,aP,aO){(af.is(aP,"function")||!aP)&&(aO=aP||null);var e=this.items[l],R=e,aN=this,S;aO&&(S=function(){!--e&&aO.call(aN);});this.items[--R].animate(aM,E,aP||S,S);while(R--){this.items[R].animateWith(this.items[e-1],aM,E,aP||S,S);}return this;};K[aK].insertAfter=function(E){var e=this.items[l];while(e--){this.items[e].insertAfter(E);}};K[aK].getBBox=function(){var e=[],aN=[],E=[],S=[];for(var R=this.items[l];R--;){var aM=this.items[R].getBBox();e[d](aM.x);aN[d](aM.y);E[d](aM.x+aM.width);S[d](aM.y+aM.height);}e=aw[aI](0,e);aN=aw[aI](0,aN);return{x:e,y:aN,width:f[aI](0,E)-e,height:f[aI](0,S)-aN};};af.registerFont=function(i){if(!i.face){return i;}this.fonts=this.fonts||{};var R={w:i.w,face:{},glyphs:{}},E=i.face["font-family"];for(var aN in i.face){if(i.face[J](aN)){R.face[aN]=i.face[aN];}}if(this.fonts[E]){this.fonts[E][d](R);}else{this.fonts[E]=[R];}if(!i.svg){R.face["units-per-em"]=z(i.face["units-per-em"],10);for(var S in i.glyphs){if(i.glyphs[J](S)){var aM=i.glyphs[S];R.glyphs[S]={w:aM.w,k:{},d:aM.d&&"M"+aM.d[aC](/[mlcxtrv]/g,function(aO){return{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[aO]||"M";})+"z"};if(aM.k){for(var e in aM.k){if(aM[J](e)){R.glyphs[S].k[e]=aM.k[e];}}}}}}return i;};aD.getFont=function(aP,aQ,E,S){S=S||"normal";E=E||"normal";aQ=+aQ||{normal:400,bold:700,lighter:300,bolder:800}[aQ]||400;var aM=af.fonts[aP];if(!aM){var R=new RegExp("(^|\\s)"+aP[aC](/[^\w\d\s+!~.:_-]/g,ai)+"(\\s|$)","i");for(var e in af.fonts){if(af.fonts[J](e)){if(R.test(e)){aM=af.fonts[e];break;}}}}var aN;if(aM){for(var aO=0,aR=aM[l];aO<aR;aO++){aN=aM[aO];if(aN.face["font-weight"]==aQ&&(aN.face["font-style"]==E||!aN.face["font-style"])&&aN.face["font-stretch"]==S){break;}}}return aN;};aD.print=function(aR,aQ,aO,E,aV){var aM=this.set(),aP=(aO+ai)[u](ai),e=0,aU=ai,S;af.is(E,"string")&&(E=this.getFont(E));if(E){S=(aV||16)/E.face["units-per-em"];for(var aN=0,aS=aP[l];aN<aS;aN++){var R=aN&&E.glyphs[aP[aN-1]]||{},aT=E.glyphs[aP[aN]];e+=aN?(R.w||E.w)+(R.k&&R.k[aP[aN]]||0):0;aT&&aT.d&&aM[d](this.path(aT.d).attr({fill:"#000",stroke:"none",translation:[e,0]}));}aM.scale(S,S,0,aQ).translate(aR,(aV||16)/2);}return aM;};af.format=function(E){var i=af.is(arguments[1],"array")?[0][aF](arguments[1]):arguments,e=/\{(\d+)\}/g;E&&af.is(E,"string")&&i[l]-1&&(E=E[aC](e,function(S,R){return i[++R]==null?ai:i[R];}));return E||ai;};af.ninja=function(){var E=aj.Raphael,i;if(k.was){aj.Raphael=k.is;}else{try{delete aj.Raphael;}catch(R){aj.Raphael=i;}}return E;};af.el=am[aK];return af;})();
(function() {


  /**
  *
  */
  debug = function(message) {
    window.console && console.log && console.log(message);
  };


  periodicallyCall = function(_fun,context,intervalms) {
      setTimeout(function() {
        _fun.call(context);
        periodicallyCall(_fun,context,args,intervalms);
      }, intervalms);


  };

  /**
  *
  */
  createCookie = function(name,value,days) {
    if (!days) {
      days = 14;
    }
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    document.cookie = name+"="+value+expires+"; path=/";
  };


  /**
  *
  */
  readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  };


  /**
  *
  */
  eraseCookie = function (name) {
    createCookie(name,"",-1);
  };


  /**
  *
  */
  if (window.WireIt && window.WireIt.Layer) {
    WireIt.Layer.prototype.setOptions = function(options) {
      var defaults = {
        className: 'WireIt-Layer',
        parentEl: document.body,
        containers: [],
        wires: [],
        layerMap: false,
        enableMouseEvents: true
      };
      defaults = $H(defaults);
      this.options = defaults.merge($H(options)).toObject();
      debug("loaded defaults for wire-it layer");
      debug(this.options.parentEl);
    };
  };

  /**
  * Wraps buffer to selected number of characters using string break char
  * Modified from: http://phpjs.org/functions/wordwrap (License: MIT || GPL)
  * @method wordWrap(m,b,c)
  * @args
  *   wrap_width = how many characters to wrap at,
  *   break_character = character to use for line breaks.
  *   cut_words = whether to allow splitting of words. (does this work)
  *
  */
  String.prototype.wordWrap = function(wrap_width, break_character, cut_words){
      var m = ((arguments.length >= 1) ? arguments[0] : 75   );
      var b = ((arguments.length >= 3) ? arguments[1] : "\n" );
      var c = ((arguments.length >= 4) ? arguments[2] : false);

      var i, j, s, r = this.split("\n");
      if(m > 0) for(i in r){
          for(s = r[i], r[i] = ""; s.length > m;
              j = c ? m : (j = s.substr(0, m).match(/\S*$/)).input.length - j[0].length
              || m,
              r[i] += s.substr(0, j) + ((s = s.substr(j)).length ? b : "")
          );
          r[i] += s;
      }
      return r.join("\n");
  };


})();
(function () {

  MySystem = typeof(MySystem) != 'undefined' ? MySystem : function() {};


  MySystem.defaultFont = {
    "font-weight": 'bold',
    "font-family": 'helvetica, arial, sans-serif',
    fill: '#000000',
    opacity: 1
  }


  Raphael.fn.zoomIn = function(x,y,size) {
    var strokeSize = size * 0.2;
    var radius = size / 2.0;
    strokeSize = strokeSize < 1 ? 1 : strokeSize;
    var attributes = {
      fill: "#EEFFEE",
      stroke: "#004400",
      "stroke-width": strokeSize,
      opacity: 0.7,
      cx: x,
      cy: y
    }
    var lineExtent = radius - (strokeSize);
    lineExtent = lineExtent < 1 ? 1 : lineExtent;
    var zoom = this.set();
    zoom.push(this.circle(x,y,radius));
    zoom.push(   this.path("M" + x      + " " + (y+lineExtent)  + "L" +  x     + " " + (y-lineExtent )));
    zoom.push(   this.path("M" + (x+lineExtent)  + " " +  y     + "L" + (x-lineExtent)  + " " +  y   ));
    zoom.attr(attributes);
    return zoom;
  };

  Raphael.fn.zoomOut = function(x,y,size) {
    var strokeSize = size * 0.2;
    var radius = size / 2.0;
    strokeSize = strokeSize < 1 ? 1 : strokeSize;
    var attributes = {
      fill: "#EEFFEE",
      stroke: "#004400",
      "stroke-width": strokeSize,
      opacity: 0.7,
      cx: x,
      cy: y
    }
    var lineExtent = radius - (strokeSize);
    lineExtent = lineExtent < 1 ? 1 : lineExtent;
    var zoom = this.set();
    zoom.push(this.circle(x,y,radius));
    zoom.push(   this.path("M" + (x+lineExtent)  + " " +  y     + "L" + (x-lineExtent)  + " " +  y   ));
    zoom.attr(attributes);
    return zoom;
  };


  MySystem.arrow_path = function(startx,starty,endx,endy,len,angle) {
    var theta = Math.atan2((endy-starty),(endx-startx));
    var baseAngleA = theta + angle * Math.PI/180;
    var baseAngleB = theta - angle * Math.PI/180;
    var tipX = endx + len * Math.cos(theta);
    var tipY = endy + len * Math.sin(theta);
    var baseAX = endx - len * Math.cos(baseAngleA);
    var baseAY = endy - len * Math.sin(baseAngleA);
    var baseBX = endx - len * Math.cos(baseAngleB);
    var baseBY = endy - len * Math.sin(baseAngleB);
    var pathData = " M " + tipX      + " " + tipY +
                   " L " + baseAX  + " " + baseAY +
                   " L " + baseBX  + " " + baseBY +
                   " Z ";
    return pathData;
  };


  Raphael.fn.wire = function (wire, scale) {
      var line;
      var obj1 = wire.sourceNode.rep;
      var obj2 = wire.targetNode.rep;
      var name = wire.name;
      if (wire.rep && wire.rep.from && wire.rep.to) {
          line = wire.rep;
          obj1 = line.from;
          obj2 = line.to;
      }
      var bb1 = obj1.nodeImage.getBBox();
      var bb2 = obj2.nodeImage.getBBox();
      var border = 10;
      var p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
          {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + border},
          {x: bb1.x - border, y: bb1.y + bb1.height / 2},
          {x: bb1.x + bb1.width + border, y: bb1.y + bb1.height / 2},
          {x: bb2.x + bb2.width / 2, y: bb2.y - border},
          {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + border},
          {x: bb2.x - border, y: bb2.y + bb2.height / 2},
          {x: bb2.x + bb2.width + border, y: bb2.y + bb2.height / 2}];
      var d = {}, dis = [];
      for (var i = 0; i < 4; i++) {
          for (var j = 4; j < 8; j++) {
              var dx = Math.abs(p[i].x - p[j].x),
                  dy = Math.abs(p[i].y - p[j].y);
              if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                  dis.push(dx + dy);
                  d[dis[dis.length - 1]] = [i, j];
              }
          }
      }
      var res=[0,0];
      if (dis.length == 0) {
          res = [0, 4];
      } else {
          res = d[Math.min.apply(Math, dis)];
          if (!res) {
            res = [0,4];
          }
      }
      var x1 = p[res[0]].x,
          y1 = p[res[0]].y,
          x4 = p[res[1]].x,
          y4 = p[res[1]].y,
          dx = Math.max(Math.abs(x1 - x4) / 2, 10),
          dy = Math.max(Math.abs(y1 - y4) / 2, 10),
          x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
          y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
          x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
          y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
      var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");

      if (line && line.line) {
          var lineWidth = line.lineWidth * scale;
          line.arrow.attr({path: MySystem.arrow_path(x3,y3,x4,y4, lineWidth * 1.5,50)});
          line.line.attr({path: path, "stroke-width": lineWidth, fill: "none"});
          var fontSize = 10 * scale;
          line.label.attr({x: (x1 + x4)/2, y: (y1 + y4)/2, "font-size": fontSize + "px"});
          var centerX = (x1 + x4)/2;
          var centerY = (y1 + y4)/2;
          var wordWidth = name.length * fontSize;
          var textBoxX = centerX - wordWidth / 2;
          var textBoxY = centerY;
          line.textBox.attr({x: textBoxX, y: textBoxY - fontSize, width: wordWidth, height: fontSize*2})
      } else {
          var color = typeof line == "string" ? line : "#000";
          var stroke_width = (wire.width || 3)* scale;
          var fontSize = 10 * scale;

          var arrow_path = MySystem.arrow_path(x3,y3,x4,y4, stroke_width * 1.5,50);
          var line = this.path(path).attr({stroke: wire.color, fill: "none","stroke-width": stroke_width});
          var arrow = this.path(arrow_path).attr({fill: wire.color, stroke: "none"});
          var centerX = (x1 + x4)/2;
          var centerY = (y1 + y4)/2;
          var wordWidth = name.length * fontSize;
          var textBoxX = centerX - wordWidth / 2;
          var textBoxY = centerY;
          var textBox = this.rect(textBoxX,textBoxY - fontSize, wordWidth, fontSize*2);
          textBox.attr({fill: "#FFFFFF", stroke: "none", opacity: 0.65});
          var label = this.text((x1 + x4)/2,(y1 + y4)/2, name).attr({"font-size": fontSize + "px"})
          label.attr(MySystem.defaultFont);
          return {
              line: line,
              arrow: arrow,
              label: label,
              textBox: textBox,
              lineWidth: stroke_width,
              from: obj1,
              to: obj2
          };
      }
  };




  Raphael.fn.Node = function (node, scale) {
    var label;
    var nodeImage;
    var offsetX = 0;
    var offsetY = 0;
    if (node.rep) {
      var nodeImage = node.rep.nodeImage;
      var label = node.rep.label;
      offsetX = node.rep.offsetX;
      offsetY = node.rep.offsetY;
    }
    else {
      node.border = node.border ? node.border : 5;
      if (!node.loaded) {
        var image = new Image();
        image.src = node.icon;
        node.width = image.width;
        node.height = image.height;
        node.loaded = true;
      }
      var nodeImage = this.image(node.icon,node.x,node.y,node.width || 30,node.height || 30);
      nodeImage.mouseDown = function(e) {
        node.rep.offsetX = e.clientX;
        node.rep.offsetY = e.clientY;
        e.preventDefault && e.preventDefault();
      }
      var label = this.text(node.x,node.y,node.name).attr({fill: '#004400',opacity: 0.8});
      label.attr(MySystem.defaultFont);
    }

    var imageY =  (node.y * scale) + offsetY;
    var imageX =  (node.x * scale) + offsetX;
    var labelY =  imageY + (node.height * scale) +  (node.border * scale);
    var labelX =  imageX + (node.width  *scale / 2.0);
    nodeImage.scale(scale,scale);
    nodeImage.attr({x:imageX, y:imageY});
    var fontSize = 12 * scale;
    label.attr({x: labelX, y:labelY, "font-size": fontSize + "px"});
    return {
        nodeImage: nodeImage,
        label: label,
        offsetX: offsetX,
        offsetY: offsetY
    };
  };



  MySystem.Node = function() {
    this.terminals = [];
    this.icon = [];
    this.x = 0;
    this.y = 0;
  };


  MySystem.Node.prototype.terminal = function(name) {
    var returnVal = null;
    this.terminals.each(function(term){
      if (term.name == name) {
        returnVal = term;
      }
    });
    return returnVal;
  };


  MySystem.Node.importJson = function(jsonText,contentBaseUrl) {
    var objs = eval(jsonText);
    var nodes = [];
    var wires = [];
    if (objs) {
      objs[0].containers.each(function(container) {
        var node = new MySystem.Node();
        if (typeof(contentBaseUrl) != 'undefined') {
          node.icon = contentBaseUrl + "/" + container.icon;
        }
        else {
          node.icon = container.icon;
        }
        node.x = (container.position[0].replace("px","")) / 1;
        node.y = (container.position[1].replace("px","")) / 1;
        node.name = container.name;

        node.terminals = container.terminals;
        nodes.push(node);
      });
    }
    return nodes;
  };



  MySystem.Wire = function() {
    this.source = null;
    this.target = null;
    this.x = 0;
    this.y = 0;
  };

  MySystem.Wire.importJson = function(jsonText,nodes) {
    var objs = eval(jsonText);
    var wires = [];
    if (objs) {
      objs[0].wires.each(function(w) {
        var wire = new MySystem.Wire();
        wire.src = w.src;
        wire.sourceNode = nodes[w.src.moduleId];
        wire.sourceTerminal = wire.sourceNode.terminal(w.src.terminal);

        wire.tgt = w.tgt;
        wire.targetNode = nodes[w.tgt.moduleId];
        wire.targetTerminal = wire.targetNode.terminal(w.tgt.terminal);

        wire.options = w.options;
        wire.fields = w.options.fields;
        wire.width = wire.fields.width;
        wire.name = wire.fields.name;
        wire.color = w.options.color;
        wire.color.name = wire.fields.color;

        wires.push(wire);
      });
    }
    return wires;
  };


  MySystemPrint = function(_json,dom_id,contentBaseUrl) {
    this.data = _json;
    this.name = "my print";
    this.domId = dom_id;
    this.container = $(this.domId);
    this.scale = typeof(scale_factor) != 'undefined' ? scale_factor : 1;
    this.width = this.container.width;
    this.height = this.container.height;

    this.nodes = MySystem.Node.importJson(_json,contentBaseUrl);
    this.wires = MySystem.Wire.importJson(_json,this.nodes);

    this.autoscale();

    this.graphics = Raphael(this.domId,this.width,this.height);
    var self = this;

    this.sizeChangeDetector = function() {
      var width = self.container.getWidth();
      var height = self.container.getHeight();
      debug("calling sizeChange detector");
      if (width != self.width || height != self.height) {
        self.redraw();
      }
    };
    this.redrawInterval = setInterval(self.sizeChangeDetector, 1150);

    this.nodes.each(function(node) {
      self.drawNode(node);
    });

    this.wires.each(function(wire) {
      self.drawWire(wire);
    });

    this.container.observe('mouseup', function(e){
      self.mouse_down = false;
    });

    this.container.observe('mousedown',function(e){
      self.mouse_down = true;
      self.last_x = e.clientX;
      self.last_y = e.clientY;
    });

    this.container.observe('mousemove', function(e){
      if (self.mouse_down) {
        var dx = e.clientX - self.last_x;
        var dy = e.clientY- self.last_y;
        self.nodes.each(function(node) {
          node.rep.offsetX += dx;
          node.rep.offsetY += dy;
          self.redraw();
        });
        self.last_x = e.clientX;
        self.last_y = e.clientY;
      }
    });

    var self = this;
    this.zoomIn = this.graphics.zoomIn(20,20,18);
    this.zoomOut = this.graphics.zoomOut(48,20,18);

    this.zoomIn.mouseover(function(e) {
      self.zoomIn.scale(1.25,1.25);
    });
    this.zoomIn.mouseout(function(e) {
      self.zoomIn.scale(1,1);
    });
    this.zoomIn.click(function(e) {
      self.scale = self.scale + 0.2;
      self.redraw();
    });

    this.zoomOut.mouseover(function(e) {
      self.zoomOut.scale(1.25,1.25);
    });
    this.zoomOut.mouseout(function(e) {
      self.zoomOut.scale(1,1);
    });
    this.zoomOut.click(function(e) {
      self.scale = self.scale - 0.2;
      self.scale = self.scale > 0 ? self.scale : 0.05;
      self.redraw();
    });
    self.redraw();
  };


  MySystemPrint.prototype.graphDimensions = function() {
    var maxX = 0;
    var maxY = 0;
    this.nodes.each(function (node){
      maxX = maxX < node.x ? node.x : maxX;
      maxY = maxY < node.y ? node.y : maxY;
    });
    return {
      width: maxX,
      height: maxY
    };
  }


  MySystemPrint.prototype.autoscale = function() {
    var container = $(this.domId);
    var width = container.getWidth();
    var height = container.getHeight();
    var graphDimensions = this.graphDimensions();
    var self = this;
    var margin = 80;
    self.width = graphDimensions.width + margin;
    self.height = graphDimensions.height + margin;
    self.scale = 1;
    if (self.width) {
      var widthRatio = width / self.width;
      var widthDiff = Math.abs(width - self.width);
      var heightRatio = height / self.height;
      var heightDiff = Math.abs(height - self.height);
      var scalar = heightDiff > widthDiff ? widthRatio : heightRatio;
      self.scale = self.scale * scalar;
    }
    self.width = width;
    self.height = height;
  };

  MySystemPrint.prototype.redraw = function() {
    var container = $(this.domId);
    if (typeof container == "undefined" || container == null) {
      clearInterval(this.redrawInterval);
      return;
    }
    var width = container.getWidth();
    var height = container.getHeight();
    var self = this;
    if (self.width) {
      var widthRatio = width / self.width;
      var widthDiff = Math.abs(width - self.width);
      var heightRatio = height / self.height;
      var heightDiff = Math.abs(height - self.height);
      var scalar = heightDiff > widthDiff ? widthRatio : heightRatio;
      self.scale = self.scale * scalar;
    }
    self.width = width;
    self.height = height;
    this.graphics.setSize(width, height);
    this.nodes.each(function(node) {
      self.graphics.Node(node,self.scale);
    });
    this.wires.each(function(wire){
      self.graphics.wire(wire,self.scale);
    })
  };

  MySystemPrint.prototype.drawNode = function(node) {
    node.rep = this.graphics.Node(node,this.scale);
  };

  MySystemPrint.prototype.drawWire = function(wire) {
    wire.rep = this.graphics.wire(wire,this.scale);
  };


}());
