/**
 * Functions specific to the creation and initialization of dialogs
 * 
 * @author patrick lawler
 */

/**
 * Creates and renders the dialog to create and load a new 
 * project in the authoring tool and portal.
 */
View.prototype.initializeCreateProjectDialog = function(){
	var view = this;
	
	var submit = function(){
		// disable further clicking of the submit button
		$("#createProjectDialogSubmitButton").attr("disabled","disabled"); 
		
		var name = $('#projectInput').val();
		
		/* failure callback function for creating a new project */
		var failure = function(t,o){
			o.notificationManager.notify('unable to create new project on server', 3);
		};
		
		/* success callback function for creating a new project */
		var success = function(t,x,o){
			/* notify to close any opened projects in the AT */
			o.notifyPortalCloseProject();

			var path = t;
			
			/*
			 * get the project file name
			 * e.g.
			 * /wise4.project.json
			 */
			var projectFileName = path.substring(path.lastIndexOf("/"));
			
			/* publish the project to the portal if we are in portal mode */
			if(o.portalUrl){
				o.createPortalProject(path, $('#projectInput').val());
			} else {				
				/* just load the newly created project */
				o.loadProject(o.authoringBaseUrl + projectFileName, o.utils.getContentBaseFromFullUrl(o.authoringBaseUrl + path), false);
			}
			
			/*
			 * clear out the project title input so that the next time it will not
			 * display what we just typed
			 */
			document.getElementById('projectInput').value = "";
		
			// re-enable the submit button
			$("#createProjectDialogSubmitButton").attr("disabled", null); 
			
			/* close the dialog when done */			
			$('#createProjectDialog').dialog('close');			
		};
		
		/* make request if name input field is not empty */
		if(name != null && name != ""){
			//create the folder and files for the project on the server
			view.connectionManager.request('POST',1, view.requestUrl, {forward:'filemanager', projectId:'none', command:'createProject', projectName:name}, success, view, failure);
		} else {
			view.notificationManager.notify('A project name must be supplied before you can create a project.',3);
		}
	};
	
	var cancel = function(){
		$('#projectInput').val('');
	};
	
	$('#createProjectDialog').dialog({autoOpen:false, modal:true, draggable:false, title:'Create a New Project', width:650, buttons: {'Submit':{id:'createProjectDialogSubmitButton', text:'Submit', click:submit}, 'Cancel': function(){$(this).dialog("close");}}});
};

/**
 * Creates and renders the dialog to create a new sequence.
 */
View.prototype.initializeCreateSequenceDialog = function(){
	var view = this;
	
	var submit = function(){
		var name = $('#createSequenceInput').val();
		var nodes = view.getProject().getSequenceNodes();
		
		/* validate user name input */
		if(name==null || name==""){
			view.notificationManager.notify('Please create a title for your new Activity', 3);
			return;
		}

		/* validate no duplicate titles */
		for(var s=0;s<nodes.length;s++){
			if(view.getProject().getNodeByTitle(name)){
				view.notificationManager.notify('An Activity with that title already exists. Try another title.', 3);
				return;
			}
		}

		/* processes the results from the request to create a new sequence and cleans up the dialog upon completion */
		var success = function(t,x,o){
			if(t){
				o.placeNode = true;
				o.placeNodeId = t;
				o.loadProject(o.getProject().getContentBase() + o.utils.getSeparator(o.getProject().getContentBase()) + o.getProject().getProjectFilename(), o.getProject().getContentBase(), true);
				$('#createSequenceDialog').dialog('close');
			} else {
				o.notificationManager.notify('Unable to create new Activity on the WISE server.', 3);
			}
		};
		
		/* handles the failure for the request to create new sequence */
		var failure = function(t,o){
			o.notificationManager.notify('unable to create new Activity on the WISE server', 3);
		};
		
		/*
		 * get the project file name
		 * e.g.
		 * /wise4.project.json
		 */
		var projectFileName = view.utils.getContentPath(view.authoringBaseUrl, view.getProject().getUrl());
		var id = view.getProject().generateUniqueId('seq');
		view.connectionManager.request('POST',1,view.requestUrl,{forward:'filemanager',projectId:view.portalProjectId,command:'createSequence',projectFileName:projectFileName,name:name,id:id},success,view,failure);

	};
	
	var cancel = function(){
		$('#createSequenceInput').val('');
	};
	
	$('#createSequenceDialog').dialog({autoOpen:false, draggable:true, resizable:false, title:'Add a New Activity', width:650, buttons: {'Submit':{id:'createActivityDialogSubmitButton', text:'Submit', click:submit}, close: cancel}});
};

