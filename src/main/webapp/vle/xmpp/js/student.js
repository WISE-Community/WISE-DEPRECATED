WISE = {
    // config
	wiseXMPPAuthenticateUrl: '',
    xmppDomain: 'localhost',
    groupchatRoom: '',
    groupchatRoomBase: '@conference.localhost',
    
    // WISE variables
    view:null,
    
    
    // private global vars
    ui: Sail.UI,
    groupchat: null,
    session: null,
    justWatching: false,
    teacherResource: null,
    teacherOnline: false,
    
    init: function(viewIn) {
		view=viewIn;
        //console.log("Initializing WISE...")

        WISE.wiseXMPPAuthenticateUrl = view.config.getConfigParam("wiseXMPPAuthenticateUrl") + "&workgroupId=" + view.userAndClassInfo.getWorkgroupId();
        WISE.xmppDomain = view.config.getConfigParam("hostName");
        WISE.groupchatRoomBase = "@conference." + WISE.xmppDomain;
        
        // get runId to use for chatroom
        WISE.groupchatRoom = view.config.getConfigParam("runId") + WISE.groupchatRoomBase;
        
        // create custom event handlers for all WISE 'on' methods
        Sail.autobindEvents(WISE, {
            pre: function() {
        		//console.debug(arguments[0].type+'!',arguments);
        	}
        })

        WISE.authenticate();
        
        return this;
    },
   
    isEventFromTeacher: function(sev) {
    	var sender = sev.from.split('/')[1].split('@')[0];
    	var teacherWorkgroupId = view.getUserAndClassInfo().getTeacherWorkgroupId();
        return sender == teacherWorkgroupId;
    },
    
    isEventFromStudent: function(sev) {
    	var result = false;
    	
    	//get the sender, this will be the workgroupid as a string
    	var sender = sev.from.split('/')[1].split('@')[0];
    	
    	//get all the student workgroup ids in the class
    	var workgroupIds = view.getUserAndClassInfo().getWorkgroupIdsInClass();
    	
    	if(workgroupIds.indexOf(parseInt(sender)) != -1) {
    		//the sender is in the class
    		result = true;
    	}
    	
    	return result;
    },
    
    sendStudentToTeacherMessage: function(msg) {
    	if(WISE.teacherOnline) {
    		//only send the message if the teacher is online
            sev = new Sail.Event('studentToTeacherMsg', msg);   
            var teacherWorkgroupId = view.getUserAndClassInfo().getTeacherWorkgroupId();
            var toJID = teacherWorkgroupId + '@' + WISE.xmppDomain + '/' + WISE.teacherResource;
            if (WISE.groupchat) {
            	WISE.groupchat.sendEvent(sev, toJID);    	
            }    		
    	}
    },    
    
    sendStudentToChatRoomMessage: function(msg) {
    	var chatLogUrl = view.getConfig().getConfigParam('chatLogUrl');
    	var runId = view.getConfig().getConfigParam('runId');
    	
    	message = msg;
    	
    	var data = {"runId":runId,
    			"fromWorkgroupId":view.userAndClassInfo.getWorkgroupId(),
    			"fromWorkgroupName":view.userAndClassInfo.getUserName(),
    			"chatRoomId":"general",
    			"chatEventType":"studentToChatRoomMessage",
    			"dataType":"string",
    			"data":message};

    	/*
    	 * send a message to the chat log controller so it can save this chat
    	 * message to the database
    	 */
    	$.ajax({
    		url:chatLogUrl,
    		type:"POST",
    		data:data,
    		success:function(callbackData, text, xhr) {
    	    	sev = new Sail.Event('studentToChatRoomMsg', data);   
    	    	if (WISE.groupchat) {
    	    		WISE.groupchat.sendEvent(sev);
    	    	}
    		},
    		error:function(xhr, text) {
    			
    		},
    		async:false
    	});
    },
    
    sendStudentWorkToTeacher: function() {
    	
    },
    
    disconnect: function() {
    	Sail.Strophe.disconnect();
    },
   
    authenticate: function() {
    	// authenticate with WISE, 
    	// will create an account if necessary
    	// will get back a token for authenticating with XMPP.
        WISE.wiseXMPPAuthenticate = new Sail.WiseXMPPAuthenticate.Client(WISE.wiseXMPPAuthenticateUrl);
        WISE.wiseXMPPAuthenticate.fetchXMPPAuthentication(function(data) {
        	WISE.xmppUsername = data.xmppUsername;
        	WISE.xmppPassword = data.xmppPassword;
            $(WISE).trigger('authenticated');
        });
    },
    
    /**
     * Check if the user is the teacher
     */
    isPresenceFromTeacher: function(who) {
    	var result = false;
    	
		/*
		 * get the user that joined
		 * e.g.
		 * who=639@conference.localhost/27368@localhost/1311631965027
		 * sender=27368
		 */
		var sender = who.split('/')[1].split('@')[0];
		var teacherWorkgroupId = view.getUserAndClassInfo().getTeacherWorkgroupId();
		
		//check if the user that joined is the teacher
		if(sender == teacherWorkgroupId) {
			result = true;
		}
		
		return result;
    },
    
    
    events: {
        // mapping of Sail events to local Javascript events
	
        sail: {
	    	'pause':'pause',
            'unPause':'unPause',
            'studentToChatRoomMsg':'studentToChatRoomMsg',
            'teacherToChatRoomMsg':'teacherToChatRoomMsg',
            'teacherShareWithClass':'teacherShareWithClass',
            'teacherShareRealTimeMonitorGraphWithClass':'teacherShareRealTimeMonitorGraphWithClass'
        },

        // local Javascript event handlers
        onAuthenticated: function() {
        	// callback for when user is authenticated with the portal. user's xmpp username/password should be set in WISE.xmppUsername and WISE.xmppPassword.
            Sail.Strophe.bosh_url = 'http://' + WISE.xmppDomain + '/http-bind/';
            var currentTimeInMillis = new Date().getTime();
         	Sail.Strophe.jid = WISE.xmppUsername + '@' + WISE.xmppDomain + "/" + currentTimeInMillis;
          	Sail.Strophe.password = WISE.xmppPassword;  

            Sail.Strophe.onConnectSuccess = function() {
          	    sailHandler = Sail.generateSailEventHandler(WISE);
          	    Sail.Strophe.addHandler(sailHandler, null, null, 'chat');
      	    
          	    WISE.groupchat = new Sail.Strophe.Groupchat(WISE.groupchatRoom);
          	    WISE.groupchat.addHandler(sailHandler);
          	    
          	    //override the function that is called when someone joins the chat room
          	    WISE.groupchat.onParticipantJoin = function(who,pres) {
          	    	if(WISE.isPresenceFromTeacher(who)) {
          				/*
          				 * the user that joined was the teacher so we will remember 
          				 * the teacher's resource so that we can send private messages
          				 * to the teacher
          				 * e.g.
          				 * who=639@conference.localhost/27368@localhost/1311631965027
          				 * teacherResource=1311631965027
          				 */
          	    		WISE.teacherResource = who.split('/')[2];
              	    	WISE.teacherOnline = true;
          	    	}
          	    };
          	    
          	    //override the function that is called when someone leaves the chat room
          	    WISE.groupchat.onParticipantLeave = function(who,pres) {
          	    	if(WISE.isPresenceFromTeacher(who)) {
          	    		//the teacher has left the chat room
	          	    	WISE.teacherResource = null;
          	    		WISE.teacherOnline = false;
          	    		
          	    		/*
          	    		 * unlock the screen just in case the the teacher's browser failed to call unPause
          	    		 * when they left the classroom monitor
          	    		 */
          	    		eventManager.fire('unlockScreenEvent');
          	    	}
          	    };
          	    
          	    WISE.groupchat.join();
          	};
      	    
          	// connect to XMPP server
      	    Sail.Strophe.connect();
        },
        onPause: function(ev,sev) {
        	if(WISE.isEventFromTeacher(sev)) {
        		//the teacher has paused the student screen
        		var teacherShareWithClassObj = sev.payload;
        		eventManager.fire('lockScreenAndShareWithClass', teacherShareWithClassObj);
        	}
        },
        onUnPause:function(ev,sev) {
        	if(WISE.isEventFromTeacher(sev)) {
        		//the teacher has unpaused the student screen
        		eventManager.fire('unlockScreenEvent');
        	}
        },
        onStudentToChatRoomMsg:function(ev,sev) {
        	if(WISE.isEventFromStudent(sev)) {
        		//an object containing the fromWorkgroupName and message
        		var data = sev.payload;
        		
        		var fromWorkgroupName = data.fromWorkgroupName;
        		var message = data.data;
        		
        		//display the message
        		$('#chatRoomTextDisplay').append(fromWorkgroupName + ": " + message + "<br>");
        		
        		//scroll the div to the bottom
        		$('#chatRoomTextDisplay').scrollTop(1000000);
        	}
        },
        onTeacherToChatRoomMsg:function(ev,sev) {
        	if(WISE.isEventFromTeacher(sev)) {
        		//an object containing the fromWorkgroupName and message
        		var data = sev.payload;
        		
        		var fromWorkgroupName = data.fromWorkgroupName;
        		var message = data.data;
        		
        		//display the message
        		$('#chatRoomTextDisplay').append("<div style='font-weight:bold'>"+fromWorkgroupName + ": " + message + "</div>");
        		
        		//scroll the div to the bottom
        		$('#chatRoomTextDisplay').scrollTop(1000000);
        	}
        },
        onTeacherShareWithClass:function(ev,sev) {
        	if(WISE.isEventFromTeacher(sev)) {
        		//teacher has shared student work or html with the class
        		var teacherShareWithClassObj = sev.payload;
        		eventManager.fire('lockScreenAndShareWithClass', teacherShareWithClassObj);
        	}
        }
    }
};

//$(document).ready(WISE.init)

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/xmpp/js/student.js');
}