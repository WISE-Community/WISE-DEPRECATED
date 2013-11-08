
/**
 * The datagraphDispatcher catches events specific to authoring individual
 * datagraph steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.datagraphDispatcher = function(type,args,obj){
	if(type=='datagraphDisplayOptionChanged'){
		obj.DataGraphNode.displayOptionChanged();
	} else if(type=='datagraphStartModeChanged'){
		obj.DataGraphNode.startModeChanged();
	} else if(type=='datagraphGraphOptionChanged'){
		obj.DataGraphNode.graphOptionChanged(args[0]);
	} else if(type=='datagraphPromptChanged'){
		obj.DataGraphNode.updatePrompt();
	} else if(type=='datagraphTableMetadataChanged'){
		obj.DataGraphNode.tableMetadataChanged();
	} else if(type=='datagraphEditableChanged'){
		obj.DataGraphNode.editableChanged(args[0]);
	} else if(type=='datagraphAddRow'){
		obj.DataGraphNode.addRow();
	} else if(type=='datagraphAddCol'){
		obj.DataGraphNode.addCol();
	} else if(type=='datagraphRemoveRow'){
		obj.DataGraphNode.removeRow();
	} else if(type=='datagraphRemoveCol'){
		obj.DataGraphNode.removeCol();
	} else if(type=='datagraphToggleSelected'){
		obj.DataGraphNode.toggleSelected(args[0], args[1]);
	} else if(type=='datagraphCellChanged'){
		obj.DataGraphNode.cellChanged(args[0], args[1]);
	} else if(type=='datagraphToggleEditable'){
		obj.DataGraphNode.toggleEditable();
	} else if(type=='datagraphInsertRowBefore'){
		obj.DataGraphNode.insert(1,0);
	} else if(type=='datagraphInsertRowAfter'){
		obj.DataGraphNode.insert(1,1);
	} else if(type=='datagraphInsertColBefore'){
		obj.DataGraphNode.insert(2,0);
	} else if(type=='datagraphInsertColAfter'){
		obj.DataGraphNode.insert(2,1);
	} else if(type=='datagraphStartOver'){
		obj.DataGraphNode.startOver();
	} else if(type=='datagraphSetQuantitative'){
		obj.DataGraphNode.setQuantitative();
	} else if(type=='datagraphSetQualitative'){
		obj.DataGraphNode.setQualitative();
	} else if(type=='datagraphAddIndependent'){
		obj.DataGraphNode.addIndependent();
	} else if(type=='datagraphRemoveIndependent'){
		obj.DataGraphNode.removeIndependent();
	} else if(type=='datagraphSetIndependent'){
		obj.DataGraphNode.setIndependent();
	} else if(type=='datagraphUnsetIndependent'){
		obj.DataGraphNode.unsetIndependent();
	} else if(type=='datagraphAddLabel'){
		obj.DataGraphNode.addLabel();
	} else if(type=='datagraphRemoveLabel'){
		obj.DataGraphNode.removeLabel();
	} else if(type=='datagraphSetLabel'){
		obj.DataGraphNode.setLabel();
	} else if(type=='datagraphUnsetLabel'){
		obj.DataGraphNode.unsetLabel();
	} else if(type=='datagraphBuildTable'){
		obj.DataGraphNode.buildTable();
	} else if(type=='datagraphCancelBuildTable'){
		obj.DataGraphNode.cancelBuildTable();
	} else if(type=='datagraphSubmitBuildTable'){
		obj.DataGraphNode.submitBuildTable();
	} else if(type=='datagraphGraphWidthChanged'){
		obj.DataGraphNode.graphSizeChanged('Width');
	} else if(type=='datagraphGraphHeightChanged'){
		obj.DataGraphNode.graphSizeChanged('Height');
	}
};

//this list of events
var events = [
	'datagraphDisplayOptionChanged', 
	'datagraphStartModeChanged',
	'datagraphGraphOptionChanged', 
	'datagraphPromptChanged', 
	'datagraphTableMetadataChanged',
	'datagraphEditableChanged', 
	'datagraphAddRow', 
	'datagraphAddCol', 
	'datagraphRemoveRow',
	'datagraphRemoveCol', 
	'datagraphToggleSelected', 
	'datagraphCellChanged',
	'datagraphToggleEditable',
	'datagraphInsertRowBefore',
	'datagraphInsertRowAfter',
	'datagraphInsertColBefore',
	'datagraphInsertColAfter',
	'datagraphStartOver',
	'datagraphSetQuantitative',
	'datagraphSetQualitative',
	'datagraphAddIndependent',
	'datagraphRemoveIndependent',
	'datagraphSetIndependent',
	'datagraphUnsetIndependent',
	'datagraphAddLabel',
	'datagraphRemoveLabel',
	'datagraphSetLabel',
	'datagraphUnsetLabel',
	'datagraphBuildTable',
	'datagraphCancelBuildTable',
	'datagraphSubmitBuildTable',
	'datagraphGraphWidthChanged',
	'datagraphGraphHeightChanged'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'datagraphDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/datagraph/dataGraphEvents.js');
};