/**
 * Creates and renders the dialog to create a new node
 */
View.prototype.initializeCreateNodeDialog = function (){
	var view = this;
	
	var submit = function(){
		/* validates that a node title was entered */
		var title = $('#createNodeTitle').val();
		if(title==null || title==""){
			view.notificationManager.notify('Please enter a title for the Step.', 3);
			return;
		}

		/* validates that a node type was selected */
		var type = $('#createNodeType').val();
		if(type==null || type==""){
			view.notificationManager.notify('Please select a Step type.', 3);
			return;
		}
		
		/* validates the node class */
		var nodeclass = $('#selectNodeIcon').val();
		if(nodeclass==null || nodeclass==''){
			view.notificationManager.notify('Node icon not selected.', 3);
			return;
		}
		
		/* handles the success for the request to create a new node */
		var success = function(text,x,obj){
			var thisView = obj.thisView;
			var nodeType = obj.nodeType;
			
			if(text == 'nodeNotProject'){
				thisView.notificationManager.notify('Unable to attach Step to project, please contact administrator.', 3);
			} else {
				thisView.placeNode = true;
				thisView.placeNodeId = text;
				thisView.loadProject(thisView.getProject().getContentBase() + thisView.utils.getSeparator(thisView.getProject().getContentBase()) + thisView.getProject().getProjectFilename(), thisView.getProject().getContentBase(), true);
				
				$('#createNodeDialog').dialog('close');				

				/*
				 * if the author is creating an HtmlNode we must set the .html
				 * file name into the .ht file
				 */
				if(nodeType == 'HtmlNode') {
					thisView.setHtmlSrc(text);					
				}
			}
		};
		
		/* handles the failure for a request to create a new node */
		var failure = function(text,obj){
			var thisView = obj.thisView;
			thisView.notificationManager.notify('unable to create Step on the WISE server', 3);
		};

		var path = view.utils.getContentPath(view.authoringBaseUrl,view.getProject().getUrl());
		
		//get the node template params
		var nodeTemplateParams = view.nodeTemplateParams[type];
		
		var createNodeParams = {
				forward:'filemanager',
				projectId:view.portalProjectId,
				command:'createNode',
				nodeClass:nodeclass,
				title:title,
				type:type,
				nodeTemplateParams:$.stringify(nodeTemplateParams)
		};
		
		view.connectionManager.request('POST',1,view.requestUrl,createNodeParams,success,{thisView:view,nodeType:type},failure);
	};

	var cancel = function(){
		$('#createNodeType').val('');
		$('#createNodeTitle').val('');
		
		if($('#selectNodeIconDiv')){
			$('#selectNodeIconDiv').remove();
		}
	};
	
	//populate the drop down box with the step types
	this.populateCreateNodeChoices();
	
	//this should have height set to auto resize but it doesn't work so I just set it to 260
	$('#createNodeDialog').dialog({autoOpen:false, draggable:false, resizable:false, width:650, height:260, title:'Add a New Step', buttons: {'Submit':{id:'createStepDialogSubmitButton', text:'Submit', click:submit}}, close: cancel});
};

/**
 * Obtain the .ht file and set the src field
 * @param nodeId the id of the node
 */
