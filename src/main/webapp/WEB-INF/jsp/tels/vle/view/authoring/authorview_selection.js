/**
 * Functions specific to the selection process in the project layout for the authoring view
 * 
 * @author patrick lawler
 * @author jonathan breitbart
 * 
 */

/**
 * Toggles whether the element with the given id is selected or not
 */
View.prototype.selectClick = function(id){
	$('.node').each(function(){$(this).removeClass('editing');});
	
	if(this.selectModeEngaged){
		if(this.disambiguateMode){
			return;
		} else {
			this.processSelected(id);
		}
	} /*else if(id!='uSeq' && id!='uNode' && id.split('--')[1]!=this.project.getRootNode().id) {
		var node = $('#' + $.escapeId(id));
		
		//if(this.keystrokeManager.isShiftkeydown()){ //toggle selected for node
			if(node.hasClass('selected')){
				node.removeClass('selected');
			} else {
				node.addClass('selected');
			}
		//} else { //clear previous and select only node
			//this.clearAllSelected();
			//node.addClass('selected');
		}
	}*/
};

View.prototype.selectBoxClick = function(id){
	if(this.selectModeEngaged){
		return;
	} else if(id!='uSeq' && id!='uNode' && id.split('--')[1]!=this.getProject().getRootNode().id) {
		var node = $('#' + $.escapeId(id));
		
		//if(this.keystrokeManager.isShiftkeydown()){ //toggle selected for node
			if(node.hasClass('selected')){
				node.removeClass('selected');
			} else {
				node.addClass('selected');
			}
		/*} else { //clear previous and select only node
			this.clearAllSelected();
			node.addClass('selected');
		}*/
	}
	this.updateSelectCounts();
};

/**
 * De-selects all selectable project elements
 */
View.prototype.clearAllSelected = function(){
	$('.selectNodeInput').removeAttr('checked');
	$('.node').removeClass('selected');
	$('.seq').removeClass('selected');
	$('#editNodeTools button').attr('disabled','true');
	$('#editNodeTools .action-icon').addClass('action-icon-inactive');
	this.updateSelectCounts();
};

/**
 * Selects all selectable project elements
 */
View.prototype.selectAll = function(){
	if(!this.selectModeEngaged){
		$('.selectNodeInput').attr('checked','true');
		$('.node').addClass('selected');
		$('.seq').addClass('selected');
		$('#editNodeTools button').removeAttr('disabled');
		$('#editNodeTools .action-icon').removeClass('action-icon-inactive');
		eventManager.fire('unhideNodes'); // show all steps
		this.updateSelectCounts();
	}
};

/**
 * Updates node count display for each sequence
 */
View.prototype.updateSelectCounts = function(){
	$('.seq').each(function(){
		var split = $(this).attr('id').split('--');
		var sequenceId = split[1];
		var id = sequenceId + '_count';
		var selectedNodes = 0;
		$('[id^='+sequenceId+']').each(function(){
			if($(this).hasClass('selected')){
				selectedNodes++;
			}
		});
		if(selectedNodes>0){
			$('#'+id+' .selectCount').html(' ('+ selectedNodes +' Selected)');
		} else {
			$('#'+id+' .selectCount').html('');
		}
	});
	
	var selected = this.getSelected();
	if(selected.seqs.length<1 && selected.nodes.length<1){ // if no nodes are selected, disable edit node buttons)
		$('#editNodeTools button').attr('disabled','true');
		$('#editNodeTools .action-icon').addClass('action-icon-inactive');
	} else {
		$('#editNodeTools button').removeAttr('disabled');
		$('#editNodeTools .action-icon').removeClass('action-icon-inactive');
		var reviewNodeSelected = false;
		selected.nodes.each(function(){
			//var classes = this.classList; // html5 classList not yet working in Webkit broswers
			var classes = $(this).attr('class').split(/\s+/);
			for(i=0;i<classes.length;i++){
				if(classes[i]=='reviewNode'){
					reviewNodeSelected = true;
				}
			}
		});
		if(selected.seqs.length>0 || selected.nodes.length>1 || reviewNodeSelected){ // if any sequence or more than one node is selected, disable mirror button
			$('#useButton').attr('disabled','true');
			$('#useButton .action-icon').addClass('action-icon-inactive');
		} else {
			$('#useButton').removeAttr('disabled');
			$('#useButton .action-icon').removeClass('action-icon-inactive');
		}
		
		if(selected.seqs.length>0 && selected.nodes.length>0) { // if at least one activity and step are selected and project mode is simple, disable move button
			if(this.simpleProject){
				$('#moveSelected').attr('disabled','true');
				$('#moveSelected .action-icon').addClass('action-icon-inactive');
			}
		}
	}
};

/**
 * Returns a custom object of nodes represented by the elements on this page
 * that are currently 'selected'.
 * 
 * obj.master = node (master sequence)	- null if master seq is not selected
 * obj.seqs = [seq 1, seq 2...]			- empty list if no seqs are selected
 * obj.nodes = [node 1, node 2...]		- empty list if no nodes are selected
 */
View.prototype.getSelected = function(){
	var o = {master: null, seqs: [], nodes: []};
	o.master = $('.selected.master');
	o.seqs = $('.selected.seq');
	o.nodes = $('.selected.node');
	o.ordered = $('.projectNode.selected');
	return o;
};

/**
 * Removes the selected nodes and sequences from the project and refreshes authoring.
 */
