System.config({
  baseURL: "wise5",
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },
  "System.trace": true,

  map: {
    "angular": "github:angular/bower-angular@1.5.8",
    "angular-animate": "github:angular/bower-angular-animate@1.5.8",
    "angular-dragula": "npm:angular-dragula@1.2.8",
    "angular-material": "github:angular/bower-material@1.1.3",
    "angular-mocks": "github:angular/bower-angular-mocks@1.5.8",
    "angular-moment": "npm:angular-moment@1.0.0",
    "angular-sanitize": "github:angular/bower-angular-sanitize@1.5.8",
    "angular-translate": "github:angular-translate/bower-angular-translate@2.13.0",
    "angular-translate-loader-partial": "github:angular-translate/bower-angular-translate-loader-partial@2.13.0",
    "angular-ui-router": "npm:angular-ui-router@0.3.2",
    "angular-ui-scrollpoint": "npm:angular-ui-scrollpoint@2.1.1",
    "angular-websocket": "npm:angular-websocket@1.0.14",
    "core-js": "npm:core-js@1.2.7",
    "dom-autoscroller": "npm:dom-autoscroller@1.4.1",
    "highcharts-ng": "npm:highcharts-ng@0.0.11",
    "highcharts/draggable-points": "github:highcharts/draggable-points@master",
    "html2canvas": "npm:html2canvas@0.5.0-beta4",
    "iframe-resizer": "npm:iframe-resizer@3.5.5",
    "jquery": "npm:jquery@2.2.4",
    "moment": "npm:moment@2.16.0",
    "ng-file-upload": "npm:ng-file-upload@12.2.13",
    "oclazyload": "npm:oclazyload@1.0.9",
    "svg.draggable.js": "npm:svg.draggable.js@2.2.1",
    "svg.js": "github:svgdotjs/svg.js@2.3.6",
    "webfontloader": "npm:webfontloader@1.6.26",
    "github:angular-translate/bower-angular-translate-loader-partial@2.13.0": {
      "angular": "github:angular/bower-angular@1.5.8",
      "angular-translate": "github:angular-translate/bower-angular-translate@2.13.0"
    },
    "github:angular-translate/bower-angular-translate@2.13.0": {
      "angular": "github:angular/bower-angular@1.5.8"
    },
    "github:angular/bower-angular-animate@1.5.8": {
      "angular": "github:angular/bower-angular@1.5.8"
    },
    "github:angular/bower-angular-aria@1.5.8": {
      "angular": "github:angular/bower-angular@1.5.8"
    },
    "github:angular/bower-angular-mocks@1.5.8": {
      "angular": "github:angular/bower-angular@1.5.8"
    },
    "github:angular/bower-angular-sanitize@1.5.8": {
      "angular": "github:angular/bower-angular@1.5.8"
    },
    "github:angular/bower-material@1.1.3": {
      "angular": "github:angular/bower-angular@1.5.8",
      "angular-animate": "github:angular/bower-angular-animate@1.5.8",
      "angular-aria": "github:angular/bower-angular-aria@1.5.8",
      "css": "github:systemjs/plugin-css@0.1.32"
    },
    "github:highcharts/draggable-points@master": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.4.1"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.6.0"
    },
    "github:jspm/nodelibs-events@0.1.1": {
      "events": "npm:events@1.0.2"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.9"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:jspm/nodelibs-vm@0.1.0": {
      "vm-browserify": "npm:vm-browserify@0.0.4"
    },
    "npm:angular-dragula@1.2.8": {
      "atoa": "npm:atoa@1.0.0",
      "dragula": "npm:dragula@3.7.2"
    },
    "npm:angular-moment@1.0.0": {
      "moment": "npm:moment@2.16.0"
    },
    "npm:angular-ui-router@0.3.2": {
      "angular": "npm:angular@1.5.8"
    },
    "npm:angular-ui-scrollpoint@2.1.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:angular-websocket@1.0.14": {
      "angular": "npm:angular@1.5.8",
      "ws": "npm:ws@0.7.2"
    },
    "npm:assert@1.4.1": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "util": "npm:util@0.10.3"
    },
    "npm:bindings@1.2.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:buffer@3.6.0": {
      "base64-js": "npm:base64-js@0.0.8",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "ieee754": "npm:ieee754@1.1.8",
      "isarray": "npm:isarray@1.0.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:bufferutil@1.1.0": {
      "bindings": "npm:bindings@1.2.1",
      "nan": "npm:nan@1.8.4"
    },
    "npm:contra@1.9.4": {
      "atoa": "npm:atoa@1.0.0",
      "ticky": "npm:ticky@1.0.1"
    },
    "npm:core-js@1.2.7": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:create-point-cb@1.2.0": {
      "type-func": "npm:type-func@1.0.3"
    },
    "npm:crossvent@1.5.4": {
      "custom-event": "npm:custom-event@1.0.0"
    },
    "npm:dom-autoscroller@1.4.1": {
      "create-point-cb": "npm:create-point-cb@1.2.0"
    },
    "npm:dragula@3.7.2": {
      "contra": "npm:contra@1.9.4",
      "crossvent": "npm:crossvent@1.5.4"
    },
    "npm:highcharts-ng@0.0.11": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:html2canvas@0.5.0-beta4": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:iframe-resizer@3.5.5": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:nan@1.8.4": {
      "path": "github:jspm/nodelibs-path@0.1.0"
    },
    "npm:ng-file-upload@12.2.13": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:oclazyload@1.0.9": {
      "angular": "npm:angular@1.5.8"
    },
    "npm:options@0.0.6": {
      "fs": "github:jspm/nodelibs-fs@0.1.2"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process@0.11.9": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:svg.draggable.js@2.2.1": {
      "svg.js": "npm:svg.js@2.3.2"
    },
    "npm:svg.js@2.3.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:ticky@1.0.1": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:type-func@1.0.3": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:ultron@1.0.2": {
      "events": "github:jspm/nodelibs-events@0.1.1"
    },
    "npm:utf-8-validate@1.1.0": {
      "bindings": "npm:bindings@1.2.1",
      "nan": "npm:nan@1.8.4"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:vm-browserify@0.0.4": {
      "indexof": "npm:indexof@0.0.1"
    },
    "npm:webfontloader@1.6.26": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:ws@0.7.2": {
      "bufferutil": "npm:bufferutil@1.1.0",
      "options": "npm:options@0.0.6",
      "ultron": "npm:ultron@1.0.2",
      "utf-8-validate": "npm:utf-8-validate@1.1.0"
    }
  }
});