View.prototype.setHtmlSrc = function(nodeId) {
	
	var retrieveFileParams = {
		command:'retrieveFile',
		forward:'filemanager',
		fileName:this.utils.getSeparator(this.getProject().getContentBase()) + nodeId,
		projectId:this.portalProjectId
	};

	//obtain the content of the .ht file
	this.connectionManager.request('GET', 3, this.getProject().getContentBase() + this.utils.getSeparator(this.getProject().getContentBase()) + nodeId, null,this.getHtmlSrcSuccess,{nodeId:nodeId,thisView:this},null);
};

/**
 * Receive the content of the .ht file and modify it and save it
 * back to the server
 * @param text the content of the .ht file
 * @param x
 * @param obj
 * @return
 */
View.prototype.getHtmlSrcSuccess = function(text,x,obj) {
	var nodeId = obj.nodeId;
	var thisView = obj.thisView;
	
	//make the html file name
	var htmlFileName = nodeId.replace(".ht", ".html");

	//retrieve the content for the .ht file
	var htNodeContent = $.parseJSON(text);
	
	//set the src field to the html file name
	htNodeContent.src = htmlFileName;

	var updateFileParams = {
		forward:'filemanager', 
		projectId:thisView.portalProjectId,
		command:'updateFile',
		fileName:nodeId,
		data:$.stringify(htNodeContent, null, 3)
	};

	//save the .ht file back to the server
	thisView.connectionManager.request('POST', 3, thisView.requestUrl, updateFileParams,null,thisView,null);
};

/**
 * Populate the choices for the add a new step dialog box
 */
View.prototype.populateCreateNodeChoices = function() {
	//get all the node names
	var acceptedTagNames = NodeFactory.acceptedTagNames;
	
	//get all the node constructors
	var nodeConstructors = NodeFactory.nodeConstructors;
	
	var authoringToolNames = [];
	var authoringToolNamesToNodeNames = {};
	
	//loop through all the node names
	for(var x=0; x<acceptedTagNames.length; x++) {
		//get a node name
		var nodeName = acceptedTagNames[x];
		
		//get a constructor
		var constructor = nodeConstructors[nodeName];
		
		/*
		 * check if there is a constructor, some node names do not have constructors
		 * such as 'sequence'. if the node name does not have a constructor it
		 * means it is not a node that can be created.
		 */
		if(constructor != null) {
			//get the name of the node that will be seen in the "select step type:" options
			var authoringToolName = constructor.authoringToolName;
			
			//check if their is a step that already uses this name
			if(authoringToolNames.contains(authoringToolName)) {
				//there is a step that already uses this name so we will append the nodeType in parentheses to make it unique
				authoringToolName += " (" + nodeName + ")";
			}
			
			if(authoringToolName != null) {
				authoringToolNames.push(authoringToolName);
				authoringToolNamesToNodeNames[authoringToolName] = nodeName;				
			}
		}
	}
	
	//sort the authoring tool names alphabetically
	authoringToolNames.sort();
	
	//loop through all the authoring tool names
	for(var x=0; x<authoringToolNames.length; x++) {
		var authoringToolName = authoringToolNames[x];
		
		//get the node name associated with the authoring tool name
		var nodeName = authoringToolNamesToNodeNames[authoringToolName];
		
		//create the option html
		var optionHtml = "<option value='" + nodeName + "' name='selectStepTypeOption'>" + authoringToolName + "</option>";
		
		//add the option to the select drop down box
		$('#createNodeType').append(optionHtml);
	}
};

/**
 * Creates and renders the dialog to edit the project file
 */