View.prototype.deleteSelected = function(){
	var selected = this.getSelected();
	var view = this;
	var reviewAlert = '';
	var seqAlert = '';
	
	if(selected.nodes.size()>0){
		for(var i=0;i<selected.nodes.size();i++){
			var id = selected.nodes[i].id.split('--')[1];
			var projectNode = view.getProject().getNodeById(id);
			if(projectNode.reviewGroup){
				reviewAlert = '\n\nAlso, deleting any Steps that are part of a Student or Teacher Review Sequence will also remove that Review Sequence.';
			}
		}
	}
	if(selected.seqs.size()<1 && selected.nodes.size()<1){//if none are selected, notify user
		this.notificationManager.notify('Select one or more items before activating this tool.', 3);
	} else {
		var message = 'Are you sure you want to delete ';
		if(selected.seqs.size()>0){
			seqAlert = '\n\nIf you delete an Activity, any Steps that Activity contains will be unattached and will be moved to the Inactive Steps section.';
			if(selected.seqs.size()==1){
				message = message + '1 Activity';
			}
			if(selected.seqs.size()>1){
				message = message + selected.seqs.size() + ' Activities';
			}
			if(selected.nodes.size()>0){
				message = message + ' and ';
			} else {
				message = message + '?';
			}
		}
		
		if(selected.nodes.size()==1){
			message = message + '1 Step?';
		}
		if(selected.nodes.size()>1){
			message = message + selected.nodes.size() + ' Steps?';
		}
		
		message = message + '\n\nWARNING: This operation is permanent!\n\nAs an alternative, you can move items to the Inactive Activities & Steps sections.  Those items do not show up when students run the project, but are saved for possible future use.' + seqAlert + reviewAlert;
		
		
		if(confirm(message)){
		
			if(selected.master.size()>0){
				this.notificationManager.notify('Deleting the master activity for a project is not allowed.');
			};
			
			//remove selected seqs - any attached nodes will remain as leaf nodes in project
			selected.seqs.each(function(ndx){
				var id = this.id.split('--')[1];
				view.getProject().removeNodeById(id);
			});
			
			//remove selected nodes
			var reviewGroupNumbers = [];
			selected.nodes.each(function(ndx){
				var id = this.id.split('--')[1];
				var projectNode = view.getProject().getNodeById(id);
				
				/* if this is a regular node, we need to remove its file from the server as well
				 * as any duplicate nodes from the project, otherwise, we just need to remove the
				 * the duplicate node from the project */
				if(projectNode.type=='DuplicateNode'){
					/* this is a duplicate node, so just remove it from the project */
					view.getProject().removeNodeById(id);
				} else {
					/* this is a regular node, remove file from server as well as project, also
					 * need to remove any duplicates of this node from the project. */
					
					// if this node is part of review sequence, also remove the review sequence
					if(projectNode.reviewGroup){
						// check if we've already added this reviewGroup number to the array to be deleted
						if(reviewGroupNumbers.indexOf(projectNode.reviewGroup)==-1){
							reviewGroupNumbers.push(projectNode.reviewGroup); //add to array of reviewGroups to be deleted
						}
					}
					
					var dups = view.getProject().getDuplicatesOf(id, true);
					
					view.utils.removeNodeFileFromServer(view,id);
					
					for(var x=0;x<dups.length;x++){
						view.getProject().removeNodeById(dups[x].id);
					}
				}
			});
			//cancel reviewGroups to be deleted
			for(var a=0;a<reviewGroupNumbers.length;a++){
				view.getProject().cancelReviewSequenceGroup(reviewGroupNumbers[a]);
			}
			
			this.saveProject();
			
			//refresh
			this.generateAuthoring();
		}
	};
};

/**
 * Duplicates the selected sequences and nodes and refreshes project.
 */
View.prototype.duplicateSelected = function(){
	var selected = this.getSelected();

	if(selected.seqs.size()==0 && selected.nodes.size()==0 && selected.master.size()==0){
		this.notificationManager.notify('Select one or more items before activating this tool.', 3);
		return;
	};
	
	if(confirm('Are you sure you want to duplicate the selected item(s)')){
		var nodeIds = [];
		
		if(selected.master.size()>0){
			nodeIds.push(selected.master.get(0).id.split('--')[1]);
		};
		
		selected.seqs.each(function(ndx){
			nodeIds.push(this.id.split('--')[1]);
		});
		
		selected.nodes.each(function(ndx){
			nodeIds.push(this.id.split('--')[1]);
		});

		var allCopied = function(type,args,obj){
			var msg;
			
			if(args[1]){
				msg = args[1] + ' COPYING COMPLETE, refreshing project.';
			} else {
				msg = 'COPYING COMPLETE, refreshing project';
			};
			
			obj.notificationManager.notify(msg, 3);
			obj.loadProject(obj.getProject().getUrl(), obj.getProject().getContentBase(), true);
		};
		
		var eventName = this.getProject().generateUniqueCopyEventName();
		this.eventManager.addEvent(eventName);
		this.eventManager.subscribe(eventName, allCopied, this);

		this.getProject().copyNodes(nodeIds, eventName);
	};
};

/**
 * Verifies and moves the selected elements to a location that the user specifies
 */
View.prototype.moveSelected = function(){
	var selected = this.getSelected();
	var view = this;
	
	//if nothing is selected, notify user and return
	if(selected.seqs.size()==0 && selected.nodes.size()==0 && selected.master.size()==0){
		this.notificationManager.notify('Select one or more items before activating this tool.', 3);
		return;
	}
	
	//if master seq is selected ignore and notify user
	if(selected.master.size() > 0){
		this.notificationManager.notify('The master sequence cannot be moved.', 3);
		if(selected.seqs.size()==0 && selected.nodes.size()==0){//return because nothing else to do
			return;
		} else {
			selected.master.removeClass('selected');
			selected.master = null;
		}
	}
	
	/* if this is a simpleProject and both nodes and sequences are selected, notify user and return */
	if(this.simpleProject && selected.seqs.size()>0 && selected.nodes.size()>0){
		this.notificationManager.notify('In Simple Project mode, only select either steps or activities, not both.',3);
		return;
	}
	
	//highlight (gray out) selected elements
	selected.seqs.each(function(ndx){
		//view.removeChildrenHTML(view,this);
		//this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
		$(this).addClass('moving');
		if(view.simpleProject){
			var seqId = this.id.split('--')[1];
			$('.node').each(function(){
				var seq = this.id.split('--')[0];
				if(seq == seqId){
					$(this).addClass('moving');
				}
			});
			view.eventManager.fire("hideNodes");
		}
	});
	
	selected.nodes.each(function(ndx){
		//this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
		$(this).addClass('moving');
	});
	
	/* start the select mode and specify the selectedType and the correct message */
	if(this.simpleProject){
		if(selected.seqs.size()>0){
			var msg = this.defaultSequenceSelectMessage;
			this.selectedType = 'sequence';
		} else {
			var msg = this.defaultNodeSelectMessage;
			this.selectedType = 'node';
		}
	} else {
		var msg = this.defaultSelectModeMessage;
	}
	
	this.engageSelectMode(this.moveCallback, msg, [selected]);
};

/**
 * Given a node (@param node), removes all children html elements recursively
 */
