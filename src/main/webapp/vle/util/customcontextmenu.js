function createCustomContextMenu(eventManager){
	return function(em){
		var eventManager = em;
		var cursor = {x:0,y:0};
		var old_onmousemove;
		var old_oncontextmenu;
		
		/* gets the cursor position each time the mouse moves */
		var getCursorPos = function(e){
			cursor.x = e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
			cursor.y = e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
		};
		
		/* custom context menu */
		var customContextMenu = function(){
			//get the absolute x, y positions
			var posX = cursor.x - (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
			var posY = cursor.y - (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
			
			//get element that pointer is currently over
			var overEl = document.elementFromPoint(posX, posY);
			var menu = document.getElementById('contextMenu');
			
			//clear old elements
			while(menu.firstChild){
				menu.removeChild(menu.firstChild);
			};
			
			//create standard elements
			var createTask = createElement(document, 'div', {id: 'contextCreateTask', onclick: 'hideElement("contextMenu");eventManager.fire("createTODOTask")'});
			var createTaskText = document.createTextNode('Create new TODO task');
			var cancelMenu = createElement(document, 'div', {id: 'contextCloseMenuDiv', onclick: 'hideElement("contextMenu");'});
			var cancelMenuText = document.createTextNode('Close menu');
			
			menu.appendChild(createTask);
			createTask.appendChild(createTaskText);
			menu.appendChild(cancelMenu);
			cancelMenu.appendChild(cancelMenuText);
			
			//determine if this is a todo-able element by parsing id
			if(overEl){
				var rawId = overEl.id;
				if(rawId){
					var childId = overEl.id.split('--')[1];
					
					if(childId && childId!=''){
						//create and insert new child
						var child = createElement(document, 'div', {id:'contextCreateSpecificTODODiv', onclick: 'eventManager.fire("createTODOTask","' + childId + '")'});
						var text = document.createTextNode('Create new TODO task for node: ' + childId);
						menu.insertBefore(child, document.getElementById('contextCloseMenuDiv'));
						child.appendChild(text);
						
						//get the node object
						var node = env.getProject().getNodeById(childId);
						
						//check if it is a review sequence
						if((node.peerReview && node.peerReview != '') || (node.teacherReview && node.teacherReview != '')) {
							//it is a review sequence
							var reviewGroup = node.reviewGroup;
							
							//make the clickable choice that can be clicked in the right click menu
							var peerReviewChild = createElement(document, 'div', {id:'contextCreateSpecificTODODiv', onclick: 'eventManager.fire("cancelReviewSequence",' + reviewGroup + ')'});
							
							//the text that will be displayed in the menu
							var peerReviewText = document.createTextNode('Cancel Review Sequence Group: ' + reviewGroup);
							
							//insert the elements into the menu
							menu.insertBefore(peerReviewChild, document.getElementById('contextCloseMenuDiv'));
							peerReviewChild.appendChild(peerReviewText);
						}
					};
				};
			};
			
			//set up additional menu styling
			menu.style.display = 'block';
			menu.style.position = 'absolute';
			menu.style.left = cursor.x;
			menu.style.top = cursor.y;
			return false;
		};
		
		/* preserves the functions for onmousemove and oncontextmenu and starts listening for these events */
		var startListening = function(){
			old_onmousemove = window.onmousemove;
			old_oncontextmenu = window.oncontextmenu;
			
			/* start chasing the mouse around and record the x,y coordinates */
			window.onmousemove = getCursorPos;
			/* take over the right click menu */
			window.oncontextmenu = customContextMenu;
		};
		
		/* stops listening and restores the original onmousemove and oncontextmenu functions */
		var stopListening = function(){
			window.onmousemove = old_onmousemove;
			window.oncontextmenu = old_oncontextmenu;
		};
		
		/* start listening */
		startListening();
		
		/* public methods */
		return {
			getCursor:function(){return cursor;},
			startListening:function(){startListening();},
			stopListening:function(){stopListening();}
		};
	}(eventManager);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/util/customcontextmenu.js');
};