View.prototype.initializeEditProjectFileDialog = function(){
	var view = this;
	
	var submit = function(){
		var text = $('#projectText').val();
		if(text && text != ''){
			/* processes the response to the request to update project file after editing */
			var success = function(t,x,o){
				if(t!='success'){
					o.notificationManager.notify('Unable to save project to WISE server', 3);
				} else {
					o.loadProject(o.getProject().getUrl(), o.getProject().getContentBase(), true);
					$('#editProjectFileDialog').dialog('close');
				}
			};
			
			/* handles the failure case when the request to update the edited project file fails */
			var failure = function(t,o){
				o.notificationManager.notify('Unable to save project to the WISE server', 3);
			};
		} else {
			view.notificationManager.notify('No project text found to save, aborting...', 3);
		}
		
		var filename = view.getProject().getProjectFilename();
		
		text = encodeURIComponent(text);
		
		view.connectionManager.request('POST',1,view.requestUrl,{forward:'filemanager',projectId:view.portalProjectId,command:'updateFile',fileName:filename,data:text},success,view,failure);
	};

	var cancel = function(){
		$('projectText').val('');
	};
	
	$('#editProjectFileDialog').dialog({autoOpen:false, draggable:false, width:900, buttons: {'Submit':submit}, close: cancel});
};

/**
 * Initializes and renders the asset uploader dialog.
 */
View.prototype.initializeAssetUploaderDialog = function(){
	var view = this;
	
	var submit = function(){
		var filename = $('#uploadAssetFile').val();
		
		if(filename && filename != ''){
			filename = filename.replace("C:\\fakepath\\", "");  // chrome/IE8 fakepath issue: http://acidmartin.wordpress.com/2009/06/09/the-mystery-of-cfakepath-unveiled/
			if(!view.utils.fileFilter(view.allowedAssetExtensions,filename)){
				view.notificationManager.notify('Sorry, the specified file type is not allowed.', 3);
				return;
			} else {
				var frameId = 'assetUploadTarget_' + Math.floor(Math.random() * 1000001);
				var frame = createElement(document, 'iframe', {id:frameId, name:frameId, src:'about:blank', style:'display:none;'});
				var form = createElement(document, 'form', {id:'assetUploaderFrm', method:'POST', enctype:'multipart/form-data', action:view.assetRequestUrl, target:frameId, style:'display:none;'});
				var assetPath = view.utils.getContentPath(view.authoringBaseUrl,view.getProject().getContentBase());
				
				/* create and append elements */
				document.body.appendChild(frame);
				document.body.appendChild(form);
				form.appendChild(createElement(document,'input',{type:'hidden', name:'path', value:assetPath}));
				form.appendChild(createElement(document,'input',{type:'hidden', name:'forward', value:'assetmanager'}));
				form.appendChild(createElement(document,'input',{type:'hidden', name:'projectId', value:view.portalProjectId}));

				/* set up the event and callback when the response comes back to the frame */
				frame.addEventListener('load',view.assetUploaded,false);
				
				/* change the name attribute to reflect that of the file selected by user */
				document.getElementById('uploadAssetFile').setAttribute("name", filename).setAttribute("size","40");
				
				/* remove file input from the dialog and append it to the frame before submitting, we'll put it back later */
				var fileInput = document.getElementById('uploadAssetFile');
				form.appendChild(fileInput);
				
				/* submit hidden form */
				form.submit();
				
				/* put the file input back and remove form now that the form has been submitted */
				document.getElementById('assetUploaderBodyDiv').insertBefore(fileInput, document.getElementById('assetUploaderBodyDiv').firstChild);
				document.body.removeChild(form);
				
				/* close the dialog */
				$('#assetUploaderDialog').dialog('close');
			}
		} else {
			view.notificationManager.notify('Please specify a file to upload.',3);
		}
	};

	var cancel = function(){
		$('#uploadAssetFile').val('');
	};
	
	$('#assetUploaderDialog').dialog({autoOpen:false, draggable:false, modal:true, width:600, buttons: {'Submit':submit}, close: cancel});
};

/**
 * Initializes and renders copy project dialog
 */
