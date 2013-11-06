/**
 * Global object to handle notifications for the VLE and 
 * authoring tool. There are 3 levels of messages plus a debug 
 * level; 1: information that will be printed to the firebug 
 * console, 2: warnings that will be printed to the firebug 
 * console, 3: alert/errors that popup an alert message, 4: 
 * debug which are messages that are only printed to the 
 * console when debugMode is set to true.
 *
 * The notificationManager has a notify function and a debugMode
 * field. The debugMode field defaults to false but can be set
 * to true using: notificationManager.debugMode = true
 *
 * The notify function takes three arguments: the message, the notify
 * level of the message (either 1, 2, 3, 4, or 5), and an optional class for the message.
 * The message is the message to be displayed and the notify level, in conjunction with
 * the debugMode value, controls how and where the message is displayed.
 *
 * Usage examples:
 *
 *		notificationManager.notify('what is it', 1);
 *		notificationManager.notify('when is it', 2);
 *		notificationManager.notify('how is it', 3);
 *		notificationManager.notify('debugging is fun', 4)
 *  will exhibit the following behavior
 * 		i what is it			-- printed to firebug console
 *		! when is it			-- printed to firebug console
 *		how is it				-- in a popup alert
 * 
 * the level 4 call is not displayed because debugMode is false.
 * 
 ****
 *		notificationManager.debugMode = true;
 *		notificationManager.notify('what is it', 1);
 *		notificationManager.notify('when is it', 2);
 *		notificationManager.notify('how is it', 3);
 *		notificationManager.notify('debugging is fun', 4)
 *  will exhibit the following behavior
 *		Notify debug: what is it			-- printed to firebug console
 *		Notify debug: when is it			-- printed to firebug console
 *		Notify debug: how is it				-- printed to firebug console
 *		Notify debug: debugging is fun		-- printed to firebug console
 *
 * when debugMode is set to true, all notify calls are printed to console.
 */
 
/**
 * notificationManager object
 */
var notificationManager = {
	mode:null,
	count: 0,
	debugMode: false,
	levels: {
		1: 'info',
		2: 'warn',
		3: 'alert',
		4: 'log',
		5: 'fatal'
	},
	latestMessages: [],
	/*
	 * @param message the message to display
	 * @param level the importance level of the message
	 * @param messageClass the css class to give the div
	 * @param divId (optional) the div to display the message in
	 */
	notify: function(message, level, messageClass, divId){
		if(level){
			var notifyLevel = this.levels[level];
			if(this.debugMode){
				if(window.console){
					if(!notifyLevel){
						notifyLevel = 'log';
					}
					if(notifyLevel=='alert'){
						notifyLevel = 'error';
					}
					window.console[notifyLevel]('Notify debug: ' + message);
				} else {
					this.notifyAlert('Notify debug: ' + message, messageClass, divId);
				}
			} else {
				if(notifyLevel){
					if(notifyLevel=='alert'){
						//this.notifyAlert('Notify message: <br/><br/>' + message);
						this.notifyAlert(message, messageClass, divId);
					} else if(notifyLevel=='fatal'){
						eventManager.fire('fatalError', message);
					} else if(notifyLevel!='log'){
						if(window.console && window.console[notifyLevel]){
							window.console[notifyLevel](message);
						} else {
							// do nothing.
						}
					}
				}
			}
		} else {
			//this.notifyAlert('Notify message: <br/><br/>' + message);
			this.notifyAlert(message, messageClass, divId);
		}
	},
	notifyAlert: function(msg, messageClass, divId){
		new AlertObject(this.generateUniqueMessageDiv(messageClass, divId), msg, this.mode, divId);
	},
	generateUniqueMessageDiv: function(messageClass, divId){
		var customClass = '';
		if(messageClass){
			customClass = messageClass;
		}
		var id = 'message_' + this.count;
		if($('#' + id).size()!=0){
			this.count ++;
			return generateUniqueMessageDiv();
		} else {
			$('.message').each(function(){
				if(!$(this).hasClass('keepMsg')){
					$(this).remove(); // remove any existing alerts
				}
			});
			$('.authoringMessages').each(function(){
				if(!$(this).hasClass('keepMsg')){
					$(this).remove(); // remove any existing alerts
				}
			});
			//if in authoring mode
			if(this.mode && this.mode=='authoring'){
				$('#notificationDiv').append('<div class="authoringMessages ' + customClass + '"><span id="' + id + '" onClick="notificationEventManager.fire(\'removeMsg\',\'' + id + '\')"></span></div>');
			} else if(divId != null) {
				$('#' + divId).append('<div id="' + id + '" class="' + customClass + '" style="display:none;" onClick="notificationEventManager.fire(\'removeMsg\',\'' + id + '\')"></div>');
			} else {
				//$('body').append('<div id="' + id + '" class="message ' + customClass + '" style="display:none;" onClick="notificationEventManager.fire(\'removeMsg\',\'' + id + '\')"></div>');
				$('#vle_messages').append('<div id="' + id + '" class="message ' + customClass + '" style="opacity:0;"><span class="content"></span><a class="hide" title="Dismiss" onClick="notificationEventManager.fire(\'removeMsg\',\'' + id + '\')"></a></div>');
			}
			this.count ++;
			return id;
		}
	},
	setMode: function(mode){
		this.mode = mode;
	},
	alertClosing:undefined,
	viewLatest:undefined,
	closeNotifyWindow:undefined,
	init: function(ac, vl, cnw){
		alertClosing = ac;
		viewLatest = vl;
		closeNotifyWindow = cnw;
		window.notificationEventManager = new EventManager();
		notificationEventManager.addEvent('removeMsg');
		notificationEventManager.addEvent('alertClosing');
		notificationEventManager.addEvent('viewLatest');
		notificationEventManager.addEvent('closeNotifyWindow');
		notificationEventManager.subscribe('alertClosing', this.alertClosing);
		notificationEventManager.subscribe('viewLatest', this.viewLatest);
		notificationEventManager.subscribe('closeNotifyWindow', this.closeNotifyWindow);
		
		// TODO: standardize for authoring, grading, etc.
		if($('#vle_messages').length == 0){
			$('body').prepend('<div id="vle_messages"></div>');
		}
		
		// taking out, as we don't use this anymore
		//var mainMessage = createElement(document, 'div', {id:'mainMessageDiv', 'class':'minimessage'});
		//document.body.appendChild(mainMessage);
		//mainMessage.style.left = (document.body.clientWidth / 2) - 150;
		//mainMessage.innerHTML = '<div id="mainMessageMessage" onclick="notificationEventManager.fire(\'viewLatest\')">view last three notifications</div>';
	}(
			function(type,args,obj){
				if(notificationManager.latestMessages.length<3){
					notificationManager.latestMessages.push(args[0]);
				} else {
					notificationManager.latestMessages.shift();
					notificationManager.latestMessages.push(args[0]);
				}
			}/*,
			function(type,args,obj){
				var mainMessage = document.getElementById('mainMessageDiv');
				mainMessage.setAttribute('class', 'messages');
				var html = 'Notify Messages: <br/><br>';
				
				for(var b=0;b<notificationManager.latestMessages.length;b++){
					html += notificationManager.latestMessages[b].substring(26,notificationManager.latestMessages[b].length) + '<br/><br/>';
				}
				
				html += '<div id="mainMessageMessage" onclick="notificationEventManager.fire(\'closeNotifyWindow\')"><font color="blue">close</font></div>';
				
				mainMessage.innerHTML = html;
			},
			function(type,args,obj){
				var mainMessage = document.getElementById('mainMessageDiv');
				mainMessage.setAttribute('class', 'minimessage');
				mainMessage.innerHTML = '<div id="mainMessageMessage" onclick="notificationEventManager.fire(\'viewLatest\')">view last three notifications</div>';
			}*/)
};