View.prototype.removeChildrenHTML = function(view, node){
	//get DOM node
	var dNode = document.getElementById(node.id);
	
	//get nodes sibling by going up wrapper then in the other 'tr'
	var sib = dNode.parentNode.parentNode.nextSibling;
	if(sib){
		sib = sib.childNodes[1].firstChild;
	}
	
	//do this for all valid siblings (sibling's first part of id == node's middle id)
	while(sib && sib.id.split('--')[0]==dNode.id.split('--')[1]){
		//if this node is a sequence, it might have children too that need to be removed
		if(view.getProject().getNodeById(sib.id.split('--')[1]).type=='sequence'){
			view.removeChildrenHTML(view, sib);
		}
		
		//remove sibling from html
		sib.parentNode.parentNode.parentNode.removeChild(sib.parentNode.parentNode);
		
		//get next sibling
		sib = dNode.parentNode.parentNode.nextSibling;
		if(sib){
			sib = sib.childNodes[1].firstChild;
		}
	}
};

/**
 * Verifies and retrieves selected elements, creates duplicates of them and prompts
 * the user to place them in the project.
 */
View.prototype.useSelected = function(){
	var selected = this.getSelected();
	
	/* if any sequences or the master sequence is selected, notify user and return */
	if(selected.seqs.size()>0 || selected.master.size()>0){
		this.notificationManager.notify('Neither activities nor the master sequence can be duplicated, ignoring.', 3);
		return;
	}
	
	/* if more than one node is selected or none is selected, notify user and return */
	if(selected.nodes.size()!=1){
		this.notificationManager.notify('Select at least one, but no more than one, step before activating this tool.',3);
		return;
	}
	
	if(confirm('ADVISORY: This tool creates a mirror copy of the selected item not a true duplicate.  Mirror copies remain linked and share the same data. Mirror copies should only be used for Adaptive (branching) projects that branch, otherwise use the Duplicate tool. Are you sure you wish to continue?')){
		/* validation completed, proceed with creating duplicate nodes 
		 * for any that remain in the list */
		
		/* create a duplicate node for the node in the list */
		var listNode = selected.nodes.get(0);
		var projectNode = this.getProject().getNodeById(listNode.id.split('--')[1]);
		
		/* if the specified node is also a duplicate, we want the new duplicate
		 * to reference the original node, not another duplicate */
		if(projectNode.type=='DuplicateNode'){
			projectNode = projectNode.getNode(); //get node returns the real node for this duplicate
		}
		
		var duplicateNode = new DuplicateNode('DuplicateNode', this);
		duplicateNode.id = this.getProject().generateUniqueId('duplicate');
		duplicateNode.realNode = projectNode;
		this.getProject().getLeafNodes().push(duplicateNode);
		
		/* duplicate node created, so save the project and refresh the project
		 * starting the selection tool so that the duplicate may be placed in
		 * the project. */
		this.saveProject();
		this.placeNode = true;
		this.placeNodeId = duplicateNode.id;
		this.loadProject(this.getProject().getContentBase() + this.utils.getSeparator(this.getProject().getContentBase()) + this.getProject().getProjectFilename(), this.getProject().getContentBase(), true);
	}
};

/**
 * Callback which does actual moving of the selected (@param selected) nodes,
 * depending on the selected location (@param id) and the types and locations
 * of the selected nodes.
 */
View.prototype.moveCallback = function(id, args){
	var selected = args[0];
	var use2x = args[1];
	
	if(id==-1){//user canceled, refresh and return
		this.generateAuthoring();
		return;
	} else if(id=='uSeq'){//only move sequences to unattached sequences
		if(selected.nodes.size()>0){
			this.notificationManager.notify('Only Activities can be moved into the Inactive Activities area.', 3);
		}
		var removed = this.removeFromProject(selected.seqs, use2x);
		
		//place them back in the beginning of the projectList
		if(!use2x){
			for(var b=0;b<removed.length;b++){
				this.getProject().getSequenceNodes().unshift(removed[b]);
			}
		}
	} else if(id=='uNode'){//only move nodes to unattached nodes
		if(selected.seqs.size()>0){
			this.notificationManager.notify('Only Steps can be moved into the Inactive Steps area.', 3);
		}	
		var removed = this.removeFromProject(selected.nodes, use2x);
		
		//place them back in the beginning of the projectList
		if(!use2x){
			for(var b=0;b<removed.length;b++){
				this.getProject().getLeafNodes().unshift(removed[b]);
			}
		}
	} else {//must be a id object id.after = boolean  id.id = string
		var pIdLoc = id.id.split('--');
		var toNode = this.getProject().getNodeById(pIdLoc[1]);
		if(id.after){//move selected after node - selected become siblings
			if(pIdLoc[0]!='null'){
				var parent = this.getProject().getNodeById(pIdLoc[0]);
				
				//enforce project structure
				if(this.simpleProject){
					if(toNode.type=='sequence'){//only sequences can be siblings to sequences in simple project mode
						var removed = this.removeFromProject(selected.seqs, use2x);
						if(selected.nodes.size()>0){
							this.notificationManager.notify('You are attempting to place Steps(s) at the same level as Actvities. If you really wish to do this, switch to Advanced Project mode.', 3);
						}
					} else {//must be a node, only nodes can be siblings to nodes in simple project mode
						var removed = this.removeFromProject(selected.nodes, use2x);
						if(selected.seqs.size()>0){
							this.notificationManager.notify('You are attempting to place one or more Actvities at the same level as Steps. If you really wish to do this, switch to Advanced Project mode.', 3);
						}
					}
				} else {
					var removed = this.removeFromProject(selected.ordered, use2x);
				}
				
				//check if any of the review sequence nodes were moved out of order
				this.checkReviewSequenceOrder(removed, toNode);
				
				//get ndx after nodes have been removed
				var ndx = parent.children.indexOf(toNode) + 1;
				
				//now add them at appropriate location
				for(var f=0;f<removed.length;f++){
					var stack =[];
					
					parent.children.splice(ndx, 0, removed[f]);
					if(!this.getProject().validateNoLoops(parent.id, stack)){
						this.notificationManager.notify('Adding ' + removed[f].id + ' to ' + parent.id + ' would cause an infinite loop. Aborting change.', 3);
						parent.children.splice(ndx, 1);
					}
					
					if(!use2x){
						if(removed[f].type=='sequence'){
							this.getProject().getSequenceNodes().push(removed[f]);
						} else {
							this.getProject().getLeafNodes().push(removed[f]);
						}
					}
				}
			} else {//must exist in an unattached section
				if(this.getProject().getSequenceNodes().indexOf(toNode)==-1){//we are trying to move into unattached nodes
					if(selected.seqs.size()>0){
						this.notificationManager.notify('Only Steps can be moved into the Inactive Steps area.', 3);
					}
					var removed = this.removeFromProject(selected.nodes, use2x);
					var ndx = this.getProject().getLeafNodes().indexOf(toNode) + 1;
					
					if(!use2x){
						for(var g=0;g<removed.length;g++){
							this.getProject().getLeafNodes().splice(ndx, 0, removed[g]);
						}
					}
				} else {//we are trying to move into unattached sequences
					if(selected.nodes.size()>0){
						this.notificationManager.notify('Only Activities can be moved into the Inactive Activities area.', 3);
					}
					var removed = this.removeFromProject(selected.seqs, use2x);
					var ndx = this.getProject().getSequenceNodes().indexOf(toNode) + 1;
					
					if(!use2x){
						for(var h=0;h<removed.length;h++){
							this.getProject().getSequenceNodes().splice(ndx, 0, removed[h]);
						}
					}
				}
			}
		} else {//move selected to first location inside of node - selected become children
			if(toNode){
				//enforce project structure
				if(this.simpleProject){
					if(this.getProject().getRootNode().id==toNode.id){//this is the master, only allow sequences
						var removed = this.removeFromProject(selected.seqs, use2x);
						if(selected.nodes.size()>0){
							this.notificationManager.notify('You are attempting to place Step(s) outside of an Activity. If you  wish to do this, switch to Advanced Project mode.', 3);
						}
					} else {//must be a seq only process nodes in simple project mode
						var removed = this.removeFromProject(selected.nodes, use2x);
						if(selected.seqs.size()>0){
							this.notificationManager.notify('You are attempting to place one or more Activities within an Activity. If you  wish to do this, switch to Advanced Project mode.', 3);
						}
					}
				} else {//advanced project mode, proceed
					var removed = this.removeFromProject(selected.ordered, use2x);
				}
				
				//check if any of the review sequence nodes were moved out of order
				this.checkReviewSequenceOrder(removed, toNode);
				
				for(var j=0;j<removed.length;j++){
					var stack = [];
					//add to node
					toNode.children.splice(0, 0, removed[j]);
					
					//verify no infinite loops
					if(!this.getProject().validateNoLoops(toNode.id, stack)){
						this.notificationManager.notify('Adding ' + removed[j].id + ' to ' + toNode.id + ' would cause an infinite loop. Undoing change.', 3);
						toNode.children.splice(0, 1);
					}
					
					//add to project's node lists
					if(!use2x){
						if(removed[j].type=='sequence'){
							this.getProject().getSequenceNodes().push(removed[j]);
						} else {
							this.getProject().getLeafNodes().push(removed[j]);
						}
					}
				}
			} else {
				this.notificationManager.notify('Problems trying to move Steps. No items were moved.', 3);
			}
		}
	}
	$('.moving').each(function(){
		$(this).removeClass('moving');
	});
	this.eventManager.fire("showNodes");
	
	this.saveProject();
};