View.prototype.initializeCopyProjectDialog = function (){
	var view = this;
	
	var submit = function(){
		var select = document.getElementById('copyProjectSelect');
		var option = select.options[select.selectedIndex];
		var portalProjectId = option.value;
		var title = option.title;
		var fileName = option.fileName;
		
		/*
		 * processes the response to the request to copy a project
		 * @param t the new folder name
		 * e.g.
		 * 513
		 */
		var success = function(t,x,o){
			// close any project that has been opened, if any.
			o.notifyPortalCloseProject();

			o.notificationManager.notify('Project Copied', 3);
			/* create new project in the portal if in portal mode */
			if(o.portalUrl){
				/*
				 * the url (first argument) is the relative project folder path
				 * e.g.
				 * /513/wise4.project.json
				 * the project file name is the same as the project file name
				 * from the project that was copied
				 */
				o.createPortalProject('/' + t + fileName, option.title, portalProjectId);
			}
			
			$('#copyProjectDialog').dialog('close');
		};
		
		/* handles a failure response to the request to copy a project */
		var failure = function(t,o){
			o.notificationManager.notify('Failed copying project on server.', 3);
		};
		
		view.connectionManager.request('POST',1,view.requestUrl,{forward:'filemanager',projectId:portalProjectId,command:'copyProject', fileName:fileName},success,view,failure);
	};
	
	var cancel = function(){
		$('#copyProjectDialog').dialog('close');
	};
	
	$('#copyProjectDialog').dialog({autoOpen:false, modal: true, draggable:false, title:'Copy a Project', width:650, buttons: {'Cancel': cancel, 'Copy':{id:'copyProjectDialogSubmitButton', text:'Copy', click:submit}}});
};

/**
 * Initialize and renders the edit project metadata dialog
 */
