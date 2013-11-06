
var Sail = window.Sail || {}


Sail.Strophe = {
    bosh_url: null,
    jid: null,
    password: null,
    dataMode: 'json', // 'xml' || 'json'
    logLevel: Strophe.LogLevel.INFO,
    
    connect: function() {
        if (!this.bosh_url) throw "No bosh_url set!"
        if (!this.jid) throw "No jid set!"
        if (!this.password) throw "No password set!"
        
        
        this.conn = new Strophe.Connection(this.bosh_url)
        this.conn.reset();

        this.conn.xmlInput = function(data) {
            //console.log("IN:", $(data).children()[0])
        }
        this.conn.xmlOutput = function(data) {
            //console.log("OUT:", $(data).children()[0])
        }
        
        this.conn.connect(this.jid, this.password, this.onConnect)
    },
    
    disconnect: function() {
        //console.log("sending disconnect request...")
        Sail.Strophe.conn.sync = true;
        Sail.Strophe.conn.flush();
        Sail.Strophe.conn.disconnect();
    },
    
    addHandler: function(handler, ns, name, type, id, from) {
        if (!Sail.Strophe.conn) throw "Must connect before you can add handlers"
        Sail.Strophe.conn.addHandler(function(stanza){handler(stanza);return true}, ns, name, type, id, from)
    },
    
    // pings the server periodically to keep the connection open
    pinger: function(interval) {
      if (!interval) interval = 14 * 1000 // default is 14 seconds
      setInterval(function() {
        //console.log("Sending ping")
        pres = $pres()
        Sail.Strophe.conn.send(pres.tree(), function(msg){
        	//console.log("sent PING", msg)
        	}, function(err){
        		//console.log("PING failed!", err);
        	})
        //Sail.Strophe.conn.send(msg.tree(), function(msg){console.log("sent PING", msg)}, function(err){console.log("PING failed!", err)})
        
        Sail.Strophe.conn.flush()
      }, interval)
    },
    
    /** Event Handlers -- override these as required **/
    
    onConnect: function (status) {
        switch (status) {
            case Strophe.Status.ERROR:
                //console.log('CONNECTION ERROR!')
                break
            case Strophe.Status.CONNECTING:
                //console.log('CONNECTING to '+Sail.Strophe.bosh_url+' WITH '+Sail.Strophe.jid+'/'+Sail.Strophe.password)
                break
            case Strophe.Status.CONNFAIL:
                //console.error('CONNECTION to '+Sail.Strophe.bosh_url+' FAILED!')
                break
            case Strophe.Status.AUTHENTICATING:
                //console.log('AUTHENTICATING')
                break
            case Strophe.Status.AUTHFAIL:
                //console.error("AUTHENTICATION FAILED")
                break
            case Strophe.Status.CONNECTED:
                //console.log('CONNECTED to '+Sail.Strophe.bosh_url)

                // store connection data to allow for .attach() on reload
                //$(window).unload(Sail.Strophe.disconnect)

                Sail.Strophe.addDefaultHandlers()
                Sail.Strophe.onConnectSuccess()
                Sail.Strophe.pinger() // start the periodic pinger to prevent the connection from closing
                break
            case Strophe.Status.DISCONNECTED:
                // ConnInfo (for .attach()) is currently unused, but if it were
                // used it should be cleared here
                Sail.Strophe.clearConnInfo()
                
                //console.log('DISCONNECTED!')
                break
            case Strophe.Status.DISCONNECTING:
                //console.log('DISCONNECTING...')
                break
            case Strophe.Status.ATTACHED:
                // this would happen in response to a conn.attach()
                // but currently this is not implemented
                //console.log('AUTHENTICATING')
                break
            default:
                //console.warn('UNKNOWN CONNECTION STATUS: '+status)
        }
    },
    
    onConnectSuccess: function() {
        //console.log("CONNECTED SUCCESSFULLY (in default onConnectSuccess)")
        return true  
    },
    
    onGroupchatMessage: function(msg) {
        //console.log($(msg).find('body').text())
        return true
    },
    
    onSuccess: function(msg) {
        //console.log("SUCCESS: "+msg)
        return true
    },
    
    onFailure: function(msg) {
        //console.log("FAILURE: "+msg)
        return true
    },
    
    addDefaultHandlers: function() {
        Sail.Strophe.conn.addHandler(Sail.Strophe.errorHandler, null, null, 'error')
    },
    
    errorHandler: function(stanza) {
        err = $(stanza).children('error')
        errMsg = err.children('text').text()
        alert("XMPP ERROR: "+errMsg)
        return true
    },
    
    log: function(level, message) {
        switch(level) {
            case Strophe.LogLevel.DEBUG:
                logFunc = 'debug'
                logMsg = "DEBUG: "+message
                break
            case Strophe.LogLevel.INFO:
                logFunc = 'info'
                logMsg = "INFO: "+message
                break
            case Strophe.LogLevel.WARN:
                logFunc = 'warn'
                logMsg = "WARN: "+message
                break
            case Strophe.LogLevel.ERROR:
                logFunc = 'error'
                logMsg = "ERROR: "+message
                break
            case Strophe.LogLevel.FATAL:
                logFunc = 'error'
                logMsg = "FATAL: "+message
                break
            default:
                logFunc = 'log'
                logMsg = message
                break
        }
        
        if (Sail.Strophe.logLevel <= level){
            //console[logFunc](logMsg)
        }
    },
    
    
    // The following methods could potentially be used
    // to implement conn.attach() behaviour. Currently
    // they are unused.
    
    storeConnInfo: function() {
        $.cookie('Sail.jid', Sail.Strophe.conn.jid)
        $.cookie('Sail.sid', Sail.Strophe.conn.sid)
        $.cookie('Sail.rid', Sail.Strophe.conn.rid)
    },
    
    retrieveConnInfo: function() {
        return {
            jid: $.cookie('Sail.jid'),
            sid: $.cookie('Sail.sid'),
            rid: $.cookie('Sail.rid')
        }
    },
    
    clearConnInfo: function() {
        $.cookie('Sail.jid', null)
        $.cookie('Sail.sid', null)
        $.cookie('Sail.rid', null)
    },
    
    hasExistingConnInfo: function() {
        info = Sail.Strophe.retrieveConnInfo()
        return info.jid && info.rid && info.sid
    },
    
    reconnect: function() {
        if (!this.bosh_url) throw "No bosh_url set!"
        
        info = Sail.Strophe.retrieveConnInfo()
        
        this.conn = new Strophe.Connection(this.bosh_url)
        
        //console.log('REATTACHING TO '+this.bosh_url+'WITH: ', info)
        this.conn.attach(info.jid, info.sid, info.rid + 1)
    }
}