/**
 * Check that the review sequences are still in correct order of
 * 'start', 'annotate', 'revise'. If we find that the nodes
 * are out of order we will notify the user with a message but
 * we will not prevent them from performing the move.
 * @param removed, an array of nodes that were selected to be moved
 * @param toNode, the node that the array of nodes was moved to
 */
View.prototype.checkReviewSequenceOrder = function(removed, toNode) {
	var project = this.getProject();
	var nodeIds = project.getNodeIds();
	var reviewSeqs = {};
	for(var i=0; i<nodeIds.length; i++){
		var node = project.getNodeById(nodeIds[i]);
		if(node.reviewGroup){
			//if(reviewSeqs.)
		}
	}
	//loop through all the nodes that were selected to be moved
	for(var removedIndex=0; removedIndex<removed.length; removedIndex++) {
		//get one of the nodes that was selected to be moved
		var removedEl = removed[removedIndex];
		
		//get the id of the node we're moving
		var removedNodeId = removedEl.id;
		
		//check if the node is in a review group
		if(removedEl.reviewGroup) {
			/*
			 * the node is in a review group so we need to check that the
			 * node isn't being placed out of order
			 */
			
			var currentNodePhase = "";
			
			//get this node's review phase (e.g. 'start', 'annotate', or 'revise')
			if(removedEl.peerReview) {
				currentNodePhase = removedEl.peerReview;
			} else if(removedEl.teacherReview) {
				currentNodePhase = removedEl.teacherReview;
			}
			
			//variables to hold the positions of the phases
			var startPhasePosition = null;
			var annotatePhasePosition = null;
			var revisePhasePosition = null;
			
			//get the position we are moving this node to
			var toPosition = this.getProject().getPositionById(toNode.id);
			
			//set the position for this node's phase
			if(currentNodePhase == 'start') {
				startPhasePosition = toPosition;
			} else if(currentNodePhase == 'annotate') {
				annotatePhasePosition = toPosition;
			} else if(currentNodePhase == 'revise') {
				revisePhasePosition = toPosition;
			}
			
			/*
			 * get the other nodes that are in the review group,
			 * this will not contain any of the nodes that were
			 * selected for moving because they have been removed
			 * from the project during this move process
			 */
			var nodesInGroup = this.getProject().getNodesInReviewSequenceGroup(removedEl.reviewGroup);
			
			//loop through all the nodes in the review group
			for(var x=0; x<nodesInGroup.length; x++) {
				var tempNode = nodesInGroup[x];
				var tempNodeId = tempNode.identifier;
				var tempNodePosition = this.getProject().getPositionById(tempNodeId);
				var tempNodePhase = this.getProject().getReviewSequencePhaseByNodeId(tempNodeId);

				/*
				 * set the phase position
				 */
				if(tempNodePhase == 'start') {
					startPhasePosition = tempNodePosition;	
				} else if(tempNodePhase == 'annotate') {
					annotatePhasePosition = tempNodePosition;
				} else if(tempNodePhase == 'revise') {
					revisePhasePosition = tempNodePosition;
				}
			}
			
			var outOfOrder = false;
			//check if the start and annotate positions are the same
			if(startPhasePosition == annotatePhasePosition) {
				//check if this node's phase was the start
				if(currentNodePhase == 'start') {
					/*
					 * the start node was dropped onto the annotate node
					 * so they have the same position. when a node is moved
					 * on to another node, the node that is moved ends
					 * up after the other node. this means the start
					 * node will be after the annotate node which will make
					 * them out of order
					 */
					outOfOrder = true;
					//this.notificationManager.notify('Warning: You have placed the first step in a Review Sequence after the critique step. This will break the Review Sequence. Move aborted.', 3);
				}
			}
			
			//check if the start is after the annotate
			if(startPhasePosition && annotatePhasePosition &&
					this.getProject().positionAfter(startPhasePosition, annotatePhasePosition)) {
				//start is after annotate so this is out of order
				//if(currentNodePhase == 'start') {
					//this.notificationManager.notify('Warning: You have placed the first step in a Review Sequence after the critique step. This will break the Review Sequence.', 3);
				//} else if(currentNodePhase == 'annotate') {
					//this.notificationManager.notify('Warning: You have placed the critique step in a Review Sequence before the first step in the Sequence. This will break the Review Sequence.', 3);
				//}
				outOfOrder = true;
			}
			
			//check if the annotate and revise positions are the same
			if(annotatePhasePosition == revisePhasePosition) {
				//check if this node's phase was annotate
				if(currentNodePhase == 'annotate') {
					/*
					 * the annotate node was dropped onto the revise node
					 * so they have the same position. when a node is moved
					 * on to another node, the node that is moved ends
					 * up after the other node. this means the annotate
					 * node will be after the revise node which will make
					 * them out of order
					 */
					outOfOrder = true;
					//this.notificationManager.notify('Warning: You have placed the critique step in a Review Sequence after the revise step. This will break the Review Sequence.', 3);
				}
			}
			
			//check if the annotate is after the revise
			if(annotatePhasePosition && revisePhasePosition &&
					this.getProject().positionAfter(annotatePhasePosition, revisePhasePosition)) {
				//annotate is after the revise so this is out of order
				//if(currentNodePhase == 'annotate') {
					//this.notificationManager.notify('Warning: You have placed the critique step in a Review Sequence after the revise step. This will break the Review Sequence.', 3);							
				//} else if(currentNodePhase == 'revise') {
					//this.notificationManager.notify('Warning: You have placed the critique step in a Review Sequence after the revise step. This will break the Review Sequence.', 3);
				//}
				outOfOrder = true;
			}
			
			if(outOfOrder){
				$('.reviewWarning').remove();
				this.notificationManager.notify('Warning: One or more Review Sequences in your project are out of order and will not function correctly. Please fix before running project in a classroom.', 3, 'keepMsg reviewWarning');
			} else {
				$('.reviewWarning').remove();
			}
		}
	}
};

