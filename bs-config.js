
/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |
 */

// required to work with single-page-apps, see here: https://github.com/BrowserSync/browser-sync/issues/204
var historyApiFallback = require('connect-history-api-fallback');
/*
var corsHandler = function (req, res, next) {
	console.log('Adding CORS header for ' + req.method + ': ' + req.url);
	res.setHeader('Access-Control-Allow-Origin', '*');
	next();
};
*/

var wise5 = function(req, res, next) {

    console.log('Method: ' + req.method + ', URL: : ' + req.url);
    if (req.url.startsWith("/wise/project")) {
        console.log("in if case");
	historyApiFallback();
    }

    next();
}

module.exports = {
    "ui": false,
    /*
    "ui": {
        "port": 3001,
        "weinre": {
            "port": 8080
        }
    },
    */
    //"files": false,
    "files": "**/*.css, **/*.js, **/*.html, **/*.jsp",
    "watchOptions": {},
    "server": false,
    //"proxy":"http://localhost:8080/wise",
    "proxy": {target: "http://localhost:8080/wise", ws:true},
    //"proxy": {target: "http://localhost:8080/wise", ws:true, middleware:[function(req,res,next) {console.log(req.url); next()}]},
    //"proxy": {target: "http://localhost:8080/wise/project/1", ws:true, middleware:[ historyApiFallback() ]},
    "port": 3003,
    "middleware": false,
    //"middleware":[ wise5 ],
    //"middleware":[ historyApiFallback() ],
    "serveStatic": [],
    "ghostMode": {
        "clicks": true,
        "scroll": true,
        "forms": {
            "submit": true,
            "inputs": true,
            "toggles": true
        }
    },
    "logLevel": "debug",
    "logPrefix": "BS",
    "logConnections": false,
    "logFileChanges": true,
    "logSnippet": true,
    "rewriteRules": false,
    "open": "local",
    "browser": "default",
    "xip": false,
    "hostnameSuffix": false,
    "reloadOnRestart": false,
    "notify": true,
    "scrollProportionally": true,
    "scrollThrottle": 0,
    "scrollRestoreTechnique": "window.name",
    "scrollElements": [],
    "scrollElementMapping": [],
    "reloadDelay": 0,
    "reloadDebounce": 0,
    "plugins": [],
    "injectChanges": true,
    "startPath": null,
    "minify": true,
    "host": null,
    //"host": "localhost",
    "codeSync": true,
    "timestamps": true,
    "clientEvents": [
        "scroll",
        "scroll:element",
        "input:text",
        "input:toggles",
        "form:submit",
        "form:reset",
        "click"
    ],
    "socket": {
        "socketIoOptions": {
            "log": false
        },
        "socketIoClientConfig": {
            "reconnectionAttempts": 50
        },
        "path": "/browser-sync/socket.io",
        "clientPath": "/browser-sync",
        "namespace": "/browser-sync",
        "clients": {
            "heartbeatTimeout": 5000
        }
    },
    "tagNames": {
        "less": "link",
        "scss": "link",
        "css": "link",
        "jpg": "img",
        "jpeg": "img",
        "png": "img",
        "svg": "img",
        "gif": "img",
        "js": "script"
    }
};