/**
 * Creates a custom Keystroke Manager object that listens for the onkeyup and
 * onkeydown events and fires the associated event when a given pattern of
 * keystrokes occurs.
 * 
 * Usage: createKeystrokeManager(eventManager, shortcuts) where shortcuts is
 * an array of shortcuts to listen for. Each item in the array is an array of
 * arguments, the same that would be passed in when calling addShortcut.
 * 
 * addShortcut takes three arguments: the event name - the name of the event to
 * fire when the given keystrokes occur, keycode - the keycode of the key to
 * listen for and optionally special keys - an array of special keys that are
 * pressed at the same time as the key of the given keycode.
 * 
 * Examples: 
 * 
 * addShortcut('rightArrowPressed', 39) - the keystroke manager will fire
 * the event 'rightArrowPressed' when the right arrow is pressed.
 * 
 * addShortcut('rightArrowAndShiftPressed', 39, ['shift']) - the keystroke
 * manager will fire the event 'rightArrowAndShiftPressed' when both the
 * right arrow and the shift key are pressed together.
 * 
 * addShortcut('rightArrowShiftAndCtrlPressed', 39, ['shift','ctrl']) - the
 * keystroke manager will fire the event 'rightArrowShiftAndCtrlPressed' when
 * the right arrow, shift key and ctrl key are pressed together.
 */
function createKeystrokeManager(eventManager, shortcuts){
	return function(em,sc){
		var eventManager = em;
		var shortcuts = {};
		var old_onkeydown;
		var old_onkeyup;
		var old_onkeypress;
		var altkeydown = false;
		var shiftkeydown = false;
		var ctrlkeydown = false;
		
		/* Keeps track of which of the special keys have been pressed */
		var trackSpecials = function(e){
			/* tracks the alt keypress */
			if(e.altKey){
				altkeydown = true;
			} else {
				altkeydown = false;
			}
			
			/* tracks the ctrl keypress */
			if(e.ctrlKey){
				ctrlkeydown = true;
			} else {
				ctrlkeydown = false;
			}
			
			/* tracks the shift keypress */
			if(e.shiftKey){
				shiftkeydown = true;
			} else {
				shiftkeydown = false;
			}
		};
		
		/* Listens for the keypress event */
		var processKeypress = function(e){
			/* catch the delete and backspace keystrokes and disallow if not in textarea or input */
			if(e.keyCode==8 || e.keyCode==13 || e.keyCode==46 || e.keyCode==63272){
				if(document.activeElement){
					if(!(document.activeElement.nodeName=='TEXTAREA' || document.activeElement.nodeName=='INPUT')){
						return false;
					}
				} else {
					return false;
				}
			}
		};
		
		/* Listens for the keyup event */
		var processUp = function(e){
			/* catch the delete and backspace keystrokes and disallow if not in textarea or input */
			if(e.keyCode==8 || e.keyCode==13 || e.keyCode==46 || e.keyCode==63272){
				if(document.activeElement){
					if(!(document.activeElement.nodeName=='TEXTAREA' || document.activeElement.nodeName=='INPUT')){
						return false;
					}
				} else {
					return false;
				}
			}
			
			trackSpecials(e);
		};
		
		/* Listens for the keydown event */
		var processDown = function(e){
			/* catch the delete and backspace keystrokes and disallow if not in textarea or input */
			if(e.keyCode==8 || e.keyCode==13 || e.keyCode==46 || e.keyCode==63272){
				if(document.activeElement){
					if(!(document.activeElement.nodeName=='TEXTAREA' || document.activeElement.nodeName=='INPUT')){
						return false;
					}
				} else {
					return false;
				}
			}
			trackSpecials(e);
			
			var shortcut = shortcuts[e.keyCode];
			
			/* only continue processing if shortcut with that keyCode has been created */
			if(shortcut){
				//get any special keys that are currently being pressed
				var activeSpecials = [];
				if(e.ctrlKey){
					activeSpecials.push('ctrl');
				}
				if(e.altKey){
					activeSpecials.push('alt');
				}
				if(e.shiftKey){
					activeSpecials.push('shift');
				}
				
				for(var e=0;e<shortcut.specials.length;e++){
					var special = shortcut.specials[e];
					/* if special keys exist, compare against active special keys and fire event if they match */
					if(special && special.length==activeSpecials.length){
						special.sort();
						activeSpecials.sort();
						if(special.compare(activeSpecials)){
							eventManager.fire(shortcut.events[e]);
						}
					/* if special keys do not exist and no active special keys then fire event */
					} else if(!special && activeSpecials.length==0){
						eventManager.fire(shortcut.events[e]);
					}
				}
			}
		};
		
		/* Preserves the current windows onkeydown and onkeyup functions and overwrites them with custom listeners. */
		var startListener = function(){
			old_onkeydown = window.onkeydown;
			old_onkeyup = window.onkeyup;
			old_onkeypress = window.onkeypress;
			window.onkeydown = processDown;
			window.onkeyup = processUp;
			window.onkeypress = processKeypress;
		};
		
		/* stops the listener and restores the state of the original onkeydown and onkeyup functions */
		var stopListener = function(){
			window.onkeydown = old_onkeydown;
			window.onkeyup = old_onkeyup;
			window.onkeypress = old_onkeypress;
		};
		
		/* Adds a shortcut to listen for given the keycode, special keys and the
		 * event name to fire when the keystrokes occur. */
		var addShortcut = function(eventName, keycode, specials){
			var shortcut = shortcuts[keycode];
			
			if(eventName && keycode){
				if(!shortcut){
					shortcuts[keycode] = {
						events:[],
						specials:[]
					};
					shortcut = shortcuts[keycode];
				}
				shortcut.events.push(eventName);
				shortcut.specials.push(specials);
			} else {
				alert('unable to add shortcut, check eventName or keycode');
			}
		};
		
		/* cycle through any of the given shortcuts and add them */
		if(sc){
			for(var r=0;r<sc.length;r++){
				addShortcut(sc[r][0], sc[r][1], sc[r][2]);
			}
		}
		
		/* start listening */
		startListener();
		
		/* public methods */
		return {
			/* Adds a shortcut to listen for given the keycode, special keys and the
			 * event name to fire when the keystrokes occur. */
			addShortcut:function(eventName, keycode, specials){addShortcut(eventName,keycode,specials);},
			/* stops the listener and restores the state of the original onkeydown and onkeyup functions */
			stopListener:function(){stopListener();},
			/* Preserves the current windows onkeydown and onkeyup functions and overwrites them with custom listeners. */
			startListener:function(){startListener();},
			/* Returns true if the alt key has been pressed, false otherwise */
			isAltkeydown:function(){return altkeydown;},
			/* Returns true if the shift key has been pressed, false otherwise */
			isShiftkeydown:function(){return shiftkeydown;},
			/* Returns true if the ctrl key has been pressed, false otherwise */
			isCtrlkeydown:function(){return ctrlkeydown;}
		};
	}(eventManager,shortcuts);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/util/keystrokemanager.js');
}