/**
 * Given @param list (a nodeList), removes the nodes from their respective
 * locations in the project puts them in an array and returns the array.
 */
View.prototype.removeFromProject = function(list, removeFromProject){
	if(removeFromProject){
		return this.getProjectNodesFromList(list);
	};
	
	var removed = [];
	
	//remove in reverse to preserve positioning of previous
	for(var e=list.size()-1;e>=0;e--){
		var node = list.get(e);
		
		if($('#' + $.escapeId(node.id)).hasClass('master')){
			//skip remaining, don't want to remove it
			this.notificationManager.notify('The master activity cannot be deleted.', 2);
		} else {
			var pIdLoc = node.id.split('--');
			var projectNode = this.getProject().getNodeById(pIdLoc[1]);
			
			//put node in removed
			removed.push(projectNode);
			
			//if it has a parent, remove from parent
			if(pIdLoc[0]!='null'){
				this.getProject().removeReferenceFromSequence(pIdLoc[0], pIdLoc[2]);
			};
			
			//now remove from appropriate node list
			if(this.getProject().getNodeById(pIdLoc[1]).type=='sequence'){//remove from seqs
				this.getProject().getSequenceNodes().splice(this.getProject().getSequenceNodes().indexOf(projectNode), 1);
			} else {//remove from nodes
				this.getProject().getLeafNodes().splice(this.getProject().getLeafNodes().indexOf(projectNode), 1);
			}
		}
	}
	
	return removed;
};

/**
 * Given a nodeList (@param list), returns an array of associated project nodes.
 */
View.prototype.getProjectNodesFromList = function(list){
	var nodes = [];
	
	for(var e=list.size()-1;e>=0;e--){
		nodes.push(this.getProject().getNodeById(list.get(e).attr('id').split('--')[1]));
	};
	
	return nodes;
};

/**
 * Sets the callback var for selectModes, puts the authoring tool into select mode
 * and displays either the provided message or the default message.
 */
View.prototype.engageSelectMode = function(callback, message, args){
	$('#overlay').show();
	$('#authoringContainer').css({'z-index':'1003','position':'relative','left':'0','top':'0','right':'0'});
	$('#visibiltyNodeTools').css({'z-index':'1003','position':'relative','top':'0'});
	$('#selectModeDiv').css({'z-index':'1003','position':'relative','left':'0','top':'0','right':'0'});
	$('#notificationDiv').hide();
	
	// hide/disable any node button or links
	$('.editNodeInput, .selectNodeInput').attr('disabled','true');
	$('#authoringContainer input, #authoringContainer select, #authoringContainer button').css('cursor','crosshair');
	$('#authoringContainer a').hide();
	this.clearAllSelected();
	this.selectModeEngaged = true;
	this.selectCallback = callback;
	this.selectArgs = args;
	
	//hideElement('authorHeader');
	if(message){
		document.getElementById('selectModeMessage').innerHTML = message;
	} else {
		document.getElementById('selectModeMessage').innerHTML = this.defaultSelectModeMessage;
	};
	showElement('selectModeDiv');
	//document.body.style.cursor = 'crosshair';
};

/**
 * Takes the authoring tool out of select mode and runs any callback with the passed in
 * value (@param val) and any args that may have been set.
 */
View.prototype.disengageSelectMode = function(val){
	this.selectModeEngaged = false;
	// show/enable any node buttons or links
	$('.editNodeInput, .selectNodeInput').removeAttr('disabled');
	$('#authoringContainer input, #authoringContainer select, #authoringContainer button').css('cursor','auto');
	$('#authoringContainer a').show();
	$('#notificationDiv').show();
	$('#overlay').hide();
	$('#authoringContainer, #visibiltyNodeTools, #selectModeDiv').css({'z-index':'','position':'','top':'','left':'','right':''});
	if(this.selectCallback){
		this.selectCallback(val, this.selectArgs);
	};
	
	document.getElementById('selectModeMessage').innerHTML = '';
	hideElement('selectModeDiv');
	//showElement('authorHeader');
	//document.body.style.cursor = 'auto';
	this.generateAuthoring();
	this.populateMaxScores();
	this.setPostLevel();
	$('.reviewAdded').each(function(){
		$(this).removeClass('reviewAdded');
	});
	this.eventManager.fire("unhideNodes");
};

/**
 * Determines what has been clicked and how to proceed based on the current state.
 */