View.prototype.initializeEditProjectMetadataDialog = function(){
	var view = this;
	
	// setup idea manager toggle change action
	$('#enableIdeaManager').click(function() {
		if(this.checked){
			$("#ideaManagerSettings").slideDown();
		} else {
			$("#ideaManagerSettings").slideUp();
		}
	});
	
	// setup public idea manager toggle change action
	$('#enablePublicIdeaManager').click(function() {
		if(this.checked){
			view.enablePublicIdeaManager(true);
		} else {
			view.enablePublicIdeaManager(false);
		}
	});
	
	var updateProjectMetadata = function(){
		var imVersion = $('#enableIdeaManager').attr('data-version');
		
		view.projectMeta.title = $('#projectMetadataTitle').val();
		view.projectMeta.author = $('#projectMetadataAuthor').val();
		view.projectMeta.theme = $('#projectMetadataTheme').val();
		view.projectMeta.navMode = $('#projectMetadataNavigation').val();
		view.projectMeta.subject = $('#projectMetadataSubject').val();
		view.projectMeta.summary = $('#projectMetadataSummary').val();
		view.projectMeta.gradeRange = $('#projectMetadataGradeRange').val();
		view.projectMeta.totalTime = $('#projectMetadataTotalTime').val();
		view.projectMeta.compTime = $('#projectMetadataCompTime').val();
		view.projectMeta.contact = $('#projectMetadataContact').val();
		view.projectMeta.techReqs = {};
		view.projectMeta.techReqs.java = $("#java").is(':checked');
		view.projectMeta.techReqs.flash = $("#flash").is(':checked');
		view.projectMeta.techReqs.quickTime = $("#quickTime").is(':checked');
		view.projectMeta.techReqs.techDetails = $('#projectMetadataTechDetails').val();
		view.projectMeta.tools = {};
		view.projectMeta.tools.isIdeaManagerEnabled = $("#enableIdeaManager").is(':checked');
		view.projectMeta.tools.isPublicIdeaManagerEnabled = $("#enablePublicIdeaManager").is(':checked');
		view.projectMeta.tools.isStudentAssetUploaderEnabled = $("#enableStudentAssetUploader").is(':checked');
		view.projectMeta.lessonPlan = $('#projectMetadataLessonPlan').val();
		view.projectMeta.standards = $('#projectMetadataStandards').val();
		view.projectMeta.keywords = $('#projectMetadataKeywords').val();
		view.projectMeta.language = $('#projectMetadataLanguage').val();
		
		if(parseInt(imVersion, 10) > 1){
			if(typeof $('#enableIdeaManager').attr('data-version') === 'string' ){
				$.extend(jQuery.validator.messages, {
				  required: ' *This item is required.'
				});
				if($('#imSettings').validate().form()){
					view.projectMeta.tools.ideaManagerSettings = {};
					view.projectMeta.tools.ideaManagerSettings.version = imVersion;
					view.projectMeta.tools.ideaManagerSettings.ideaTerm = $('#imIdeaTerm').val();
					view.projectMeta.tools.ideaManagerSettings.ideaTermPlural = $('#imIdeaTermPlural').val();
					view.projectMeta.tools.ideaManagerSettings.basketTerm = $('#imBasketTerm').val();
					view.projectMeta.tools.ideaManagerSettings.privateBasketTerm = $('#imPrivateBasketTerm').val();
					view.projectMeta.tools.ideaManagerSettings.publicBasketTerm = $('#imPublicBasketTerm').val();
					view.projectMeta.tools.ideaManagerSettings.ebTerm = $('#imEBTerm').val();
					view.projectMeta.tools.ideaManagerSettings.addIdeaTerm = $('#imAddIdeaTerm').val();
					view.projectMeta.tools.ideaManagerSettings.ideaAttributes = [];
					// loop through each of the active attributes and add to metadata
					$('#ideaManagerSettings .attribute.active').each(function(){
						var attribute = {};
						var id = $(this).attr('id').replace('attribute_','');
						var type = $(this).attr('type');
						attribute.type = type;
						attribute.id = id;
						attribute.name = $('#fieldName_' + id).val();
						attribute.isRequired = $('#required_' + id).is(':checked');
						if($('#custom_' + id).length > 0){
							attribute.allowCustom = $('#custom_' + id).is(':checked');
						}
						var options = [];
						if(type=='icon'){
							$('input.option',$('#options_' + id)).each(function(){
								if($(this).is(':checked')){
									options.push($(this).val());
								}
							});
						} else {
							$('input.option',$('#options_' + id)).each(function(){
								var val = $(this).val();
								if(view.utils.isNonWSString(val)){
									options.push(val);
								}
							});
						}
						attribute.options = options;
						view.projectMeta.tools.ideaManagerSettings.ideaAttributes.push(attribute);
					});
					view.updateProjectMetaOnServer(true);
					$('#editProjectMetadataDialog').dialog('close');
				}
			}
		} else {
			view.updateProjectMetaOnServer(true);
			$('#editProjectMetadataDialog').dialog('close');
		}
	};

	var undoProjectMetadata = function(){
		view.editProjectMetadata();
	};
	
	var cancel = function(){
		$('#editProjectMetadataDialog').dialog('close');
	};
	
	$('#editProjectMetadataDialog').dialog({autoOpen:false, draggable:false, modal:true, title:'Edit Project Information', width:850, buttons: {'Close': cancel, 'Revert To Last Save': undoProjectMetadata, 'Save Changes': updateProjectMetadata}});
};

/**
 * Initializes and renders the previous work dialog.
 */
View.prototype.initializePreviousWorkDialog = function(){
	var view = this;
	
	var savePreviousWork = function(){
		//clear activeNode's current prevWorkNodeIds list
		view.activeNode.prevWorkNodeIds = [];
		
		//add all node id's that are in the TO list
		var opts = document.getElementById('selectTo').options;
		for(var i=0;i<opts.length;i++){
			view.activeNode.prevWorkNodeIds.push(opts[i].value);
		};
		
		//save project
		view.saveProject();
		
		$('#previousWorkDialog').dialog('close');
	};

	var cancelChanges = function(){
		$('#previousWorkDialog').dialog('close');
	};
	
	var onClose = function(){
		view.clearCols();
	};
	
	$('#previousWorkDialog').dialog({autoOpen:false, draggable:false, width:800, height:500, buttons: {'Cancel Changes': cancelChanges, 'Save Changes': savePreviousWork}, close: onClose});
};