Sail.Strophe.Groupchat = function(room, conn) {
    this.room = room
    this.conn = conn || Sail.Strophe.conn
    
    if (!this.conn)
        throw "No connection given for Groupchat!"
}

Sail.Strophe.Groupchat.prototype = {
    
    participants: [],
    
    join: function() {
        pres = $pres({to: this.jid()}).c('x', {xmlns: 'http://jabber.org/protocol/muc'})
        this.conn.send(pres.tree())
        
        this.addDefaultPresenceHandlers();
    },
    
    jid: function() {
        return this.room + "/" + Sail.Strophe.jid
    },
    
    /**
     * toJID is the JID of the to: user. If null, this is a groupchat. If set, this is a private chat. 
     */
    sendEvent: function(event, toJID) {
        /*if (Sail.Strophe.dataMode == 'xml')
            this.sendXML(event.toXML())
        else*/ 
    	if (Sail.Strophe.dataMode == 'json') {
   			this.sendJSON(event.toJSON(), toJID);
        } else // FIXME: this isn't really right...
            this.sendText(event)
    },
    
    sendXML: function(xml) {
        msg = $msg({to: this.room, type: 'groupchat'}).c('body').cnode($(xml)[0])
        this.conn.send(msg.tree())
    },
    
    sendText: function(text) {
        msg = $msg({to: this.room, type: 'groupchat'}).c('body').t(text)
        this.conn.send(msg.tree())
    },
    
    /**
     * toJID is the JID of the to: user. If null, this is a groupchat. If set, this is a private chat. 
     */
    sendJSON: function(json, toJID) {
        if (typeof json == "string")
            json_string = json;
        else
            json_string = JSON.stringify(json);
        
   		if (toJID != null) {
   			msg = $msg({to: this.room+"/"+toJID, from: Sail.Strophe.jid, type: 'chat'}).c('body').t(json_string)
   		} else {    			
   			msg = $msg({to: this.room, type: 'groupchat'}).c('body').t(json_string)
   		}
        this.conn.send(msg.tree())
    },
    
    addHandler: function(handler, ns, name, id, from) {
        if (!this.conn) throw "Must connect before you can add handlers"
        this.conn.addHandler(function(stanza){handler(stanza);return true}, ns, name, "groupchat", id, from)
    },
    
    addDefaultPresenceHandlers: function() {
        var chat = this
        
        this.conn.addHandler(function(stanza){
                if ($(stanza).attr('type') != null)
                    return true // doesn't seem to be a way to do this at addHandler's filter level
                who = $(stanza).attr('from')
                chat.participants.push(who)
                chat.onParticipantJoin(who, stanza)
                return true
            }, null, "presence", null, null, chat.room, {matchBare: true})
        this.conn.addHandler(function(stanza){
                who = $(stanza).attr('from')
                chat.participants.push(who)
                chat.onParticipantLeave(who, stanza)
                return true;
            }, null, "presence", "unavailable", null, chat.room, {matchBare: true})
    
        this.conn.addHandler(function(stanza){
                if ($(stanza).attr('type') != null)
                    return true // doesn't seem to be a way to do this at addHandler's filter level
                chat.onSelfJoin(stanza)
                return true
            }, null, "presence", null, null, chat.jid())
        this.conn.addHandler(function(stanza){
                chat.onSelfLeave(stanza)
                return true
            }, null, "presence", "unavailable", null, chat.jid())
    },
    
    onParticipantJoin: function(who, pres) {
        //console.log(who+" JOINED "+this.room)
    },
    
    onParticipantLeave: function(pres) {
        //console.log(who+" LEFT "+this.room)
    },
    
    onSelfJoin: function(pres) {
        //console.log("JOINED "+this.room)
    },
    onSelfLeave: function(pres) {
        //console.log("LEFT "+this.room)
    },
    onMessage: function(msg) {
      //console.log("GROUPCHAT: ", msg)
      return true
    }    
}


Strophe.log = Sail.Strophe.log

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/xmpp/js/sail.js/sail.strophe.js');
}