View.prototype.processSelected = function(id){
	var node = $('#' + $.escapeId(id));
	
	/*
	 * get the selected type if it has not been set already. it will
	 * already be set if the author is moving a step but will not
	 * be already set if the author is selecting steps for a review
	 * sequence.
	 */
	if(!this.selectedType) {
		this.selectedType = this.getSelectedType();
	}
	
	//check if the selection was turned on for creating a review sequence 
	if(this.selectArgs[0] == 'createReviewSequence1' ||
			this.selectArgs[0] == 'createReviewSequence2' ||
			this.selectArgs[0] == 'createReviewSequence3') {
		
		//check if the element that was clicked on was a node
		if(node.hasClass('node')) {
			//get the node id
			var nodeId = id.split("--")[1];
			
			//get the node type
			var nodeType = this.getProject().getNodeById(nodeId).type;
			
			//get the node object
			var nodeObject = this.getProject().getNodeById(nodeId);
			
			if(nodeObject.peerReview != null || nodeObject.teacherReview != null) {
				//the node selected is already in a review sequence so we will display an error message
				document.getElementById('selectModeMessage').innerHTML = 'Please select a step that is not already in a Review Sequence';
				return;
			} else if(nodeType == 'OpenResponseNode' || (this.selectArgs[0] == 'createReviewSequence2' && this.selectArgs[1] == 'Peer' && nodeType == 'AssessmentListNode')) {
				/*
				 * the node type was OpenResponseNode or this is the 2nd part of
				 * the peer review sequence and the node type is AssessmentListNode
				 */
				
				//get the node position
				var nodePosition = this.getProject().getPositionById(nodeId);
				
				//check if the review sequence array has been set
				if(this.createReviewSequenceArray != null) {
					//loop through the elements in the array
					for(var x=0; x<this.createReviewSequenceArray.length; x++) {
						//get a node id
						var prevReviewSequenceNodeId = this.createReviewSequenceArray[x];
						
						//get the position for the node
						var prevReviewSequenceNodePosition = this.getProject().getPositionById(prevReviewSequenceNodeId);
						
						/*
						 * check that the current node position that was just clicked comes before
						 * or is equal to the previously clicked nodes
						 */
						if(this.getProject().positionBeforeOrEqual(nodePosition, prevReviewSequenceNodePosition)) {
							/*
							 * the current node comes before or is equal to a previous node which is
							 * not allowed so we will display an error message and prompt for the user
							 * to choose another node
							 */ 
							document.getElementById('selectModeMessage').innerHTML = 'Please select a step that comes after all the steps you have previously chosen.';
							return;
						}
					}
				}
			} else {
				//the user has not clicked on a node that is not supported by review sequences yet
				document.getElementById('selectModeMessage').innerHTML = 'You have selected a ' + nodeType + '. Please select an Open Response step.';
				return;
			}
		} else {
			//the user has not clicked on a step node
			document.getElementById('selectModeMessage').innerHTML = 'You have selected an Activity. Please select a Step in the project.';
			return;
		}
	}
	
	if(node.hasClass('seq')){//disambiguate sequence choice
		if(this.simpleProject){
			if(this.selectedType=='sequence'){
				this.disengageSelectMode({after: true, id: node.attr('id')});
			} else {
				this.disengageSelectMode({after: false, id: node.attr('id')});
			}
		} else {
			/* for advanced projects, the user must disambiguate the choice */
			this.disambiguateMode = true;	
			node.children().css('display', 'none');
			var choice = document.getElementById('choiceDiv_' + id);
			choice.innerHTML = 'Insert the selected item(s) <a onclick="eventManager.fire(\'processChoice\',[\'' + id + '\',\'true\'])">as first step within activity</a> or <a onclick="eventManager.fire(\'processChoice\',[\'' + id + '\',\'false\'])">after this activity</a><i>&nbsp;&nbsp;(select a choice)</i>';
			choice.style.display = 'inline';
		}
	} else if(node.hasClass('node')){//attach after given node
		if(!this.simpleProject || this.selectedType=='node'){
			if(this.selectArgs[0] == 'createReviewSequence1' ||
					this.selectArgs[0] == 'createReviewSequence2') {
				/*
				 * call callback when the user has clicked on the first or second review 
				 * sequence node. when the user needs to click on the third review sequence
				 * node it will run the else case below which calls desengageSelectMode()
				 * which calls the callback.
				 */
				if(this.selectCallback){
					this.selectCallback({after: true, id: node.attr('id')}, this.selectArgs);
				};
			} else {
				this.disengageSelectMode({after: true, id: node.attr('id')});			
			}
		}
	} else if(node.hasClass('master')){
		if(!this.simpleProject || this.selectedType=='sequence'){
			this.disengageSelectMode({after: false, id: node.attr('id')});
		}
	} else {//unattached sequences or nodes
		this.disengageSelectMode(id);
	}
};

/**
 * Determines what has been clicked and how to proceed based on the current state.
 */
View.prototype.processChoice = function(id, opt){
	this.disambiguateMode = false;
	var node = $('#' + $.escapeId(id));
	node.children().css('display', 'block');
	document.getElementById('choiceDiv_' + id).style.display = 'none';
	
	if(opt=='true'){
		this.disengageSelectMode({after: false, id: id});
	} else {
		this.disengageSelectMode({after: true, id: id});
	}
};

/**
 * Sets the element that the mouse is currently over as selected when
 * select mode is engaged.
 */
View.prototype.checkModeAndSelect = function(id){
	if(this.selectModeEngaged){
		if(this.simpleProject){
			var nodeId = id.split('--')[1];
			/* if this is a sequence we are moving, we cannot select nodes, so just return if it is */
			if(nodeId != 'uSeq' && nodeId !='uNode' && this.getProject().getNodeById(nodeId)){
				var sequence = this.getProject().getNodeById(nodeId).type == 'sequence';
				if(this.selectedType=='sequence' && !sequence){
					return;
				}
			}
		}
		if(!$('#' + $.escapeId(id)).hasClass('moving')){
			if(this.selectArgs[0] == 'createReviewSequence1' ||
					this.selectArgs[0] == 'createReviewSequence2' ||
					this.selectArgs[0] == 'createReviewSequence3') {
				$('#' + $.escapeId(id)).addClass('reviewTarget selected');
			} else {
				$('#' + $.escapeId(id)).addClass('target selected');
			}
		}
	} else {
		if(!$('#' + $.escapeId(id)).hasClass('seq') && !$('#' + $.escapeId(id)).hasClass('master') &&
				!$('#' + $.escapeId(id)).hasClass('uSeq') && id != 'uNode'){
			$('#' + $.escapeId(id)).addClass('nodeHover');
		}
	}
};

