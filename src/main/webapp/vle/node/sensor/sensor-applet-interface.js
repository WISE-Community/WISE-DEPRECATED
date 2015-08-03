!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.sensorAppletInterface=e():"undefined"!=typeof global?global.sensorAppletInterface=e():"undefined"!=typeof self&&(self.sensorAppletInterface=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var miniClass = require('./mini-class');
var SensorApplet = require('./sensor-applet');

module.exports = {
  GoIO: miniClass.extendClass(SensorApplet, {
    deviceType: 'golink',
    deviceSpecificJars: [ 'sensor-vernier', 'goio-jna']
  }),

  LabQuest: miniClass.extendClass(SensorApplet, {
    deviceType: 'labquest',
    deviceSpecificJars: [ 'sensor-vernier', 'labquest-jna']
  })
};

},{"./mini-class":4,"./sensor-applet":6}],2:[function(require,module,exports){
'use strict';

var util = require('util');

function errorConstructor(message) {
  /*jshint validthis: true*/
  Error.call(this); //super constructor
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object
  }

  this.name = this.constructor.name; //set our function’s name as error name.
  this.message = message; //set the error message
}

function JavaLoadError() {
  errorConstructor.apply(this, arguments);
}
util.inherits(JavaLoadError, Error);

function AppletInitializationError() {
  errorConstructor.apply(this, arguments);
}
util.inherits(AppletInitializationError, Error);

function SensorConnectionError() {
  errorConstructor.apply(this, arguments);
}
util.inherits(SensorConnectionError, Error);

function AlreadyReadingError() {
  errorConstructor.apply(this, arguments);
}
util.inherits(AlreadyReadingError, Error);

module.exports = {
  JavaLoadError: JavaLoadError,
  AppletInitializationError: AppletInitializationError,
  AlreadyReadingError: AlreadyReadingError,
  SensorConnectionError: SensorConnectionError
};

},{"util":11}],3:[function(require,module,exports){
// This file is built by the update-timestamp.rb script do not edit it directly
module.exports = "20140417.203729";
},{}],4:[function(require,module,exports){
'use strict';

/**

  mini-class.js

  Minimalist classical-OO style inheritance for JavaScript.
  Adapted from CoffeeScript and SproutCore.

  Richard Klancer, 7-23-2012
*/

function mixin(dest, src) {
  var hasProp = {}.hasOwnProperty,
      key;

  for (key in src) {
    if (hasProp.call(src, key)) {
      dest[key] = src[key];
    }
  }
}

//
// Remember that "classes" are just constructor functions that create objects, and that the
// constructor function property called `prototype` is used to define the prototype object
// (aka the __proto__ property) which will be assigned to instances created by the constructor.
// Properties added to the prototype object of a constructor effectively become the instance
// properties/methods of objects created with that constructor, and properties of the prototype
// of the prototype are effectively "superclass" instance properties/methods.
//
// See http://javascriptweblog.wordpress.com/2010/06/07/understanding-javascript-prototypes/
//

/**
  Assuming Child, Parent are classes (i.e., constructor functions):
    1. Copies the properties of the Parent constructor to the Child constructor (These can be
       considered "class properties"/methods, shared among all instances of a class.)
    2. Adds Parent's prototype to Child's prototype chain.
    3. Adds Parent's prototype to the '__super__' property of Child.
*/
function extend(Child, Parent) {

  // First, copy direct properties of the constructor object ("class properties") from Parent to
  // Child.
  mixin(Child, Parent);

  // First step in extending the prototype chain: make a throwaway constructor, whose prototype
  // property is the same as the Parent constructor's prototype property. Objects created by
  // calling `new PrototypeConstructor()` will have the *same* prototype object as objects created
  // by calling `new Parent()`.
  function PrototypeConstructor() {
    this.constructor = Child;
  }
  PrototypeConstructor.prototype = Parent.prototype;

  // Now use PrototypeConstructor to extend the prototype chain by one link.
  // That is, use PrototypeConstructor to make a new *object* whose prototype object
  // (__proto__ property) is Parent.prototype, and assign the object to the Child constructor's
  // prototype property. This way, objects created by calling "new Child()"
  // will have a prototype object whose prototype object in turn is Parent.prototype.
  Child.prototype = new PrototypeConstructor();

  // Assign the prototype used by objects created by Parent to the __super__ property of Child.
  // (This property can be accessed within a Child instance as `this.constructor.__super__`.)
  // This allows a Child instance to look "up" the prototype chain to find instances properties
  // defined in Parent that are overridden in Child (i.e., defined on Child.prototype)
  Child.__super__ = Parent.prototype;
}

/**
  Defines a "class" whose instances will have the properties defined in `prototypeProperties`:
    1. Creates a new constructor, which accepts a list of properties to be copied directly onto
       the instance returned by the constructor.
    2. Adds the properties in `prototypeProperties` to the prototype object shared by instances
       created by the constructor.
*/
function defineClass(prototypeProperties) {
  function NewConstructor(instanceProperties) {
    mixin(this, instanceProperties);
  }
  mixin(NewConstructor.prototype, prototypeProperties);
  return NewConstructor;
}

/**
  Given ParentClass, return a new class which is ParentClass extended by childPrototypeProperties
*/
function extendClass(ParentClass, childPrototypeProperties) {
  function ChildConstructor(instanceProperties) {
    mixin(this, instanceProperties);
  }
  // Extend ParentClass first so childPrototypeProperties override anything defined in ParentClass
  extend(ChildConstructor, ParentClass);
  mixin(ChildConstructor.prototype, childPrototypeProperties);
  return ChildConstructor;
}

module.exports = {
  defineClass: defineClass,
  extendClass: extendClass,
  mixin: mixin
};
},{}],5:[function(require,module,exports){
'use strict';

/**
  Basic event-emitter functionality to mixin to other classes.

  TODO: needs explicit tests (is currently *implicitly* tested by sensor-applet_spec).
*/
module.exports = {

  on: function(evt, cb) {
    if (!this._ee_listeners) {
      this._ee_listeners = {};
    }
    if (!this._ee_listeners[evt]) {
      this._ee_listeners[evt] = [];
    }

    this._ee_listeners[evt].push(cb);
  },

  emit: function(evt) {
    var args = arguments.length > 1 ? [].slice.call(arguments, 1) : [];

    if (this._ee_listeners && this._ee_listeners[evt]) {
      for (var i = 0, len = this._ee_listeners[evt].length; i < len; i++) {
        this._ee_listeners[evt][i].apply(null, args);
      }
    }
  },

  removeListener: function(evt, listener) {
    if (this._ee_listeners && this._ee_listeners[evt]) {
      for (var i = 0, len = this._ee_listeners[evt].length; i < len; i++) {
        if (this._ee_listeners[evt][i] === listener) {
          this._ee_listeners[evt].splice(i, 1);
        }
      }
    }
  },

  removeListeners: function(evt) {
    if (!evt) {
      this._ee_listeners = {};
    } else {
      if (this._ee_listeners) {
        this._ee_listeners[evt] = [];
      }
    }
  }
};

},{}],6:[function(require,module,exports){
'use strict';

var miniClass = require('./mini-class');
var EventEmitter = require('./mini-event-emitter');
var errors = require('./errors');
var jarsTimestamp = require('./jars-timestamp');
var SensorApplet;

function AppletWaiter(){
  var _timer = null,
      _opts = null;

  this.handleCallback = function (){
    console.log("handling callback from applet");
    // this is asynchronous because it will be called by Java
    setTimeout(function (){
      if (_timer === null) {
        console.log("applet called callback after timer expired");
        return;
      }
      window.clearInterval(_timer);
      _timer = null;
      _opts.success();
    }, 5);
  };

  this.wait = function(options){
    var attempts = 0,
        maxAttempts = options.times;

    _opts = options;

    _timer = window.setInterval(function() {
      attempts++;

      if (attempts > maxAttempts) {
        // failure
        window.clearInterval(_timer);
        _timer = null;
        options.fail();
      }
    }, options.interval);
  };
}

/**
  events:
    data
    deviceUnplugged
    sensorUnplugged

  states:
    not appended
    test applet appended
    appended
    applet ready
    stopped
    started

  api methods:
    getState          useful for tracking initialization
    append(callback)  initialize applet, checking for Java with test applet
    readSensor        read a single value
    start             start a collection
    stop              stop collection
    remove            remove applet

*/
SensorApplet = miniClass.defineClass({
  // Before appending the applet, set this value with the path to an object that will receive applet callbacks.
  listenerPath: '',

  // Before appending the applet this should be set to a array of definitions from
  // senor-applet/sensor-definitions.js
  // FIXME: these should be updated to be device independent
  sensorDefinitions: null,

  // Before appending the applet, set this to the path or URL where jars can be found
  codebase: '',

  // supported values are:
  //  "labquest"
  //  "golink"
  deviceType: '',

  appletId:     'sensor-applet',
  classNames:   'applet sensor-applet',

  jars:     ['jna', 'sensor', 'sensor-applets'],

  deviceSpecificJarUrls: [],

  code:         'org.concord.sensor.applet.SensorApplet',

  testAppletReadyInterval: 100,

  getArchiveValue: function(jars) {
    var jarUrls = [];
    for(var i=0; i<jars.length; i++){
      jarUrls[i] = jars[i] + '.jar';
    }
    return jarUrls.join(', ');
  },

  getHTML: function() {
    /*jshint indent: false*/
    var allJars = this.jars.concat(this.deviceSpecificJars);

    return [
     '<applet ',
       'id="',       this.appletId, '" ',
       'class="',    this.classNames, '" ',
       'archive="',  this.getArchiveValue(allJars), '" ',
       'code="',     this.code,             '" ',
       'codebase="', this.codebase, '/', jarsTimestamp, '" ',
       'width="1px" ',
       'height="1px" ',
       'MAYSCRIPT="true" ',
     '>',
        '<param name="MAYSCRIPT" value="true" />',
        '<param name="evalOnInit" value="' + this.listenerPath + '.appletIsReadyCallback()" />',
        '<param name="permissions" value="all-permissions" />',
        '<param name="java_arguments" value="-Djnlp.packEnabled=true"/>',
      '</applet>'
    ].join('');
  },

  getTestAppletHTML: function() {
    /*jshint indent: false*/
    return [
     '<applet ',
       'id="',       this.appletId,         '-test-applet" ',
       'class="applet test-sensor-applet" ',
       'code="org.concord.sensor.applet.DetectionApplet" ',
       'archive="', this.getArchiveValue(['sensor-applets']), '" ',
       'codebase="', this.codebase, '/', jarsTimestamp, '" ',
       'width="150px" ',
       'height="150px" ',
       'style="position: absolute; ',
              'left: ' + ($('body').width() / 2 - 75) +'px; ',
              'top: ' + ($('body').height() / 2 - 75) +'px;" ',
       'MAYSCRIPT="true" ',
     '>',
        '<param name="MAYSCRIPT" value="true" />',
        '<param name="evalOnInit" value="' + this.listenerPath + '.testAppletIsReadyCallback()" />',
        '<param name="permissions" value="all-permissions" />',
        '<param name="java_arguments" value="-Djnlp.packEnabled=true"/>',
      '</applet>'
    ].join('');
  },

  /**
    Passes true to the callback if the correct device type is connected.
  */
  isSensorConnected: function(callback) {
    var self = this, nextCallback, nextCallbackIdx;
    setTimeout(function() {
      nextCallback = function(connected) {
        // Note this appears only to return a meaningful result when first called. After that, it
        // returns the same value for a given deviceType, even if the device has been unplugged from
        // the USB port.
        if(!connected) {
          callback.call(self, false);
        } else {
          nextCallback = function() {
            var attachedSensors = JSON.parse(self.appletInstance.getCachedAttachedSensors());
            if (attachedSensors) {
              // FIXME we should use the applet configure method to check if the right sensors are attached
              // instead of doing this comparison here
              // For now this is skipped if there is more than one sensorDefinition
              if(self.sensorDefinitions.length === 1) {
                for (var i = 0; i < attachedSensors.length; i++) {
                  if (self.appletInstance.getTypeConstantName(attachedSensors[i].type) ===
                        self.sensorDefinitions[0].typeConstantName) {
                    callback.call(self, true);
                    return;
                  }
                }
                callback.call(self, false);
              } else {
                callback.call(self, true);
              }
            } else {
              callback.call(self, false);
            }
          };
          nextCallbackIdx = self.registerCallback(nextCallback);
          self.appletInstance.getAttachedSensors(self.deviceType, ""+nextCallbackIdx);
        }
      };
      nextCallbackIdx = self.registerCallback(nextCallback);
      self.appletInstance.isInterfaceConnected(self.deviceType, ""+nextCallbackIdx);
    });
  },

  _state: 'not appended',

  getState: function() {
    return this._state;
  },

  /**
    Append the applet to the DOM, and call callback when either:

      (1) The applet is configured and ready, with the correct device attached (it is ready to
          start collecting data immediately). The SensorApplet instance will be in the 'stopped'
          state.

      or:

      (2) An error occurs in the initialization process. An error object will be passed as the
          first argument to the callback (Node.js style).

      Currently, we detect three kinds of errors:

        * The Java plugin does not appear to be working (we time out waiting for a callback from
          our test applet). In this case, application code may want to remove the applet and try
          calling 'append' again later.

        * The sensor applet was appended, but never initializes (we time out waiting for a callback
          from the sensor applet).  In this case, application code may want to remove the applet
          and try calling 'append' again later.

        * The sensor applet reports that the wrong sensor type is attached. In this case,
          the applet is known to be loaded, and the application code may want to notify the user,
          and call 'initializeSensor' when the user indicates the sensor is plugged in. If
          If the callback is called with a null argument, the applet is ready to collect data.
  */
  append: function($loadingParent, callback) {
    if (this.getState() !== 'not appended') {
      throw new Error("Can't call append() when sensor applet has left 'not appended' state");
    }
    console.log("appending test applet");
    this.$testAppletContainer = this._appendHTML(this.appletId + "-test-applet-container",
                                                 this.getTestAppletHTML(),
                                                 $loadingParent);
    this._state = 'test applet appended';
    this._waitForTestApplet();
    this._appendCallback = callback;
  },

  _appendHTML: function(containerId, html, $parent) {
    var appletContainer = $('#' + containerId );

    if(!appletContainer.length){
      appletContainer = $("<div id='" + containerId + "'/>").appendTo($parent);
    }

    // using .append() actually creates some sort of internal reference to the applet,
    // which can cause problems calling applet methods later. Using .html() seems to avoid this.
    appletContainer.html(html);
    return appletContainer;
  },

  _testAppletWaiter: new AppletWaiter(),
  // this will be called by the test applet once it is initialized
  testAppletIsReadyCallback: function () {
    this._testAppletWaiter.handleCallback();
  },

  _waitForTestApplet: function() {
    var self = this;
    this._testAppletWaiter.wait({
      times: 30,
      interval: 1000,
      success: function() {
        self.$appletContainer = self._appendHTML(self.appletId + "-container",
                                                 self.getHTML(),
                                                 $('body'));
        self._state = 'appended';
        self._waitForApplet();
      },
      fail: function () {
        self._appendCallback(new errors.JavaLoadError("Timed out waiting for test applet to initialize."));
      }
    });
  },

  _appletWaiter: new AppletWaiter(),
  // this will be called by the applet once it is initialized
  appletIsReadyCallback: function () {
    this._appletWaiter.handleCallback();
  },

  _waitForApplet: function() {
    var self = this;
    this._appletWaiter.wait({
      times: 30,
      interval: 1000,
      success: function() {
        var requests = [];
        // remove test applet
        self.$testAppletContainer.html("");
        if (self.getState() === 'appended') {
          self._state = 'applet ready';
        }

        self.appletInstance = $('#'+self.appletId)[0];

        for(var i=0; i<self.sensorDefinitions.length; i++){
          // Get a SensorRequest object for this measurement type
          requests[i] =
            self.appletInstance.getSensorRequest(self.sensorDefinitions[i].measurementType);
        }

        // Try to initialize the sensor for the correct device and measurement type (e.g., goio,
        // distance). Java will callback to initSensorInterfaceComplete on success or error.
        self.appletInstance.initSensorInterface(self.listenerPath, self.deviceType, requests);
      },
      fail: function () {
        self._appendCallback(new errors.AppletInitializationError("Timed out waiting for sensor applet to initialize."));
      }
    });
  },

  // callback: function(error, values) {}
  readSensor: function(callback) {
    var self = this;
    if (this.getState() === 'reading sensor') {
      console.log("Already reading sensor in another thread...");
      callback.call(this, new errors.AlreadyReadingError("Already reading sensor in another thread"), null);
      return;
    }

    if (this.getState() !== 'stopped') {
      callback.call(this, new Error("Tried to read the sensor value from non-stopped state '" + this.getState() + '"'), null);
      return;
    }

    // because of IE multi threading applet behavior we need to track our state before calling
    // the applet
    this._state = 'reading sensor';
    this.isSensorConnected(function(connected) {
      if (connected) {
        var valuesCallback = function(values) {
          self._state = 'stopped';
          if (!values || values.length === 0) {
            callback.call(self, new Error("readSensor: no sensor values to report"), null);
          } else {
            callback.call(self, null, values);
          }
        };
        var callbackIdx = self.registerCallback(valuesCallback);
        self.appletInstance.getConfiguredSensorsValues(self.deviceType, ""+callbackIdx);
      } else {
        self._state = 'stopped';
        callback.call(self, new errors.SensorConnectionError("readSensor: sensor is not connected"), null);
      }
    });
  },

  // callback: function(error, isStarted) {}
  start: function(callback) {
    var self = this;
    if (this.getState() === 'reading sensor') {
      console.log("start called while waiting for a sensor reading");

      // because of IE multi threading we might we waiting for a reading from the sensor still
      // so we try waiting for little while before giving up

      // this will cause a infinite loop of the applet blocks forever
      // however that is what happens in normal browsers anyhow
      setTimeout(function(){
        self.start(callback);
      }, 100);
      return;
    }

    if (this.getState() !== 'stopped') {
      if (callback) {
        setTimeout(function(){
          callback.call(this, new Error("Tried to start the applet from non-stopped state '" + this.getState() + '"'), false);
        }, 5);
      }
      return;
    }
    // in IE a slow call to an applet will result in other javascript being executed while waiting
    // for the applet. So we need to keep track of our state before calling Java.
    this._state = 'starting';

    // Remain in state 'stopped' if sensor is not connected. This is because we want the user to
    // be able to click 'start' again after plugging in the sensor. Changing to a different state
    // would require having some way to detect when to leave that state. We lack a way to
    // automatically detect that the sensor has been plugged in, and we don't want to force the
    // user to tell us.
    this.isSensorConnected(function(connected) {
      if (!connected) {
        self._state = 'stopped';
        if (callback) {
          callback.call(self, new errors.SensorConnectionError("Device reported the requested sensor type was not attached."), null);
        }
      } else {
        self.appletInstance.startCollecting();
        self._state = 'started';
        if (callback) {
          callback.call(self, null, true);
        }
      }
    });
  },

  stop: function() {
    if (this.getState() === 'started') {
      this._state = 'stopped';
      this.appletInstance.stopCollecting();
    }
  },

  remove: function() {
    if (this.getState() !== 'not appended') {
      if (this.$appletContainer) {
        this.$appletContainer.html("");
      }
      if (this.$testAppletContainer) {
        this.$testAppletContainer.html("");
      }
      this._state = 'not appended';
    }
  },

  // applet callbacks
  // we don't want to block the applet and we don't want to execute any code
  // in the callback thread because things can break if javascript calls back to Java in
  // a callback
  initSensorInterfaceComplete: function(success) {
    var self = this;
    setTimeout(function() {
      if(success){
        self._state = 'stopped';
        self._appendCallback(null);
        self._appendCallback = null;
      } else {
        // state should remain 'applet ready'
        self._appendCallback(new errors.SensorConnectionError("Device reported the requested sensor type was not attached."));
      }
    }, 5);
  },

  dataReceived: function(type, count, data) {
    var self = this,
        // FIXME this is inefficient to make a new object each time
        dataSample = [],
        numberOfSensors = this.sensorDefinitions.length;
    setTimeout(function () {
      data = data || [];
      for (var sampleIndex = 0; sampleIndex < count; sampleIndex++) {
        for (var i = 0; i < numberOfSensors; i++) {
          dataSample[i] = data[sampleIndex*numberOfSensors + i];
        }
        self.emit('data', dataSample);
      }
    }, 5);
  },

  deviceUnplugged: function() {
    var self = this;
    window.setTimeout(function() {
      self.emit('deviceUnplugged');
    }, 5);
  },

  sensorUnplugged: function() {
    var self = this;
    console.log("received sensorUnplugged message; deviceType = " + this.deviceType);
    // the model code is not currently handle this callback correctly
    return;

    window.setTimeout(function() {
      self.emit('sensorUnplugged');
    }, 10);
  },

  callbackTable: [],
  registerCallback: function(callback) {
    // TODO We might want to set up a "reaper" function to error the callback if a certain
    // amount of time passes and the callback hasn't been called.
    this.callbackTable.push(callback);
    return this.callbackTable.length-1;
  },

  handleCallback: function(index, value) {
    var callback, self = this;
    if (typeof(index) === "string" && this[index]) {
      // assume this is meant to call a direct method on this class instance
      callback = this[index];
    } else if (this.callbackTable[index]) {
      callback = this.callbackTable[index];
      this.callbackTable[index] = null;
    }

    if (callback) {
      // IE8 throws the error "Object expected" when 'undefined' is passed as the second argument
      // to Function.prototype.apply.
      value = value || [];
      setTimeout(function() {
        callback.apply(self, value);
      }, 5);
    }
  }
});

miniClass.mixin(SensorApplet.prototype, EventEmitter);

module.exports = SensorApplet;

},{"./errors":2,"./jars-timestamp":3,"./mini-class":4,"./mini-event-emitter":5}],7:[function(require,module,exports){
module.exports = {
  goMotion: {
    appletClass: 'GoIO',

    // Name of the measurement being made, for display in UI
    measurementName: "Distance",

    // measurement type, as accepted by applet's getSensorRequest method
    measurementType: 'distance',

    // measurement type, as returned by getTypeConstantName method.
    // The returned values are taken from the QUANTITY_* constants in the sensor project
    // See https://github.com/concord-consortium/sensor/blob/2da0693e4d92d8c107be802f29eab2688a83b26b/src/main/java/org/concord/sensor/SensorConfig.java
    typeConstantName: 'distance',

    // fully specified, readable name of the sensor: e.g., "GoIO pH Sensor"
    sensorName: "GoMotion",

    // readable name of the interface device the sensor connects to, e..g, "GoIO"
    deviceName: "GoMotion",

    samplesPerSecond: 20,
    tareable: true,
    minReading: -2,
    maxReading: 2,
    precision: 2,
    maxSeconds: 20
  },

  goTemp: {
    appletClass: 'GoIO',
    measurementName: "Temperature",
    measurementType: 'temperature',
    // QUANTITY_TEMPERATURE
    typeConstantName: 'temperature_wand',
    sensorName: "GoIO Temperature Sensor",
    deviceName: "GoIO",
    samplesPerSecond: 10,
    tareable: false,
    minReading: 0,
    maxReading: 40,
    maxSeconds: 20
  },

  goLinkTemperature: {
    appletClass: 'GoIO',
    measurementName: "Temperature",
    measurementType: 'temperature',
    // QUANTITY_TEMPERATURE
    typeConstantName: 'temperature',
    sensorName: "GoIO Temperature Sensor",
    deviceName: "GoIO",
    samplesPerSecond: 10,
    tareable: false,
    minReading: 0,
    maxReading: 40,
    maxSeconds: 20
  },

  goLinkLight: {
    appletClass: 'GoIO',
    measurementName: "Light Intensity",
    measurementType: 'light',
    // QUANTITY_LIGHT
    typeConstantName: 'light',
    sensorName: "GoIO Light Sensor",
    deviceName: "GoIO",
    samplesPerSecond: 10,
    tareable: false,
    minReading: 0,
    maxReading: 2000,
    maxSeconds: 20
  },

  goLinkForce: {
    appletClass: 'GoIO',
    measurementName: "Force",
    measurementType: 'force',
    // QUANTITY_FORCE
    typeConstantName: 'force',
    sensorName: "GoIO Force Sensor",
    deviceName: "GoIO",
    samplesPerSecond: 20,
    tareable: true,
    minReading: -50,
    maxReading: 50,
    precision: 2,
    maxSeconds: 10
  },

  goLinkPH: {
    appletClass: 'GoIO',
    measurementName: "Acidity",
    measurementType: 'ph',
    // QUANTITY_PH
    typeConstantName: 'ph',
    sensorName: "GoIO pH Sensor",
    deviceName: "GoIO",
    samplesPerSecond: 10,
    tareable: false,
    minReading: 0,
    maxReading: 14,
    maxSeconds: 60
  },

  goLinkCO2: {
    appletClass: 'GoIO',
    measurementName: "CO₂ Concentration",
    measurementType: 'co2',
    // QUANTITY_CO2_GAS
    typeConstantName: 'co2_gas',
    sensorName: "GoIO CO₂ sensor",
    deviceName: "GoIO",
    samplesPerSecond: 1,
    tareable: false,
    minReading: 0,
    maxReading: 5000,
    maxSeconds: 60
  },

  goLinkO2: {
    appletClass: 'GoIO',
    measurementName: "O₂ Concentration",
    measurementType: 'o2',
    // QUANTITY_OXYGEN_GAS
    typeConstantName: 'oxygen_gas',
    sensorName: "GoIO O₂ sensor",
    deviceName: "GoIO",
    samplesPerSecond: 1,
    tareable: false,
    minReading: 0,
    maxReading: 100,
    maxSeconds: 60
  },

  labQuestMotion: {
    appletClass: 'LabQuest',
    measurementName: "Distance",
    measurementType: 'distance',
    // QUANTITY_DISTANCE
    typeConstantName: 'distance',
    sensorName: "LabQuest Motion Sensor",
    deviceName: "LabQuest",
    samplesPerSecond: 20,
    tareable: true,
    minReading: -2,
    maxReading: 2,
    precision: 2,
    maxSeconds: 20
  },

  labQuestTemperature: {
    appletClass: 'LabQuest',
    measurementName: "Temperature",
    measurementType: 'temperature',
    // QUANTITY_TEMPERATURE
    typeConstantName: 'temperature',
    sensorName: "LabQuest Temperature Sensor",
    deviceName: "LabQuest",
    samplesPerSecond: 10,
    tareable: false,
    minReading: 0,
    maxReading: 40,
    maxSeconds: 20
  },

  labQuestLight: {
    appletClass: 'LabQuest',
    measurementName: "Light Intensity",
    measurementType: 'light',
    // QUANTITY_LIGHT
    typeConstantName: 'light',
    sensorName: "LabQuest Light Sensor",
    deviceName: "LabQuest",
    samplesPerSecond: 10,
    tareable: false,
    minReading: 0,
    maxReading: 2000,
    maxSeconds: 20
  },

  labQuestForce: {
    appletClass: 'LabQuest',
    measurementName: "Force",
    measurementType: 'force',
    // QUANTITY_FORCE
    typeConstantName: 'force',
    sensorName: "LabQuest Force Sensor",
    deviceName: "LabQuest",
    samplesPerSecond: 20,
    tareable: true,
    minReading: -50,
    maxReading: 50,
    precision: 2,
    maxSeconds: 10
  },

  labQuestPH: {
    appletClass: 'LabQuest',
    measurementName: "Acidity",
    measurementType: 'ph',
    // QUANTITY_PH
    typeConstantName: 'ph',
    sensorName: "LabQuest pH Sensor",
    deviceName: "LabQuest",
    samplesPerSecond: 10,
    tareable: false,
    minReading: 0,
    maxReading: 14,
    maxSeconds: 60
  },

  labQuestCO2: {
    appletClass: 'LabQuest',
    measurementName: "CO₂ Concentration",
    measurementType: 'co2',
    // QUANTITY_CO2_GAS
    typeConstantName: 'co2_gas',
    sensorName: "LabQuest CO₂ sensor",
    deviceName: "LabQuest",
    samplesPerSecond: 1,
    tareable: false,
    minReading: 0,
    maxReading: 5000,
    maxSeconds: 60
  },

  labQuestO2: {
    appletClass: 'LabQuest',
    measurementName: "O₂ Concentration",
    measurementType: 'o2',
    // QUANTITY_OXYGEN_GAS
    typeConstantName: 'oxygen_gas',
    sensorName: "LabQuest O₂ sensor",
    deviceName: "LabQuest",
    samplesPerSecond: 1,
    tareable: false,
    minReading: 0,
    maxReading: 100,
    maxSeconds: 60
  }
};

},{}],8:[function(require,module,exports){
module.exports = {
  units: {
    time: {
      name: "second",
      pluralName: "seconds",
      symbol: "s"
    },
    distance: {
      name: "meter",
      pluralName: "meters",
      symbol: "m"
    },
    temperature: {
      name: "degree Celsius",
      pluaralName: "degrees Celsius",
      symbol: "°C"
    },
    light: {
      name: "lux",
      pluralName: "lux",
      symbol: "lux"
    },
    force: {
      name: "Newton",
      pluralName: "Newtons",
      symbol: "N"
    },
    ph: {
      name: "pH Unit",
      pluralName: "pH Units",
      symbol: "pH"
    },
    co2: {
      name: "part per million",
      pluralName: "parts per million",
      symbol: "ppm"
    },
    o2: {
      name: "part per million",
      pluralName: "parts per million",
      symbol: "ppm"
    }
  }
};

},{}],9:[function(require,module,exports){
var appletClasses = require('./lib/applet-classes');
var errors = require('./lib/errors');

module.exports = {
  GoIO:                      appletClasses.GoIO,
  LabQuest:                  appletClasses.LabQuest,

  // Listing of supported sensors. You need to set the measurementType on a SensorApplet instance
  // before calling append. The keys of the sensorDefinitions map are the supported
  // measurementType values.
  sensorDefinitions:         require('./lib/sensor-definitions'),
  unitsDefinition:           require('./lib/units-definition'),

  // Error Classes. These are returned to appendCallback or thrown by some of the API methods.
  JavaLoadError:             errors.JavaLoadError,
  AppletInitializationError: errors.AppletInitializationError,
  SensorConnectionError:     errors.SensorConnectionError,
  AlreadyReadingError:       errors.AlreadyReadingError
};

},{"./lib/applet-classes":1,"./lib/errors":2,"./lib/sensor-definitions":7,"./lib/units-definition":8}],10:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":10}]},{},[9])
(9)
});
;

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
    eventManager.fire('scriptLoaded', 'vle/node/sensor/sensor-applet-interface.js');
}