/**
 * The Alert Object takes a html div element and a message, displays the given
 * message at the top of the page for the time specified in MSG_TIME and then
 * removes the element from the page.
 */
function AlertObject(elId, msg, mode, divId){
	
	this.MSG_TIME = 10000;
	this.elId = elId;
	this.msg = msg;
	if(mode){
		this.mode = mode;
	}
	notificationEventManager.subscribe('removeMsg', this.removeMsg, this);
	if(this.mode && this.mode == 'authoring'){
		this.MSG_TIME = 30000;
		$('#' + this.elId).prepend(msg);
		eventManager.fire('browserResize');
		if(!$('#' + this.elId).parent().hasClass('keepMsg')){
			setTimeout('notificationEventManager.fire("removeMsg","' + this.elId + '")', this.MSG_TIME);
		}
	} else {
		//insert the message into the div
		if($('#' + this.elId).length){
			$('#' + this.elId + '> .content').html(msg);
		} else {
			$('#' + this.elId).html(msg);
		}
		
		//show the div
		$('#' + this.elId).show();
		//$('#' + this.elId).css({'display':'block', 'left':(document.body.clientWidth / 2) - 150, 'top':(document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)});
		var msgHeight = $('#vle_messages').height();
		$('#' + this.elId).animate({opacity:1});
		$('#vle_body').css({top:msgHeight});
		eventManager.fire('browserResize');
		if(!$('#' + this.elId).hasClass('keepMsg')){
			setTimeout('notificationEventManager.fire("removeMsg","' + this.elId + '")', this.MSG_TIME);
		}
	}
	
};

/**
 * Removes the message that this object represents from the page.
 */
AlertObject.prototype.removeMsg = function(type,args,obj){
	if(args[0]==obj.elId){
		var mode = obj.mode;
		if(mode && mode=='authoring'){
			$('#' + obj.elId).parent().remove();
			$('#notificationDiv').css('margin-top','.25em');
		} else {
			$('#' + obj.elId).remove();
			// if in project view, reset #vle_body top position
			var msgHeight = $('#vle_messages').height();
			$('#vle_body').css({top:msgHeight});
		}
		eventManager.fire('browserResize');
		notificationEventManager.fire('alertClosing', obj.msg);
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/util/NotificationManager.js');
}