/**
 * Sets the element that the cursor has just left as not selected when
 * select mode is engaged.
 */
View.prototype.checkModeAndDeselect = function(id){
	if(this.selectModeEngaged){
		$('#' + $.escapeId(id)).removeClass('selected');
		$('#' + $.escapeId(id)).removeClass('target');
		$('#' + $.escapeId(id)).removeClass('reviewTarget');
	} else {
		if(!$('#' + $.escapeId(id)).hasClass('seq') && !$('#' + $.escapeId(id)).hasClass('master') &&
				!$('#' + $.escapeId(id)).hasClass('uSeq') && id != 'uNode'){
			$('#' + $.escapeId(id)).removeClass('nodeHover');
		}
	}
};

/**
 * After new node is created, sets up selection system to place the node
 * in the project.
 */
View.prototype.placeNewNode = function(id){
	this.clearAllSelected();
	$('.projectNode').filter(function(){return $(this).attr('id').split('--')[0]=='null' && $(this).attr('id').split('--')[1]==id;}).addClass('selected');
	
	this.moveSelected();
	this.placeNodeId = undefined;
	this.placeNode = false;
};

/**
 * Start the process for creating a review sequence
 * @param reviewSequenceType the review sequence, either 'Peer' or 'Teacher'
 */
View.prototype.startCreateReviewSequence = function(reviewSequenceType) {
	//check if a project is open
	if(this.getProject()) {
		//prompt the user to click on the first node in the review sequence
		this.engageSelectMode(this.createReviewSequenceCallback, "Choose the 1st step in the " + reviewSequenceType + " Review Sequence. This is where the students will submit their initial work.", ["createReviewSequence1", reviewSequenceType]);		
	} else {
		//a project is not open so we will display an error message
		this.notificationManager.notify('Please open or create a Project.', 3);
	}
};

/**
 * Remove the review sequence from the project. The step nodes are not deleted,
 * only the review sequence attributes within the step nodes are removed.
 * @param reviewGroupNumber the review group number we want to remove
 */
View.prototype.cancelReviewSequence = function(reviewGroupNumber) {
	if (confirm('Are you sure you want to delete this Review Sequence?\n\nWarning: If any runs of this project are currently active, student data for these steps may be lost.')) { 
		/*
		 * tell the project to remove the review group attributes from
		 * the nodes in the specified review group number
		 */
		this.getProject().cancelReviewSequenceGroup(reviewGroupNumber);
		
		//hide the right-click pop up dialog
		//hideElement("contextMenu");
		
		//get the html elements for the nodes that are in the group
		var reviewGroupElements = this.getElementsByClassName(null, "reviewGroup" + reviewGroupNumber, null);
		
		//loop through the elements in the group
		for(var x=0; x<reviewGroupElements.length; x++) {
			//get an element
			var reviewGroupElement = reviewGroupElements[x];
			$(reviewGroupElement).parent().removeClass('reviewNode');
			$(reviewGroupElement).remove();
			//var tabs = "";
			
			//for(var b=0;b<2;b++){
				//tabs += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			//};
			
			//replace the review sequence label (e.g. PR1.1, PR1.2, PR1.3, etc.) with '&nbsp;'s
			//reviewGroupElement.innerHTML = tabs;
		}
	} else {
		return;
	}
};

/**
 * Remembers the nodes that were clicked when creating the review sequence
 * and then when the last node is clicked, will modify the project and nodes
 * to create the review sequence
 * @param id the html id
 * @param args an array whose first element is the phase and the second is the
 * review type 'Peer' or 'Teacher'
 */