/**
 * Initializes and renders the node selector dialog
 */
View.prototype.initializeNodeSelectorDialog = function(){
	$('#nodeSelectorDialog').dialog({autoOpen:false, draggable:false, width:600, height:'auto'});
};

/**
 * Initializes and renders the clean project dialog
 */
View.prototype.initializeCleanProjectDialog = function(){
	$('#cleanProjectDialog').dialog({autoOpen:false, draggable:false, resizable:false, width:1000, height:300, dialogClass:'no-title', modal:true});
};

/**
 * Initializes and renders the version project dialog
 */
View.prototype.initializeVersionProjectDialog = function(){
	$('#versionProjectDialog').dialog({autoOpen:false,width:650,dialogClass:'no-title'});
};

/**
 * Initializes and render the set active version dialog for the project.
 */
View.prototype.initializeSetActiveVersionDialog = function(){
	$('#setActiveVersionDialog').dialog({autoOpen:false,width:650,dialogClass:'no-title'});
};

/**
 * Initializes and renders the open version dialog for the project.
 */
View.prototype.initializeOpenVersionDialog = function(){
	$('#openVersionDialog').dialog({autoOpen:false,width:650,dialogClass:'no-title'});
};

/**
 * Initializes and renders the create snapshot dialog.
 */
View.prototype.initializeCreateSnapshotDialog = function(){
	$('#createSnapshotDialog').dialog({autoOpen:false,width:650,dialogClass:'no-title'});
};

/**
 * Initializes and renders the snapshot information dialog
 */
View.prototype.initializeSnapshotInformationDialog = function(){
	$('#snapshotInformationDialog').dialog({autoOpen:false,width:650,dialogClass:'no-title'});
};

/**
 * Initializes the constraint authoring dialog
 */
View.prototype.initializeConstraintAuthoringDialog = function(){
	$('#constraintAuthoringDialog').dialog({autoOpen:false,width:1000,resizable:false,draggable:false,title:'Author Student Navigation Constraints', dialogClass:'constraintAuthoring',close:function(){eventManager.fire('closingConstraintDialog');},stack:false,modal:true});
};

/**
 * Initializes the open project dialog.
 */
View.prototype.initializeOpenProjectDialog = function(){
	$('#openProjectDialog').dialog({autoOpen:false, draggable:false, width:650, modal:true, title:'Open a Project', buttons: {'Open': function(){eventManager.fire('projectSelected');}, 'Cancel': function(){$(this).dialog("close");}}});
};

/**
 * Initializes the author project dialog.
 */
View.prototype.initializeAuthorStepDialog = function(){
	$('#authorStepDialog').dialog({autoOpen:false, width:800, height:600, resizable:true, draggable:true, modal:true, title:'Edit Step', open: function(){}, buttons: {'Save':function(){eventManager.fire("saveStep");},'Save and Close':function(){eventManager.fire("saveAndCloseStep");},'Close':function(){eventManager.fire("closeStep");}}});
};

/**
 * Initialized the edit project tags dialog.
 */
View.prototype.initializeEditProjectTagsDialog = function(){
	$('#editProjectTagsDialog').dialog({autoOpen:false, draggable:false, width:750, hide:'slow', title:'Add/Edit Project Tags'});
};

View.prototype.initializeReviewUpdateProjectDialog = function(){
	var submit = function() {
		eventManager.fire('updateProject');
		$('#reviewUpdateProjectDiv').dialog('close');
	};
	
	var cancel = function() {
		$('#reviewUpdateProjectDiv').dialog('close');
	};
	
	$('#reviewUpdateProjectDiv').dialog({autoOpen:false, draggable:false, resizeable:false, mode:true, width:800, height:600, title:'Review Update Project', buttons: {'Cancel':cancel, 'Update':submit}});
};

/**
 * Initialize the div that will display the step type descriptions
 */
