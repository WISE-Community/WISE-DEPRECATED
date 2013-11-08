/** minified loadjs from https://github.com/chriso/load.js **/
/* Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>. MIT Licensed */
function loadScript(a,b,c){var d=document.createElement("script");d.type="text/javascript",d.src=a,d.onload=b,d.onerror=c,d.onreadystatechange=function(){var a=this.readyState;if(a==="loaded"||a==="complete")d.onreadystatechange=null,b()},head.insertBefore(d,head.firstChild)}(function(a){a=a||{};var b={},c,d;c=function(a,d,e){var f=a.halt=!1;a.error=function(a){throw a},a.next=function(c){c&&(f=!1);if(!a.halt&&d&&d.length){var e=d.shift(),g=e.shift();f=!0;try{b[g].apply(a,[e,e.length,g])}catch(h){a.error(h)}}return a};for(var g in b){if(typeof a[g]==="function")continue;(function(e){a[e]=function(){var g=Array.prototype.slice.call(arguments);if(e==="onError"){if(d){b.onError.apply(a,[g,g.length]);return a}var h={};b.onError.apply(h,[g,g.length]);return c(h,null,"onError")}g.unshift(e);if(!d)return c({},[g],e);a.then=a[e],d.push(g);return f?a:a.next()}})(g)}e&&(a.then=a[e]),a.call=function(b,c){c.unshift(b),d.unshift(c),a.next(!0)};return a.next()},d=a.addMethod=function(d){var e=Array.prototype.slice.call(arguments),f=e.pop();for(var g=0,h=e.length;g<h;g++)typeof e[g]==="string"&&(b[e[g]]=f);--h||(b["then"+d.substr(0,1).toUpperCase()+d.substr(1)]=f),c(a)},d("chain",function(a){var b=this,c=function(){if(!b.halt){if(!a.length)return b.next(!0);try{null!=a.shift().call(b,c,b.error)&&c()}catch(d){b.error(d)}}};c()}),d("run",function(a,b){var c=this,d=function(){c.halt||--b||c.next(!0)},e=function(a){c.error(a)};for(var f=0,g=b;!c.halt&&f<g;f++)null!=a[f].call(c,d,e)&&d()}),d("defer",function(a){var b=this;setTimeout(function(){b.next(!0)},a.shift())}),d("onError",function(a,b){var c=this;this.error=function(d){c.halt=!0;for(var e=0;e<b;e++)a[e].call(c,d)}})})(this),addMethod("load",function(a,b){for(var c=[],d=0;d<b;d++)(function(b){c.push(function(c,d){loadScript(a[b],c,d)})})(d);this.call("run",c)});var head=document.getElementsByTagName("head")[0]||document.documentElement

/** prevent errors in case console/firebug is not available **/
if (!window.console) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}

var Sail = window.Sail || {}

Sail.load = function() {
    return load('https://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.js',
            'js/sail.js/deps/md5.js',
            'js/sail.js/deps/base64.js')
    .then('js/sail.js/deps/strophe.js',
            'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/jquery-ui.js',
            'js/sail.js/deps/jquery.url.js',
            'js/sail.js/deps/jquery.cookie.js')
    .then('js/sail.js/sail.rollcall.js',
            'js/sail.js/sail.strophe.js',
            'js/sail.js/sail.ui.js')
}

Sail.Event = function(type, payload) {
    this.data = {}
    this.data.eventType = type
    this.data.payload = payload
}

Sail.Event.prototype = {
    // FIXME: this needs to be reworked
    // toXML: function() {
    //     // hack using jQuery to build the XML
    //     xml = $("<xml />")
    //     ev = $('<event />')
    //     ev.attr('type', this.type)
    //     ev.text(this.content)
    //     xml.append(ev)
    //     return xml.html() // html() returns only the inner contents of the <xml> tag!
    // },
    
    toJSON: function() {
        return JSON.stringify(this.data)
    }
}

Sail.autobindEvents = function(obj, options) {
    options = options || {}
    
    for (var meth in obj.events) {
        if (obj.events.hasOwnProperty(meth) && typeof obj.events[meth] == 'function' && meth.match(/^on/)) {
            event = meth.replace(/^on/,'')
            event = event.charAt(0).toLowerCase() + event.slice(1)
            //console.debug("Sail: auto-binding event '"+event+"' to "+meth)
            try {
                if (options.pre)
                  $(obj).bind(event, options.pre)
                $(obj).bind(event, obj.events[meth])
                if (options.post)
                  $(obj).bind(event, options.post)
            } catch(e) {
                alert("Sail: failed to auto-bind event! '"+event+"' may be a reserved word.")
                throw e
            }
        }
    }
}

Sail.generateSailEventHandler = function(obj) {
    return function(stanza) {
        msg = $(stanza)

        body = $(msg).children('body').text()
        sev = null
        try {
            sev = JSON.parse(body)
        } catch(err) {
            //console.log("couldn't parse message, ignoring: "+err)
            return
        }

        sev.from = msg.attr('from')
        sev.to = msg.attr('to')
        sev.stanza = stanza
    
        if (obj.events.sail[sev.eventType]) {
            $(obj).trigger(obj.events.sail[sev.eventType], sev)
        } else {
            //console.log("UNHANDLED EVENT "+sev.eventType, sev)
        }

        return true
    }
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/xmpp/js/sail.js/sail.js');
}