View.prototype.createReviewSequenceCallback = function(id, args) {
	//get the review type
	var reviewSequenceType = args[1];
	
	if(this.createReviewSequenceArray == null || args[0] == 'createReviewSequence1') {
		//create the empty array if this is the start of the review sequence creation
		this.createReviewSequenceArray = [];
	}
	
	//the id is -1 something besides a node was clicked on
	if(id == -1) {
		return;
	}
	
	//split the html id
	var pIdLoc = id.id.split('--');
	
	//get the nodeId
	var nodeId = pIdLoc[1];
	
	//put the nodeId onto the array
	this.createReviewSequenceArray.push(nodeId);
	
	var otherUser = '';
	var reviewType = '';
	if(reviewSequenceType == 'Peer') {
		otherUser = 'classmate';
		reviewType = 'P';
	} else if(reviewSequenceType == 'Teacher') {
		otherUser = 'teacher';
		reviewType = 'T';
	}
	
	var $node = $('#' + $.escapeId(id.id));
	$node.addClass('reviewAdded'); // add reviewAdded class to selected node
	
	//get the next available review group number
	var reviewGroup = this.getProject().getNextReviewGroupNumber();
	
	if(this.createReviewSequenceArray.length == 1) {
		//create a p element that will display the review label (e.g. PR1.1, PR1.2, PR1.3)
		var reviewHtml = "<p class='reviewLabel' style='display:inline'>" + reviewType + "R" + reviewGroup + ".1</p>";
		$node.append(reviewHtml);
		/*
		 * the user has selected the first node, now we will ask them to
		 * select the second node
		 */
		this.engageSelectMode(this.createReviewSequenceCallback, "Choose the 2nd step in the " + reviewSequenceType + " Review Sequence. This is where the student will receive " + otherUser + " work and critique it.", ["createReviewSequence2", reviewSequenceType]);
	} else if(this.createReviewSequenceArray.length == 2) {
		//create a p element that will display the review label (e.g. PR1.1, PR1.2, PR1.3)
		var reviewHtml = "<p class='reviewLabel' style='display:inline'>" + reviewType + "R" + reviewGroup + ".2</p>";
		$node.append(reviewHtml);
		/*
		 * the user has selected the second node, now we will ask them to
		 * select the third node
		 */
		this.engageSelectMode(this.createReviewSequenceCallback, "Choose the 3rd step in the " + reviewSequenceType + " Review Sequence. This is where the student will read the critique their " + otherUser + " wrote and revise their work.", ["createReviewSequence3", reviewSequenceType]);
	} else if(this.createReviewSequenceArray.length == 3) {
		//create a p element that will display the review label (e.g. PR1.1, PR1.2, PR1.3)
		var reviewHtml = "<p class='reviewLabel' style='display:inline'>" + reviewType + "R" + reviewGroup + ".3</p>";
		$node.append(reviewHtml);
		//the user is done selecting the third node
		
		//get the next available review group number
		//var reviewGroup = this.project.getNextReviewGroupNumber();
		
		//get the first node
		var node1 = this.getProject().getNodeById(this.createReviewSequenceArray[0]);
		
		//set the peerReview or teacherReview attribute to 'start'
		if(reviewSequenceType == 'Peer') {
			node1.peerReview = "start";	
		} else if(reviewSequenceType == 'Teacher') {
			node1.teacherReview = "start";
		}
		
		//set the review group number
		node1.reviewGroup = reviewGroup;
		
		//set the active and preserved objects for when saveStep() is called
		this.activeNode = node1;
		this.activeContent = createContent(node1.content.getContentUrl());
		this.preservedContentString = this.activeContent.getContentString();
		
		var node1ContentJSON = this.activeContent.getContentJSON();
		
		//disable the rich text editor
		node1ContentJSON.isRichTextEditorAllowed = false;
		
		//set the content into the activeContent
		this.activeContent.setContent($.stringify(node1ContentJSON));
		
		//save the node1 content
		this.saveStep(false, true);
		
		//get the second node
		var node2 = this.getProject().getNodeById(this.createReviewSequenceArray[1]);
		
		//set the peerReview or teacherReview attribute to 'annotate'
		if(reviewSequenceType == 'Peer') {
			node2.peerReview = "annotate";	
		} else if(reviewSequenceType == 'Teacher') {
			node2.teacherReview = "annotate";
		}
		
		//set the attributes
		node2.associatedStartNode = node1.id;
		node2.reviewGroup = reviewGroup;
		
		//set the active and preserved objects for when saveStep() is called
		this.activeNode = node2;
		this.activeContent = createContent(node2.content.getContentUrl());
		this.preservedContentString = this.activeContent.getContentString();
		
		//set the 'authoredWork' attribute
		var node2ContentJSON = this.activeContent.getContentJSON();
		node2ContentJSON.authoredWork = "Enter canned work here";
		node2ContentJSON.stepNotOpenCustomMessage = '<p>This step is not available yet.</p></p><p>More of your peers need to submit a response for step <b>"associatedStartNode.title"</b>.<br/>You will then be assigned a response to review.</p><p>Please return to this step again in a few minutes.</p>';
		
		//disable the rich text editor
		node2ContentJSON.isRichTextEditorAllowed = false;
		
		if(reviewSequenceType == 'Peer') {
			node2ContentJSON.openPercentageTrigger = 0;
			node2ContentJSON.openNumberTrigger = 0;
		}
		
		//check if the second node in the sequence is an AssessmentListNode
		if(node2.type == 'AssessmentListNode') {
			/*
			 * set these specific assessment list options which are required if the
			 * step is going to be part of the review sequence
			 */
			node2ContentJSON.displayAnswerAfterSubmit = false;
			node2ContentJSON.isLockAfterSubmit = true;
			node2ContentJSON.isMustCompleteAllPartsBeforeExit = false;
			
			//set all the assessment parts to important
			for(var x=0; x<node2ContentJSON.assessments.length; x++) {
				var assessment = node2ContentJSON.assessments[x];
				
				//set the assessment part to important
				assessment.isImportantReviewSequencePart = true;
			}
		}
		
		//set the content into the activeContent
		this.activeContent.setContent($.stringify(node2ContentJSON));
		
		//save the node2 content
		this.saveStep(false, true);
		
		//get the third node
		var node3 = this.getProject().getNodeById(this.createReviewSequenceArray[2]);
		
		//set the peerReview or teacherReview attribute to 'revise'
		if(reviewSequenceType == 'Peer') {
			node3.peerReview = "revise";	
		} else if(reviewSequenceType == 'Teacher') {
			node3.teacherReview = "revise";
		}
		
		//set the attributes
		node3.associatedStartNode = node1.id;
		node3.associatedAnnotateNode = node2.id;
		node3.reviewGroup = reviewGroup;

		//set the active and preserved objects for when saveStep() is called
		this.activeNode = node3;
		this.activeContent = createContent(node3.content.getContentUrl());
		this.preservedContentString = this.activeContent.getContentString();
		
		//set the 'authoredReview' attribute
		var node3ContentJSON = this.activeContent.getContentJSON();
		node3ContentJSON.authoredReview = "Enter canned review here";
		node3ContentJSON.stepNotOpenCustomMessage = '<p>This step is not available yet.</p><p>Your response in step <b>"associatedStartNode.title"</b> has not been reviewed by a peer yet.</p><p>More of your peers need to submit a response for step <b>"associatedAnnotateNode.title"</b>.</p><p>Please return to this step in a few minutes.</p>';
		
		//disable the rich text editor
		node3ContentJSON.isRichTextEditorAllowed = false;
		
		//set the content to the activeContent
		this.activeContent.setContent($.stringify(node3ContentJSON));
		
		//save the node3 content
		this.saveStep(false, true);
		
		$('.reviewAdded').each(function(){
			$(this).removeClass('reviewAdded');
		});
		
		//save the project
		this.saveProject();
		
		/*
		 * display a message to the user that the review sequence has been created
		 * and display the titles of the 3 nodes they selected.
		 */
		this.notificationManager.notify(reviewSequenceType + ' Review Sequence successfully created.', 3);
		
		//clear the array
		this.createReviewSequenceArray = [];
	}
};

/**
 * Get a string the displays all the nodes in the review sequence the user
 * is in the process of creating
 * @return a string containing the node titles of the nodes chosen for the
 * review sequence
 */
View.prototype.getReviewSequenceNodeTitles = function() {
	var output = "";
	
	if(this.createReviewSequenceArray != null) {
		//loop through all the elements in the array
		for(var x=0; x<this.createReviewSequenceArray.length; x++) {
			//get the node id
			var nodeId = this.createReviewSequenceArray[x];
			
			//get the node object
			var node = this.getProject().getNodeById(nodeId);
			
			if(x == 0) {
				//display the first node
				output += "First step: " + node.title + "<br>";
			} else if(x == 1) {
				//display the second node
				output += "Second step: " + node.title + "<br>";
			} else if(x == 2) {
				//display the third node
				output += "Third step: " + node.title + "<br>";
			}
		}
	}
	
	return output;
};

View.prototype.getSelectedType = function() {
	var selected = this.getSelected();
	var selectedType = "";
	
	if(this.simpleProject){
		if(selected.seqs.size()>0){
			selectedType = 'sequence';
		} else {
			selectedType = 'node';
		}
	}
	
	return selectedType;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_selection.js');
};