View.prototype.initializeStepTypeDescriptionsDialog = function() {
	//add the table that will organize the descriptions in
	$('#stepTypeDescriptions').append("<table id='stepTypeDescriptionsTable' border='1' style='border-style:solid'></table>");
	
	//get all the node types
	var nodeTypes = NodeFactory.getNodeTypes();
	
	//used to store the step type names
	var authoringToolNames = [];
	
	//used to store the mapping from step type name to node type
	var authoringToolNamesToNodeTypes = {};
	
	//loop through all the node types
	for(var x=0; x<nodeTypes.length; x++) {
		//get a node type
		var nodeType = nodeTypes[x];
		
		var authoringToolName = "";
		
		//check if there is an entry in the nodefactory
		if(NodeFactory.nodeConstructors[nodeType] != null) {
			//get the step type name
			authoringToolName = NodeFactory.nodeConstructors[nodeType].authoringToolName;
			
			if(authoringToolName == null || authoringToolName == "") {
				//if there is no authoringToolName we will just use the node type as the name
				authoringToolName = nodeType;
			}
			
			//check if their is a step that already uses this name
			if(authoringToolNames.contains(authoringToolName)) {
				//there is a step that already uses this name so we will append the nodeType in parentheses to make it unique
				authoringToolName += " (" + nodeType + ")";
			}
			
			//add our step type name to the array
			authoringToolNames.push(authoringToolName);
			
			//add the mapping from step type name to node type
			authoringToolNamesToNodeTypes[authoringToolName] = nodeType;		
		}
	}
	
	//sort the step types names alphabetically
	authoringToolNames.sort();
	
	//loop through all the authoring tool names
	for(var x=0; x<authoringToolNames.length; x++) {
		//get the step type name
		var authoringToolName = authoringToolNames[x];
		
		//get the node type
		var nodeType = authoringToolNamesToNodeTypes[authoringToolName];
		
		if(NodeFactory.nodeConstructors[nodeType] != null) {
			//the default description
			var nodeTypeDescription = "Description not provided";
			
			if(NodeFactory.nodeConstructors[nodeType].authoringToolDescription) {
				//get the step type description
				nodeTypeDescription = NodeFactory.nodeConstructors[nodeType].authoringToolDescription;
			}

			//add the row that contains the step type name and the step type description
			$('#stepTypeDescriptionsTable').append("<tr><td style='border-style:solid'>" + authoringToolName + "</td><td style='border-style:solid'>" + nodeTypeDescription + "</td></tr>");			
		}
	}
	
	//make the div into a jquery dialog that we will display when the author clicks on the 'Step Type Descriptions' link
	$('#stepTypeDescriptions').dialog({autoOpen:false, title:'Step Type Descriptions', width:600, height:400});
};

/**
 * Create the tag view dialog popup
 */
View.prototype.initializeTagViewDialog = function() {
	//create the dialog element so we can use it later
	$('#tagViewDialog').dialog({autoOpen:false, draggable:true, resizable:true, width:800, height:600, title:'Tags', buttons: {'Close': function(){$(this).dialog("close");}}});
};

/**
 * Create the import view dialog popup
 */
View.prototype.initializeImportViewDialog = function() {
	//create the dialog element so we can use it later
	$('#importViewDialog').dialog({autoOpen:false, draggable:true, resizable:true, width:800, height:600, title:'Import', buttons: {'Close': function(){$(this).dialog("close");}}});
};

/**
 * Create the icons view dialog popup
 */
View.prototype.initializeIconsViewDialog = function() {
	//create the dialog element so we can use it later
	$('#iconsViewDialog').dialog({autoOpen:false, draggable:true, resizable:true, width:800, height:600, title:'Icons', buttons: {'Close': function(){$(this).dialog("close");}}});
};

/**
 * Create the find broken links in project dialog popup
 */
View.prototype.initializeAnalyzeProjectDialog = function() {
	$('#analyzeProjectDialog').dialog({autoOpen:false, draggable:true, resizable:true, width:800, height:600, title:'Analyze Project', buttons: {'Close': function(){$(this).dialog("close");}}});
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_dialog.js');
}