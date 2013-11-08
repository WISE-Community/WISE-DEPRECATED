function Idea(id, timeCreated, timeLastEdited, text, source, tags, flag, nodeId, nodeName) {
	this.id = id; //unique id (order of creation)
	this.timeCreated = timeCreated; //creation timestamp
	this.timeLastEdited = timeLastEdited; //time last edited
	this.text = text; //idea's text
	this.source = source; //idea's source
	this.nodeId = nodeId; //the id of the step
	this.nodeName = nodeName; //the name of the step
	this.tags = tags; //idea's tags
	this.flag = flag; //idea's flag
	this.stepsUsedIn = [];
	this.changeText = null;
	this.workgroupId = null;
	this.isPublishedToPublic = false;
	this.wasCopiedFromPublic = false;
}

function IdeaV2(id, timeCreated, timeLastEdited, text, attributes, nodeId, nodeName, workgroupId) {
	this.id = id; //unique id (order of creation)
	this.timeCreated = timeCreated; //creation timestamp
	this.timeLastEdited = timeLastEdited; //time last edited
	this.text = text; //idea's text
	this.attributes = attributes; //idea's additional attributes (source, label, tags, icon; depends on Idea Manager settings for project)
	this.nodeId = nodeId; //the id of the step
	this.nodeName = nodeName; //the name of the step
	this.stepsUsedIn = [];
	this.changeText = null;
	this.workgroupId = workgroupId;
	this.isPublishedToPublic = false;
	this.wasCopiedFromPublic = false;
}

/**
 * Creates an IdeaBasket instance
 * @param ideaBasketJSONObj optional argument, if it is provided it will load
 * the data from the JSON into this object
 * @param createForStep boolean value whether we are creating the idea basket 
 * for an idea basket step
 * @param node the node we are creating the basket for (if createForStep is true)
 * @param settings Idea Manager settings object, which specifies version, idea attribute fields, terminology
 * @return an IdeaBasket instance
 */
function IdeaBasket(ideaBasketJSONObj, createForStep, node, settings) {
	this.id;
	this.runId;
	this.workgroupId;
	this.projectId;
	this.ideas = [];
	this.deleted = [];
	this.nextIdeaId = 1;
	this.version = 1;
	this.settings = null;
	
	// set Idea Manager settings and version
	if(settings){
		this.settings = settings;
		if(settings.hasOwnProperty('version')){
			this.version = parseInt(settings.version, 10);
		}
	}
	
	if(createForStep) {
		//we are creating an idea basket for an idea basket step
		
		//set the values for the idea basket step
		this.node = node;
		this.view = node.view;
		this.content = node.getContent().getContentJSON();
		
		if(node.studentWork !== null) {
			this.states = node.studentWork; 
		} else {
			this.states = [];  
		}
	}

	if(!ideaBasketJSONObj) {
		//JSON is not provided so we will just initialize the UI
		this.init(this);
	} else {
		/*
		 * JSON is provided so we will populate the data and not initialize the UI.
		 * this is supposed to be used when you want the idea basket object but
		 * do not need to display it such as when the vle retrieves the basket
		 * to "Add an Idea"
		 */
		this.load(ideaBasketJSONObj, false, null);
	}
}

/**
 * Initialize the IdeaBasket turning on tablesorter to allow sorting
 * by columns and turning on sortable to allow students to drag and drop
 * rows to manually sort the table
 * @param context
 */
IdeaBasket.prototype.init = function(context) {
	var enableStep = true,
		message = '',
		workToImport = [];
	
	//process the tag maps if we are not in authoring mode
	if(this.view && !this.view.authoringMode) {
		//get the tag map results
		var tagMapResults = this.processTagMaps();
		
		//get the result values
		enableStep = tagMapResults.enableStep;
		message = tagMapResults.message;
		workToImport = tagMapResults.workToImport;
	}
	
	//allow the ideas and deleted tables to be auto sorted by columns by clicking on the header columns
	var noSort = $("#basketIdeas > thead > tr > th").length - 1;
	$("#basketIdeas").tablesorter({textExtraction: "complex", sortMultiSortKey:'', widgets:['zebra'], headers:{noSort:{sorter:false}}});
	$("#basketDeleted").tablesorter({textExtraction: "complex", sortMultiSortKey:'', headers:{noSort:{sorter:false}}});
	
	/*
	 * update the order in our IdeaBasket arrays when the student
	 * drags and drops rows to manually sort the table
	 */
	$("#basketIdeas").off("sortEnd");
	$("#basketIdeas").on("sortEnd",function() { 
		context.updateOrder(0); 
	});
	$("#basketDeleted").off("sortEnd");
	$("#basketDeleted").on("sortEnd",function() { 
		context.updateOrder(1); 
	}); 

	//make the ideas table manually sortable
	$('#basketIdeas tbody').sortable({
			helper: fixHelper,
			start: function(event,ui){
			//context.current = $('#basketIdeas tbody tr').index(ui.item);
		},
		update: function(event,ui){
			context.updateOrder(0);
			$('#basketIdeas thead tr .header').removeClass('headerSortUp').removeClass('headerSortDown');
		}
	}).disableSelection();

	//make the deleted table manually sortable
	$('#basketDeleted tbody').sortable({
			helper: fixHelper,
			start: function(event,ui){
			//context.current = $('#basketDeleted tbody tr').index(ui.item);
		},
		update: function(event,ui){
			context.updateOrder(1);
			$('table.tablesorter th').removeClass('headerSortUp').removeClass('headerSortDown');
		}
	}).disableSelection();
};

/**
 * Load the ideas into the tables in the interface
 * @param ideaBasketJSONObj the JSON object to populate the data from
 * @param generateUI boolean value whether to generate the UI
 * @param view VLE View instance object
 * @param publicIdeaBasketJSONObj (optional) the public idea basket JSON object
 */
IdeaBasket.prototype.load = function(ideaBasketJSONObj, generateUI, settings, view, publicIdeaBasketJSONObj) {
	if(settings){
		this.settings = settings;
		this.version = parseInt(settings.version, 10);
	}
	
	if(view){
		this.view = view;
	}
	
	//set the public idea basket if it was provided
	if(publicIdeaBasketJSONObj) {
		this.setPublicIdeaBasket(publicIdeaBasketJSONObj);
	}
	
	if(this.view){
		// set text for customizable terms based on settings or default i18n string
		this.view.insertTranslations();
		this.ideaTerm = this.view.getI18NString('idea');
		this.ideaTermPlural = this.view.getI18NString('idea_plural');
		this.basketTerm = this.view.getI18NString('idea_basket');
		this.ebTerm = this.view.getI18NString('explanation_builder');
		this.addIdeaTerm = this.view.getI18NString('idea_basket_add_an_idea');
		this.privateBasketTerm = this.view.getI18NString('idea_basket_private');
		this.publicBasketTerm = this.view.getI18NString('idea_basket_public');
		if(this.version > 1){
			if(this.settings.hasOwnProperty('ideaTerm') && this.view.utils.isNonWSString(this.settings.ideaTerm)){
				this.ideaTerm = this.settings.ideaTerm;
			}
			if(this.settings.hasOwnProperty('ideaTermPlural') && this.view.utils.isNonWSString(this.settings.ideaTermPlural)){
				this.ideaTermPlural = this.settings.ideaTermPlural;
			}
			if(this.settings.hasOwnProperty('basketTerm') && this.view.utils.isNonWSString(this.settings.basketTerm)){
				this.basketTerm = this.settings.basketTerm;
			}
			if(this.settings.hasOwnProperty('ebTerm') && this.view.utils.isNonWSString(this.settings.ebTerm)){
				this.ebTerm = this.settings.ebTerm;
			}
			if(this.settings.hasOwnProperty('addIdeaTerm') && this.view.utils.isNonWSString(this.settings.addIdeaTerm)){
				this.addIdeaTerm = this.settings.addIdeaTerm;
			}
			if(this.settings.hasOwnProperty('privateBasketTerm') && this.view.utils.isNonWSString(this.settings.privateBasketTerm)){
				this.privateBasketTerm = this.settings.privateBasketTerm;
			}
			if(this.settings.hasOwnProperty('publicBasketTerm') && this.view.utils.isNonWSString(this.settings.publicBasketTerm)){
				this.publicBasketTerm = this.settings.publicBasketTerm;
			}
		}
	}
	/*
	 * ideaBasketJSONObj will be null in authoring preview step in which case
	 * we do not want to load anything
	 */
	if(ideaBasketJSONObj) {
		//set the values from the JSON object we received from the server
		
		this.id = ideaBasketJSONObj.id;
		this.runId = ideaBasketJSONObj.runId;
		this.workgroupId = ideaBasketJSONObj.workgroupId;
		this.projectId = ideaBasketJSONObj.projectId;
		
		if(ideaBasketJSONObj.hasOwnProperty('nextIdeaId') && ideaBasketJSONObj.nextIdeaId !== null) {
			this.nextIdeaId = ideaBasketJSONObj.nextIdeaId;
		}
		
		if(ideaBasketJSONObj.hasOwnProperty('ideas') && ideaBasketJSONObj.ideas !== null) {
			this.ideas = ideaBasketJSONObj.ideas;
		}
		
		if(ideaBasketJSONObj.hasOwnProperty('deleted') && ideaBasketJSONObj.deleted !== null) {
			this.deleted = ideaBasketJSONObj.deleted;		
		}

		if(generateUI) {
			//we will generate the UI
			if(!this.settingsProcessed){
				this.processSettingsUI();
			}

			// clear out existing rows
			$('#basketIdeas tbody tr').each(function(){
				$(this).remove();
			});

			$('#basketDeleted tbody tr').each(function(){
				$(this).remove();
			});

			//populate tables
			for(var i=0; i<this.ideas.length; i++){
				this.addRow(0,this.ideas[i],true);
			}
			for(var i=0; i<this.deleted.length; i++){
				this.addRow(1,this.deleted[i],true);
			}

			$("#basketIdeas").trigger("applyWidgets");
		}	
	}
};

/**
 * Creates a label and an input DOM element for the specified idea attribute
 * @param attribute Object with the attribute settings
 * @param dialog String specifying which dialog we are adding to (can be 'add' or 'edit')
 * @param vleview Object representing the VLE view (optional)
 * @returns jQuery DOM element
 */
IdeaBasket.prototype.createAttributeInput = function(attribute,dialog,vleview){
	if(dialog !== 'add' && dialog !== 'edit'){
		return '';
	}
	
	var view = vleview ? vleview : this.view,
		inputContent = '',
		type = attribute.type,
		labelText = attribute.name, requiredClass = '';
	if(attribute.isRequired){
		labelText += '*';
		requiredClass = 'required';
	}
	var idName = dialog + '_' + type + '_' + attribute.id;
	var $inputLabel = null, $input = null, $custom = null;
	if(type==='label' || type==='source'){
		$inputLabel = $('<label for="' + idName + '">' + labelText + ': </label>');
		$input = $(document.createElement('select')).attr('id', idName).attr('name', idName).addClass(requiredClass);
		$input.append('<option value="">' + view.getI18NString('ideaManager_attributeSelectOneLabel') + '</option>');
		for(var a=0;a<attribute.options.length;a++){
			var option = '<option value="' + attribute.options[a] + '">' + attribute.options[a] + '</option>';
			$input.append(option);
		}
		if(attribute.hasOwnProperty('allowCustom') && attribute.allowCustom){
			$input.append('<option value="Other">' + view.getI18NString('ideaBasket_customAttributeLabel') + '</option>');
			$custom = $(document.createElement('div')).attr('id',dialog + '_other_' + attribute.id).addClass('attributeOther');
			$custom.append('<label for="' + dialog + '_other_' + attribute.id +'">Please specify: </label>');
			$customInput = $('<input type="text" name="' + dialog + '_other_' + attribute.id +'" class="other required inactive" size="25" minlength="2" maxlength="25" />');
			$custom.append($customInput);
			$input.change(function(){
				if($(this).val() === 'Other'){
					$custom.children().removeClass('inactive');
					$custom.show();
				} else {
					$custom.hide();
					$custom.children().addClass('inactive');
				}
			});
		}
	} else if (type==='tags') {
		$inputLabel = $('<div><label for="' + idName + '">' + labelText + ' ' + view.getI18NString('ideaManager_attributeSelectMultiple') + '</label><div>');
		$input = $(document.createElement('div'));
		if(attribute.isRequired){
			requiredClass = 'require-one';
		}
		for(var x=0;x<attribute.options.length;x++){
			var option = $('<input type="checkbox" name="' + idName + '" value="' + attribute.options[x] + '" class="' + requiredClass + '" />' + '<span>' + attribute.options[x] + '</span>');
			$input.append(option);
		}
	} else if(type==='icon'){
		$inputLabel = $('<div><label for="' + idName + '">' + labelText + ' ' + view.getI18NString('ideaManager_attributeSelectOne') + '</label><div>');
		$input = $(document.createElement('div'));
		for(var x=0;x<attribute.options.length;x++){
			var text = view.getI18NString('ideaManager_noIconLabel');
			if(attribute.options[x] !== 'blank'){
				text = '<img src="./images/ideaManager/' + attribute.options[x] + '.png" alt="' + attribute.options[x] + '" />';
			}
			var option = $('<input type="radio" name="' + idName + '" value="' + attribute.options[x] + '" class="' + requiredClass + '" /><span>' + text + '</span>');
			$input.append(option);
		}
	}
	
	if($inputLabel && $input){
		inputContent = $(document.createElement('div')).addClass('attribute').addClass(type).attr('id',dialog + '_attribute_' + attribute.id).append($inputLabel).append($input);
		if($custom){
			inputContent.append($custom);
		}
	}
	return inputContent;
};

/**
 * creates and inserts Idea Basket HTML components (add/edit idea
 * dialogs, idea tables, and terminology) based on 
 * Idea Manager version and settings object
 */
IdeaBasket.prototype.processSettingsUI = function(){
	var context = this,
		view = this.view;
	
	if(this.version > 1){
		// we only need to update the DOM and terminology if using Idea Manager v2 or greater
		
		// insert i18n translations
		$('#addNew').attr('value', this.addIdeaTerm);
		$('#ideasEmpty').text(view.getI18NStringWithParams('ideaBasket_empty', [this.basketTerm, this.addIdeaTerm, this.ideaTermPlural]));
		$('#basketTitle').text(this.basketTerm);
		
		$('#deletedIdeaConfirm1').text(view.getI18NStringWithParams('ideaManager_deleteIdea_confirm1', [this.ideaTerm]));
		$('#deletedIdeaConfirm2').text(view.getI18NString('ideaManager_deleteIdea_confirm2'))
		
		// clear add and edit idea forms, idea tables
		var ideaDialog = $('#ideaForm > fieldset').html('');
		var editDialog = $('#editForm > fieldset').html('');
		var ideaTable = $('#basketIdeas > thead > tr').html('');
		var deletedTable = $('#basketDeleted > thead > tr').html('');
		
		// insert text input and label for add and edit idea dialogs
		var ideaText = $(document.createElement('div')).addClass('text'),
			ideaTextLabel = view.getI18NStringWithParams('ideaManager_addIdea_textLabel', [this.ideaTerm]);
		ideaText.append('<div><label for="text">' + ideaTextLabel + '</label></div>');
		ideaText.append('<div><textarea id="text" name="text" rows="2" class="required" minlength="2" maxlength="150"></textarea></div>');
		ideaDialog.append(ideaText);
		
		var editText = $(document.createElement('div')).addClass('text');
		editText.append('<div><label for="editText">' + ideaTextLabel + '</label></div>');
		editText.append('<div><textarea id="editText" name="editText" rows="2" class="required" minlength="2" maxlength="150"></textarea></div>');
		editDialog.append(editText);
		
		// insert idea text columns for idea tables
		ideaTable.append("<th class='ideas' title='" + view.getI18NString('ideaBasket_clickToSort') + "'>" + view.getI18NStringWithParams('ideaBasket_ideaTableHeader', [this.view.utils.capitalize(this.ideaTermPlural)]) + "</th>");
		deletedTable.append("<th class='ideas' title='" + view.getI18NString('ideaBasket_clickToSort') + "'>" + view.getI18NStringWithParams('ideaBasket_deletedTableHeader', [this.view.utils.capitalize(this.ideaTermPlural)]) + "</th>");
		
		var settings = this.settings;
		
		// insert public and private idea button values
		$('#privateBasketButton').attr('value', this.privateBasketTerm);
		$('#publicBasketButton').attr('value', this.publicBasketTerm);
		
		// clear public idea table
		var publicIdeaTable = $('#publicBasketIdeas > thead > tr').html('');
		
		// insert header for public idea table
		publicIdeaTable.append("<th class='ideas' title='" + view.getI18NString('ideaBasket_clickToSort') + "'>" + view.getI18NStringWithParams('ideaBasket_public_header', [this.view.utils.capitalize(this.ideaTermPlural)]) + "</th>");
		if(this.isPublicIdeaBasketEnabled()) {
			$('#publicIdeasEmpty').text(view.getI18NStringWithParams('ideaBasket_public_empty', [this.publicBasketTerm]));
			
			/*
			 * public idea basket is enabled so we will add the 'Origin' column
			 * to the private basket and trash basket
			 */
			ideaTable.append("<th class='ideas'>"+ view.getI18NString("ideaBasket_public_origin") + "</th>");
			deletedTable.append("<th class='ideas'>"+ view.getI18NString("ideaBasket_public_origin") + "</th>");
		}
		
		//insert the 'Times Copied' column
		publicIdeaTable.append("<th class='ideas'>" + view.getI18NString('ideaBasket_public_timesCopied') + "</th>");
		
		// insert attribute inputs for add and edit idea dialogs, as well as table attribute columns based on settings
		for (var i=0;i<settings.ideaAttributes.length;i++){
			var attribute = settings.ideaAttributes[i];
			var addAttr = this.createAttributeInput(attribute,'add');
			var editAttr = this.createAttributeInput(attribute,'edit');
			ideaDialog.append(addAttr);
			editDialog.append(editAttr);
			var name = attribute.name, type = attribute.type;
			ideaTable.append("<th class='" + type + "' title='" + view.getI18NString('ideaBasket_clickToSort') + "'>" + name + "</th>");
			publicIdeaTable.append("<th class='" + type + "' title='" + view.getI18NString('ideaBasket_clickToSort') + "'>" + name + "</th>");
			deletedTable.append("<th class='" + type + "' title='" + view.getI18NString('ideaBasket_clickToSort') + "'>" + name + "</th>");
		}
		
		ideaTable.append('<th class="delete">' + view.getI18NString('ideaBasket_deleteHeader') + '</th>');
		deletedTable.append('<th class="delete">' + view.getI18NString('ideaBasket_restoreHeader') + '</th>');
		publicIdeaTable.append('<th class="delete">' + view.getI18NString('ideaBasket_public_copyLinkText') + '</th>');
		
		if(this.isPublicIdeaBasketEnabled()) {
			$('#basketTitle').text(this.privateBasketTerm);
			//create the buttons to make an idea public or private
			var makePublicButton = $('<input id="makePublicButton" type="button" name="makePublicButton" value="' + view.getI18NString("ideaBasket_public_makePublic") + '"></input>');
			var makePrivateButton = $('<input id="makePrivateButton" type="button" name="makePrivateButton" value="' + view.getI18NString("ideaBasket_public_makePrivate") + '"></input>');
			
			//create the p that will display whether the idea is public or private
			var sharingStatusP = $('<p id="sharingStatus" style="display:inline"></p>');
			
			//add the elements to the edit idea dialog popup
			editDialog.append(makePublicButton);
			editDialog.append(makePrivateButton);
			editDialog.append(sharingStatusP);
		}
		
		//set the onclick event when the private idea basket button is clicked
		$('#privateBasketButton').on('click', function(){
			//hide the public basket
			$('#publicMain').hide();
			
			//show the private basket
			$('#main').show();
			
			//change the title to private
			$('#basketTitle').html(context.privateBasketTerm);
		});

		var thisView = this.view;
		var thisBasket = this;
		
		//set the onclick event when the public idea basket button is clicked		
		$('#publicBasketButton').click({thisView:thisView, thisBasket:thisBasket}, function(event) {
			//retrieve the latest public idea basket revision and display it
			var displayPublicIdeaBasket = true;
			var thisBasket = event.data.thisBasket;
			
			//request the public idea basket
			thisView.getPublicIdeaBasket(thisBasket, displayPublicIdeaBasket);
		});
	} else {
		// set up add and idea form validation and 'other' select change event
		$("#ideaForm").validate();

		$('#source').change(function(){
			if($('#source').val()==='Other'){
				$('#otherSource').show();
				$('#other').addClass('required');
			} else {
				$('#otherSource').hide();
				$('#other').removeClass('required');
			}
			$("#ideaForm").validate();
		});

		$('#editSource').change(function(){
			if($('#editSource').val()==='Other'){
				$('#editOtherSource').show();
				$('#editOther').addClass('required');
			} else {
				$('#editOtherSource').hide();
				$('#editOther').removeClass('required');
			}
			$("#editForm").validate();
		});
	}
	
	// set up add idea dialog
	var title = view.getI18NStringWithParams("ideaManager_addIdea_title", [view.utils.capitalize(this.ideaTerm)]);
	$('#ideaDialog').dialog({title:title, autoOpen:false, modal:true, resizable:false, width:'470',
		buttons:[
			 {
				 text: view.getI18NString('ok'),
				 click: function(){
					 if($("#ideaForm").validate().form()){
						if(context.version > 1){
							var attributes = context.getIdeaAttributes('add');
							context.addV2($('#text').val(),attributes);
							
							$(this).dialog("close");
							resetForm('ideaForm');
						} else {
							var source = $('#source').val();
							if(source === 'empty'){
								alert('Please select a source for your ' + context.ideaTerm + '.');
							} else {
								if(source==='Other'){
									source = 'Other: ' + $('#other').val();
								}
								context.add($('#text').val(),source,$('#tags').val(),$("input[name='flag']:checked").val());
								
								$(this).dialog("close");
								resetForm('ideaForm');
							}
						}
					}
				 }
			 },
			 {
				 text: view.getI18NString('cancel'),
				 click: function(){
					 $(this).dialog("close");
					resetForm('ideaForm');
				 }
			 }
		],
		open: function(event, ui){
			$.validator.addMethod('require-one', function (value) {
		          return $('.require-one:checked').size() > 0; }, view.getI18NString("ideaManager_addIdea_required"));
			var checkboxes = $('#ideaForm .require-one');
			var checkbox_names = $.map(checkboxes, function(e,i) { return $(e).attr("name"); }).join(" ");

			$('#ideaForm').validate({
				groups: { checks: checkbox_names },
				errorPlacement: function(error, element) {
		             if (element.attr("type") === "checkbox" || element.attr('type') === 'radio'){
		            	 error.insertAfter(element.parent().children(':last'));
		             } else {
		            	 error.insertAfter(element);
		             }
				},
				ignore: '.inactive'
			});
		}
	});

	$('#addNew').click(function(){
		$('#ideaDialog').dialog('open');
	});
	
	$('#toggleDeleted').click(function() {
		if($(this).hasClass('visible')){
			$('#trash').fadeOut();
			$('#toggleDeleted').removeClass('visible');
			$('#showDeleted').text(view.getI18NString("ideaBasket_showDeleted"));
			//$('#toggleDeleted img.arrow').attr('src','images/arrow.png');
			//return false;
		} else {
			$('#trash').fadeIn();
			$('#toggleDeleted').addClass('visible');
			$('#showDeleted').text(view.getI18NString("ideaBasket_hideDeleted"));
			//$('#toggleDeleted img.arrow').attr('src','images/arrow-down.png');
			//return false;
		}
	});
	
	$('textarea#text, textarea#editText, input#addAnIdeaText').keyup(function() {
        var len = this.value.length;
        if (len >= 150) {
            this.value = this.value.substring(0, 150);
        }
    });
	
	this.settingsProcessed = true;
	// re-initialize the table sorting
	this.init(this);
	
	if(this.isPublicIdeaBasketEnabled()) {
		/*
		 * public idea basket is only available in the newer version of the idea basket
		 * and when it is enabled in the project
		 */
		this.loadPublicIdeaBasket();
		
		/*
		 * hide the public idea basket when the basket is first opened.
		 * the student must click to show the public idea basket.
		 */
		$('#publicMain').hide();
	} else {
		//public idea basket is not available for the old version of the idea basket
		
		//hide the public idea basket
		$('#publicMain').hide();
		
		//hide the show public and private buttons 
		$('#buttonDiv').hide();
	}
};

/**
 * Get an idea given the ideaId
 * @param ideaId the id of the idea we want
 * @return the idea with the given id
 */
IdeaBasket.prototype.getIdeaById = function(ideaId) {
	//loop through the ideas array
	for(var i=0;i<this.ideas.length;i++){
		if(this.ideas[i].id === parseInt(ideaId, 10)){
			return this.ideas[i];
		}
	}

	//loop through the deleted array
	for(var i=0;i<this.deleted.length;i++){
		if(this.deleted[i].id === parseInt(ideaId, 10)){
			return this.deleted[i];
		}
	}

	return null;
};

/**
 * Create the idea and add it to the ideas array as well as the UI
 * @param text
 * @param source
 * @param tags
 * @param flag
 */
IdeaBasket.prototype.add = function(text,source,tags,flag) {
	this.setBasketChanged(true);

	var nodeName = ";"
	
	if(parent.frames['ideaBasketIfrm'] !== null) {
		//we are adding an idea from the idea basket popup
		
		//get the values for the current step
		var nodeId = this.view.getCurrentNode().id;
		var vlePosition = this.view.getProject().getVLEPositionById(nodeId);
		nodeName = this.view.getCurrentNode().getTitle();
		nodeName = vlePosition + ": " + nodeName;
	} else {
		//we are adding an idea from an idea basket step so we have access to this
		
		//get the values for the current step
		var nodeId = this.view.getCurrentNode().id;
		var vlePosition = this.view.getProject().getVLEPositionById(nodeId);
		nodeName = this.view.getCurrentNode().getTitle();
		nodeName = vlePosition + ": " + nodeName;
	}
	
	//create an add an idea to the basket
	var newIdea = this.addIdeaToBasketArray(text, source, tags, flag, nodeId, nodeName);
	//add the idea to the UI
	basket.addRow(0,newIdea);
	this.updateToolbarCount(true);
	
	//save the idea basket back to the server
	this.save('addPrivateIdea', newIdea.workgroupId, newIdea.id);
};

/**
 * Create the idea and add it to the ideas array as well as the UI
 * @param text
 * @param attributes
 */
IdeaBasket.prototype.addV2 = function(text,attributes) {
	this.setBasketChanged(true);

	var nodeName = ";"
	
	if(parent.frames['ideaBasketIfrm'] !== null) {
		//we are adding an idea from the idea basket popup
		
		//get the values for the current step
		var nodeId = this.view.getCurrentNode().id;
		var vlePosition = this.view.getProject().getVLEPositionById(nodeId);
		nodeName = this.view.getCurrentNode().getTitle();
		nodeName = vlePosition + ": " + nodeName;
	} else {
		//we are adding an idea from an idea basket step so we have access to this
		
		//get the values for the current step
		var nodeId = this.view.getCurrentNode().id;
		var vlePosition = this.view.getProject().getVLEPositionById(nodeId);
		nodeName = this.view.getCurrentNode().getTitle();
		nodeName = vlePosition + ": " + nodeName;
	}
	
	//create an add an idea to the basket
	var newIdea = this.addIdeaToBasketArrayV2(text, attributes, nodeId, nodeName);
	//add the idea to the UI
	basket.addRow(0,newIdea);
	this.updateToolbarCount(true);
	
	//save the idea basket back to the server
	this.save('addPrivateIdea', newIdea.workgroupId, newIdea.id);
};

/**
 * Create and add an idea to the basket
 * @param text
 * @param source
 * @param tags
 * @param flag
 * @param nodeId
 * @param nodeName
 * @return the new idea that was just added to the basket
 */
IdeaBasket.prototype.addIdeaToBasketArray = function(text,source,tags,flag,nodeId,nodeName) {
	//get the current time
	var newDate = new Date();
	var time = newDate.getTime();
	
	//create the new idea
	var newIdea = new Idea(this.nextIdeaId,time,time,text,source,tags,flag,nodeId,nodeName);
	
	//increment this counter so that the next idea will have a new id
	this.nextIdeaId++;

	//add the idea to the array of ideas
	this.ideas.push(newIdea);
	
	this.updateToolbarCount();
	
	return newIdea;
};

/**
 * Create and add an idea to the basket
 * @param text
 * @param attributes
 * @param nodeId
 * @param nodeName
 * @return the new idea that was just added to the basket
 */
IdeaBasket.prototype.addIdeaToBasketArrayV2 = function(text,attributes,nodeId,nodeName) {
	//get the current time
	var newDate = new Date();
	var time = newDate.getTime();
	
	//create the new idea
	var newIdea = new IdeaV2(this.nextIdeaId,time,time,text,attributes,nodeId,nodeName, this.workgroupId);
	
	//increment this counter so that the next idea will have a new id
	this.nextIdeaId++;

	//add the idea to the array of ideas
	this.ideas.push(newIdea);
	
	this.updateToolbarCount();
	
	return newIdea;
};

/**
 * Add the new idea to the UI
 * @param target
 * @param idea
 * @param load
 * @return
 */
IdeaBasket.prototype.addRow = function(target,idea,load){
	var context = this,
		view = this.view,
		currTable = 'idea',
		table = $('#basketIdeas tbody'),
		link = 'delete',
		title = view.getI18NString("ideaBasket_ideaTitle"),
		linkText = idea.text;
	
	if(idea.isPublishedToPublic) {
		//display the fact that this idea is public
		linkText += ' (' + view.getI18NString('ideaBasket_public_publicLabel') + ')';
	}

	//the link used to open the edit dialog for this idea
	var editLinkText = view.getI18NString("ideaBasket_editLinkText"),
		editLinkTitle = view.getI18NStringWithParams('ideaBasket_editLinkTitle', [view.utils.capitalize(this.ideaTerm)]),
		editLink = '<span class="editLink" title="' + editLinkTitle + '">' + editLinkText + '</span>';
	
	if (target===1){
		currTable = 'deleted';
		//table = this.deletedTable;
		table = $('#basketDeleted tbody');
		link = 'restore';
		title = view.getI18NStringWithParams('ideaBasket_deletedIdeaTitle', [this.ideaTerm]);
		linkText = idea.text;
	}
	var html = '';
	if(this.version > 1){
		var imAttributes = this.settings.ideaAttributes;
		html = $(document.createElement('tr')).attr('id',currTable + idea.id).attr('title',title);
		html.append('<td><div id="ideaText' + idea.id + '" class="ideaText" style="display:inline">' + linkText + '</div>' + editLink + '</td>');
		
		if(this.isPublicIdeaBasketEnabled()) {
			/*
			 * the public idea basket is enabled so we will 
			 * add the origin row that displays where this
			 * idea came from
			 */
			
			//find if the idea was copied from the public basket
			var wasCopiedFromPublic = idea.wasCopiedFromPublic;
			
			var origin = '';
			
			if(wasCopiedFromPublic) {
				//the idea was copied from the public basket
				origin = view.getI18NString('ideaBasket_public_copiedIdea');
			} else {
				//the idea was not copied from the public basket
				origin = view.getI18NString('ideaBasket_public_orignalIdea');
			}
			
			//display the origin column
			html.append('<td><span class="ideaText">' + origin + '</span></td>');
		}
		
		for(var i=0;i<imAttributes.length;i++){
			var attrId = imAttributes[i].id;
			var type = imAttributes[i].type;
			var newTD = $(document.createElement('td'));
			for(var a=0;a<idea.attributes.length;a++){
				if(idea.attributes[a].id === attrId && idea.attributes[a].type === type){
					if(type === 'label' || type === 'source'){
						newTD.append(idea.attributes[a].value); 
					} else if (type === 'icon'){
						newTD.append('<span title="' + idea.attributes[a].value +	'" class="' + idea.attributes[a].value + '"></span>');
					} else if (type === 'tags'){
						var tagsHtml = '';
						for(var x=0;x<idea.attributes[a].value.length;x++){
							tagsHtml += '<span class="tag">' + idea.attributes[a].value[x] + '</span>';
						}
						newTD.append(tagsHtml);
					}
				}
			}
			html.append(newTD);
		}
		html.append('<td><span class="' + link + '" title="' + link + ' ' + this.ideaTerm + '"></span></td>');
	} else {
		if(idea.tags){
			var tags = idea.tags;
		} else {
			var tags = '';
		}
		html = '<tr id="' + currTable + idea.id + '" title="' + title + '"><td><div class="ideaText">' + linkText +
			'</div></td><td>' + idea.source + '</td>' +	'<td><div class="ideaTags">' + tags +
			'</div></td>' + '<td style="text-align:center;"><span title="' +idea.flag +	'" class="' + idea.flag + '"></span></td>'+
			'<td style="text-align:center;"><span class="' + link + '" title="' + link + ' ' + this.ideaTerm + '"></span></td></tr>';
	}

	table.prepend(html);
	var $newTr = $('#' + currTable + idea.id);
	var $newLink = $('#' + currTable + idea.id + ' span.' + link);
	var $editLink = $('#' + currTable + idea.id + ' span.editLink');

	if(!load){
		$newLink.parent().parent().effect("pulsate", { times:1 }, 500);
	}

	if(target===0){
		// bind edit link and double click of row to open edit dialog
		$editLink.click(function(){
			var $clicked = $newTr;
			var id = $newTr.attr('id');
			id = id.replace('idea','');
			context.openEditDialog(context,id,$clicked);
		});
		$newTr.dblclick(function(){
			var $clicked = $(this);
			var id = $(this).attr('id');
			id = id.replace('idea','');
			context.openEditDialog(context,id,$clicked);
		});

		$newLink.click(function(){
			var $clicked = $(this);
			$('#deleteDialog').dialog({ title:view.getI18NString("ideaManager_deleteIdea_title"), modal:true, resizable:false, width:'400',
				buttons:[
				 	{
				 		text: view.getI18NString('ok'),
				 		click: function(){
				 			var index = $clicked.parent().parent().attr('id');
							index = index.replace('idea','');
							
							/*
							 * check if the idea is being used in an explanation builder step,
							 * if it is, we will display a confirmation popup that asks the
							 * student if they're sure they want to edit the idea. if the
							 * idea is not being used in an eb step it will return true
							 * by default.
							 */
							var answer = basket.checkIfIdeaUsed(index);
							
							if(answer) {
								var $tr = $clicked.parent().parent();
								basket.remove(index,$tr);
								$(this).dialog("close");					
							}
				 		}
				 	},
				 	{
				 		text: view.getI18NString('cancel'),
				 		click: function(){
				 			$(this).dialog("close");
				 		}
				 	}
				]
			});
		});
	} else {
		$newLink.click(function(){
			/*if(confirm("Are you sure you want to move this idea back to your active ideas?")){*/
			var index = $(this).parent().parent().attr('id');
			index = index.replace('deleted','');
			var $tr = $(this).parent().parent();
			basket.putBack(index,$tr);
			//}
		});
	}

	$('#basketIdeas').trigger("update");
	$('#basketIdeas').trigger("applyWidgets");
	$('#basketDeleted').trigger("update");
	$('#basketDeleted').trigger("applyWidgets");

	var numDeleted = basket.deleted.length;
	$('#numDeleted').text(view.getI18NString("ideaBasket_trashLabel") + ' (' + numDeleted + ')');
	if(numDeleted>0){
		$('#deletedEmpty').hide();
	} else {
		//$('#toggleDeleted').click();
		$('#deletedEmpty').show();
		//$('#trash').hide();
	}
	if(basket.ideas.length>0) {
		$('#ideasEmpty').hide();
	} else {
		$('#ideasEmpty').show();
	}
	
	$('tr .header').removeClass('headerSortDown').removeClass('headerSortUp');
};

IdeaBasket.prototype.openEditDialog = function(context,id,$clicked){
	var text = '',
		view = this.view;
	
	//populate edit fields
	for(var i=0;i<basket.ideas.length;i++){
		if(basket.ideas[i].id === parseInt(id, 10)){
			var idea = basket.ideas[i];
			text = idea.text;
			$('#editText').val(text);
			
			if(this.version > 1){
				var attributes = idea.attributes;
				for(var a=0;a<attributes.length;a++){
					var attrId = attributes[a].id, type = attributes[a].type;
					if(type==='source' || type==='label'){
						if(attributes[a].value.match(/^Other: /)){
							$('#edit_' + type + '_' + attrId).val(view.getI18NString('ideaBasket_customAttributeLabel'));
							$('input[name="edit_other_' + attrId + '"]').val(attributes[a].value.replace(/^Other: /,''));
							$('#edit_other_' + attrId).show();
						} else {
							$('#edit_' + type + '_' + attrId).val(attributes[a].value);
						}
					} else if (type==='icon'){
						$('[name=edit_' + type + '_' + attrId + ']').filter('[value="'+attributes[a].value+'"]').prop("checked",true);
					} else if (type==='tags'){
						for(var x=0;x<attributes[a].value.length;x++){
							$('[name=edit_' + type + '_' + attrId + ']').filter('[value="'+attributes[a].value[x]+'"]').prop("checked",true);
						}
					}
				}
				
				/*
				 * unbind any existing on click functions. this is required
				 * because we bind an on click every time we open the edit
				 * idea dialog to pass in the new id. if we did not unbind
				 * the click would fire all previous functions we bound.
				 */
				$('#makePublicButton').off('click');
				
				var publicLabel = view.getI18NString('ideaBasket_public_publicLabel'),
					privateLabel = view.getI18NString('ideaBasket_public_privateLabel');
				
				//bind the function to make the idea public
				$('#makePublicButton').click({idea:idea, thisView:this.view, id:id}, function(event) {
					$('#sharingStatus').html(publicLabel);
				});

				/*
				 * unbind any existing on click functions. this is required
				 * because we bind an on click every time we open the edit
				 * idea dialog to pass in the new id. if we did not unbind
				 * the click would fire all previous functions we bound.
				 */
				$('#makePrivateButton').off('click');
				
				//bind the function to make the idea private
				$('#makePrivateButton').click({idea:idea, thisView:this.view, id:id}, function(event) {
					$('#sharingStatus').html(privateLabel);
				});
				
				//set the text to show whether this idea is currently public or private
				if(idea.isPublishedToPublic) {
					$('#sharingStatus').html(publicLabel);				
				} else {
					$('#sharingStatus').html(privateLabel);
				}
			} else {
				if(basket.ideas[i].source.match(/^Other: /)){
					$('#editSource').val(view.getI18NString('ideaBasket_customAttributeLabel'));
					$('#editOther').val(idea.source.replace(/^Other: /,''));
					$('#editOtherSource').show();
					$('#editOther').addClass('required');
				} else {
					$('#editSource').val(idea.source);
					$('#editOtherSource').hide();
					$('#editOther').removeClass('required');
				}
				$('#editTags').val(idea.tags);
				$("input[name='editFlag']").each(function(){
					if($(this).attr('value')===idea.flag){
						$(this).attr('checked', true);
					} else {
						$(this).attr('checked', false);
					}
				});
				
				break;
			}
		}
	}
	var title = view.getI18NStringWithParams('ideaManager_editIdea_title', [view.utils.capitalize(this.ideaTerm)]);
	$('#editDialog').dialog({ title:title, modal:true, resizable:false, width:'470',
		buttons:[
		 	{
		 		text: view.getI18NString('ok'),
		 		click: function(){
		 			var answer = false;
					if($("#editForm").validate().form()){
						if(context.version > 1){
							if($('#editText').val() !== text){
								/*
								 * if the idea text has changed, check if the idea is being used
								 * in an explanation builder step, if it is, we will display
								 * a confirmation popup that asks the students if they're sure
								 * they want to edit the idea. if the idea is not being used
								 * in an eb step it will return true by default.
								 */
								var answer = basket.checkIfIdeaUsed(id);
							} else {
								answer = true;
							}
							var idea = null;
							
							if(answer) {
								var attributes = context.getIdeaAttributes('edit');
								idea = context.editV2(id,$('#editText').val(),attributes,$clicked);
								$(this).dialog("close");
								resetForm('editForm');						
							}
							
							if(idea !== null) {
								var workgroupId = idea.workgroupId,
									ideaId = idea.id;
								
								//save the idea basket back to the server
								context.save('editPrivateIdea', workgroupId, ideaId);
							}
						} else {
							var idea = null;
							
							if($('#editSource').val() === 'empty'){
								var ideaTerm = this.ideaTerm;
								
								if(ideaTerm === null || ideaTerm === '') {
									ideaTerm = 'idea';
								}
								
								alert('Please select a source for your ' + ideaTerm + '.');
							} else {
								if($('#editText').val() !== text){
									/*
									 * if the idea text has changed, check if the idea is being used
									 * in an explanation builder step, if it is, we will display
									 * a confirmation popup that asks the students if they're sure
									 * they want to edit the idea. if the idea is not being used
									 * in an eb step it will return true by default.
									 */
									var answer = basket.checkIfIdeaUsed(id);
								} else {
									answer = true;
								}
								
								if(answer) {
									var source = $('#editSource').val();
									if(source === 'Other'){
										source = 'Other: ' + $('#editOther').val();
									}
									idea = basket.edit(id,$('#editText').val(),source,$('#editTags').val(),$("input[name='editFlag']:checked").val(),$clicked);
									$(this).dialog("close");
									resetForm('editForm');						
								}
							}
							
							if(idea !== null) {
								var workgroupId = idea.workgroupId,
									ideaId = idea.id;
								
								//save the idea basket back to the server
								context.save('editPrivateIdea', workgroupId, ideaId);
							}
						}
					}
		 		}
		 	},
		 	{
		 		text: view.getI18NString('cancel'),
		 		click: function(){
		 			$(this).dialog("close");
					resetForm('editForm');
		 		}
		 	}
		],
		open: function(event, ui){
			$.validator.addMethod('require-one', function (value) {
		          return $('.require-one:checked').size() > 0; }, view.getI18NString('ideaManager_addIdea_required'));
			var checkboxes = $('#editForm .require-one');
			var checkbox_names = $.map(checkboxes, function(e,i) { return $(e).attr("name"); }).join(" ");

			$('#editForm').validate({
				groups: { checks: checkbox_names },
				errorPlacement: function(error, element) {
		             if (element.attr("type") === "checkbox" || element.attr('type') === 'radio'){
		            	 error.insertAfter(element.parent().children(':last'));
		             } else {
		            	 error.insertAfter(element);
		             }
				},
				ignore: '.inactive'
			});
		}
	});
};

/**
 * Get the array of attributes specified in the add or edit idea form
 * @param mode String identifying which form we're in ('add' or 'edit' are the allowed values)
 * @returns attributes Array of attributes for the idea
 */
IdeaBasket.prototype.getIdeaAttributes = function(mode){
	var attributes = [], form;
	if(mode==='edit'){
		form = $('#editForm');
	} else if (mode==='add'){
		form = $('#ideaForm');
	} else {
		return attributes;
	}
	$('.attribute',form).each(function(){
		var attribute = {};
		var attrId = $(this).attr('id').replace(mode + '_attribute_','');
		var type = '';
		if($(this).hasClass('label')){
			type = 'label';
		} else if($(this).hasClass('source')){
			type = 'source';
		} else if($(this).hasClass('icon')){
			type = 'icon';
			attribute.value = $('[name=' + mode + '_' + type + '_' + attrId + ']:checked').val();
		} if($(this).hasClass('tags')){
			type = 'tags';
			var tags = [];
			$('[name=' + mode + '_' + type + '_' + attrId + ']:checked').each(function(){
				tags.push($(this).val());
			});
			attribute.value = tags;
		}
		if(type==='label' || type==='source'){
			if($('#' + mode + '_' + type + '_' + attrId).val() === 'Other'){
				attribute.value = 'Other: ' + $('input[name="' + mode + '_other_' + attrId + '"]').val();
			} else {
				attribute.value = $('#' + mode + '_' + type + '_' + attrId).val();
			} 
		}
		attribute.id = attrId;
		attribute.type = type;
		attributes.push(attribute);
	});
	return attributes;
};

/**
 * Check if the idea is being used in an explanation builder step,
 * if it is, we will display a confirmation popup that asks the
 * student if they're sure they want to edit the idea. if the
 * idea is not being used in an eb step it will return true
 * by default.
 * @param id the id of the idea
 * @param view Object representing the VLE view (optional)
 * @return whether the student confirmed that they still want
 * to edit the idea. if the idea is not being used in an
 * explanation builder step, we will not display the popup
 * and will just return true
 */
IdeaBasket.prototype.checkIfIdeaUsed = function(id) {
	var idea = basket.getIdeaById(id);
	var stepsUsedIn = idea.stepsUsedIn;
	
	var answer = true;
	
	//check if this student used this idea in any steps 
	if(stepsUsedIn && stepsUsedIn.length > 0) {
		//the student has used this idea in a step
		var stepsUsed = '';
		
		//loop through all the steps the student has used this idea in
		for(var x=0; x<stepsUsedIn.length; x++) {
			//get the node id
			var nodeId = stepsUsedIn[x];
			
			var view = null;
				
			if(!parent.frames['ideaBasketIfrm']) {
				/*
				 * get the view from this object. this case is used in idea basket 
				 * steps and explanation builder steps.
				 */
				view = this.view;
			} else {
				/*
				 * get the view from the frame. this case is used in the global
				 * idea basket popup.
				 */
				view = parent.frames['ideaBasketIfrm'].thisView;
			}
			
			//get the node
			var node = view.getProject().getNodeById(nodeId);
			
			if(node !== null) {
				//get the node position
				var vlePosition = view.getProject().getVLEPositionById(nodeId);
				
				//get the node title
				var title = node.title;
				
				//add the step to the message
				stepsUsed += vlePosition + ": " + title + "\n";
			}
		}
		
		var message = view.getI18NStringWithParams('ideaManager_editIdea_changeConfirm', [this.ideaTerm, stepsUsedIn, this.ideaTerm]);
		/*
		 * display the message to the student that notifies them 
		 * that they will also be changing the idea text in the
		 * steps that they have used the idea in
		 */
		answer = confirm(message);
	}
	
	return answer;
};

/**
 * Delete an idea by putting it in the trash
 * @param index
 * @param $tr
 */
IdeaBasket.prototype.remove = function(index,$tr) {
	var editedIdea = null;
	this.setBasketChanged(true);
	
	if($tr){
		$tr.remove();
	}
	for(var i=0; i<this.ideas.length; i++){
		if(this.ideas[i].id === parseInt(index, 10)){
			//this.deleted.push(this.ideas[i]);
			this.deleted.splice(0,0,this.ideas[i]);
			var idea = this.ideas[i];
			
			//get the current time
			var newDate = new Date();
			var time = newDate.getTime();
			
			//update the timeLastEdited
			idea.timeLastEdited = time;
			
			//var ideaId = idea.id;
			this.ideas.splice(i,1);
			this.addRow(1,idea);

			if(this.isPublicIdeaBasketEnabled() && idea.wasCopiedFromPublic) {
				/*
				 * the student is removing an idea they copied from the public
				 * basket so we will uncopy it from the public idea which means
				 * we will remove this student's workgroup id from the 
				 * workgroupIdsThatHaveCopied array.
				 */
				this.view.uncopyPublicIdea(this, idea.id);
			} else if(this.isPublicIdeaBasketEnabled() && idea.isPublishedToPublic) {
				/*
				 * should deleting a private idea that has been published to public
				 * also delete the public idea?
				 */ 
			}
			
			editedIdea = idea;
			
			break;
		}
	}
	this.updateToolbarCount(true);
	
	var workgroupId = null;
	var ideaId = null;
	
	if(editedIdea !== null) {
		workgroupId = editedIdea.workgroupId;
		ideaId = editedIdea.id;
	}
	
	//save the idea basket to the server
	this.save('deletePrivateIdea', workgroupId, ideaId);
};

/**
 * Take an idea out of the trash
 * @param index
 * @param $tr
 */
IdeaBasket.prototype.putBack = function(index,$tr) {
	var editedIdea = null;
	this.setBasketChanged(true);
	
	if($tr){
		$tr.remove();
	}
	for(var i=0; i<this.deleted.length; i++){
		if(this.deleted[i].id === parseInt(index, 10)){
			this.ideas.push(this.deleted[i]);
			//this.ideas.splice(0,0,this.deleted[i]);
			var idea = this.deleted[i];
			
			//get the current time
			var newDate = new Date();
			var time = newDate.getTime();
			
			//update the timeLastEdited
			idea.timeLastEdited = time;
			
			//var ideaId = idea.id;
			this.deleted.splice(i,1);
			
			if(this.isPublicIdeaBasketEnabled() && idea.wasCopiedFromPublic) {
				/*
				 * idea was copied from the public basket so we will need
				 * to add this workgroup id back into the workgroupIdsThatHaveCopied
				 * array for that public idea
				 */
				var publishers = idea.publishers;
				if(publishers !== null && publishers.length > 0) {
					//get the last publisher
					var publisher = publishers[publishers.length - 1];
					
					//get the workgroup id and idea id of the idea
					var workgroupId = publisher.workgroupId;
					var ideaId = publisher.ideaId;
					
					/*
					 * add this workgroup id to the workgroupIdsThatHaveCopied array
					 * in the public idea
					 */
					this.view.addWorkgroupToWorkgroupIdsThatHaveCopied(this, workgroupId, ideaId);					
				}
			}
			
			this.addRow(0,idea);

			editedIdea = idea;
			
			break;
		}
	}
	this.updateToolbarCount(true);
	
	var workgroupId = null;
	var ideaId = null;
	
	if(editedIdea !== null) {
		workgroupId = editedIdea.workgroupId;
		ideaId = editedIdea.id;
	}
	
	//save the idea basket back to the server
	this.save('restorePrivateIdea', workgroupId, ideaId);
};

/**
 * Determine whether the student has changed any values in the idea
 * @param idea the previous state of the idea
 * @param text the new text
 * @param source the new source
 * @param tags the new tags
 * @param flag the new flag
 * @return whether the student has made any changes to the idea
 */
IdeaBasket.prototype.isIdeaChanged = function(idea, text, source, tags, flag) {
	var ideaChanged = true;
	
	//compare all the fields
	if(idea.text === text && idea.source === source && idea.tags === tags && idea.flag === flag) {
		ideaChanged = false;
	}
	
	return ideaChanged;
};

/**
 * Determine whether the student has changed any values in the idea
 * @param idea the previous state of the idea
 * @param text the new text
 * @param attributes the new attributes
 * @return whether the student has made any changes to the idea
 */
IdeaBasket.prototype.isIdeaChangedV2 = function(idea, text, attributes) {
	var ideaChanged = true;
	var attributesChanged = false;
	
	//compare all the attributes
	if(attributes.length !== idea.attributes.length){
		attributesChanged = true;
	} else {
		var ids = [];
		//get all the attribute ids in this idea
		$.each(idea.attributes, function(index,value){
			ids.push(value.id);
		});
		
		//loop through all the basket attributes available for an idea
		$.each(attributes,function(index,attr){
			if($.inArray(attr.id,ids) === -1){
				//this basket attribute id is not in the attribute ids for the idea
				attributesChanged = true;
				return false;
			} else {
				//loop through all the attributes in the idea
				for(var i=0;i<idea.attributes.length;i++){
					var ideaAttribute = idea.attributes[i];
					
					if(attr.id===ideaAttribute.id){
						if(attr.type !== ideaAttribute.type){
							attributesChanged = true;
						} else {
							if(attr.type==='tags'){
								if(attr.value.sort().toString() !== ideaAttribute.value.sort().toString()){
									attributesChanged = true;
									break;
								}
							} else {
								//compare the value chosen in the UI with the previous value in the idea 
								if(attr.value !== ideaAttribute.value){
									attributesChanged = true;
									break;
								}
							}
						}
					}
				}
			}
		});
	}
	
	var sharingStatusChanged = false;
	
	//get the value of the sharing status from the edit idea dialog
	var sharingStatus = $('#sharingStatus').html();

	//if sharing status is null it means public basket is not enabled
	if(sharingStatus !== null) {
		//get whether the idea was previously public
		var isPublishedToPublic = idea.isPublishedToPublic;
		
		//check if the sharing status is 'Public'
		var sharingStatusIsPublic = sharingStatus == 'Public';
		
		if(isPublishedToPublic !== sharingStatusIsPublic) {
			//the sharing status has changed
			sharingStatusChanged = true;
		}
	}
	
	//compare text
	if(idea.text === text && !attributesChanged && !sharingStatusChanged) {
		ideaChanged = false;
	}
	
	return ideaChanged;
};

/**
 * Edit an idea
 * @param index
 * @param text
 * @param source
 * @param tags
 * @param flag
 * @param $tr
 * @return the edited idea or null of no idea was edited
 */
IdeaBasket.prototype.edit = function(index,text,source,tags,flag,$tr) {
	var context = this,
		editedIdea = null,
		view = this.view;
	
	for(var i=0; i<this.ideas.length; i++){
		if(this.ideas[i].id === parseInt(index, 10)){
			var idea = this.ideas[i];
			
			/*
			 * check if any of the fields in the idea have changed,
			 * if they have not changed we do not need to do anything
			 */
			if(this.isIdeaChanged(idea, text, source, tags, flag)) {
				//the idea has changed
				this.setBasketChanged(true);
				
				idea.text = text;
				idea.source = source;
				idea.tags = tags;
				idea.flag = flag;
				var linkText = idea.text +	'<span class="editLink" title="' + view.getI18NStringWithParams('ideaBasket_editLinkTitle', [this.ideaTerm]) + '">' + view.getI18NString('ideaBasket_editLinkText') + '</span>';
				
				//get the current time
				var newDate = new Date();
				var time = newDate.getTime();
				
				idea.timeLastEdited = time;
				
				if($tr){
					var deleteLinkTitle = view.getI18NStringWithParams('ideaBasket_deleteLinkTitle', [view.utils.capitalize(this.ideaTerm)])
					$tr.html('<td><div class="ideaText">' + linkText + '</div></td><td>' + idea.source + '</td>' +
							'<td><div class="ideaTags">' + idea.tags + '</div></td>' + '<td style="text-align:center;"><span title="' + idea.flag + '" class="' + idea.flag + '"></span></td>'+
					'<td style="text-align:center;"><span class="delete" title="' + deleteLinkTitle + '"></span></td>');

					$tr.effect("pulsate", { times:1 }, 500);
				}

				var currTable = 'idea';
				var link = 'delete';
				var $newTr = $('#' + currTable + idea.id);
				var $newLink = $('#' + currTable + idea.id + ' span.' + link);
				var $editLink = $('#' + currTable + idea.id + ' span.editLink');
				
				// re-bind edit link click and row double click to open edit dialog
				$editLink.click(function(){
					var $clicked = $newTr;
					var id = $newTr.attr('id');
					id = id.replace('idea','');
					context.openEditDialog(context,id,$clicked);
				});
				
				// re-bind delete link click
				$newLink.on('click', function(){
					var $clicked = $(this),
						title = view.getI18NString('ideaManager_deleteIdea_title');
					$('#deleteDialog').dialog({ title:title, modal:true, resizable:false, width:'400',
						buttons:[
						 	{
						 		text: view.getI18NString('ok'),
						 		click: function(){
						 			var index = $clicked.parent().parent().attr('id');
									index = index.replace('idea','');
									var $tr = $clicked.parent().parent();
									basket.remove(index,$tr);
									$(this).dialog("close");
						 		}
						 	},
						 	{
						 		text: view.getI18NString('cancel'),
						 		click: function(){
						 			$(this).dialog("close");
						 		}
						 	}
						]
					});
					/*if(confirm("Are you sure you want to delete this idea?\n\n(You can always retrieve it from the trash later on if you change your mind.)")){
						var index = $(this).parent().parent().attr('id');
						index = index.replace('idea','');
						var $tr = $(this).parent().parent();
						basket.remove(index,$tr);
					}*/
				});
				
				editedIdea = idea;
				break;
			}
		}
	}
	
	return editedIdea;
};

/**
 * Edit an idea
 * @param index
 * @param text
 * @param attributes
 * @param $tr
 * @return the idea that was edited or null of no idea was edited
 */
IdeaBasket.prototype.editV2 = function(index,text,attributes,$tr) {
	var context = this,
		view = this.view,
		editedIdea = null;
	
	for(var i=0; i<this.ideas.length; i++){
		if(this.ideas[i].id === parseInt(index, 10)){
			var idea = this.ideas[i];
			
			/*
			 * check if any of the fields in the idea have changed,
			 * if they have not changed we do not need to do anything
			 */
			if(this.isIdeaChangedV2(idea, text, attributes)) {
				//the idea has changed
				this.setBasketChanged(true);
				
				idea.text = text;
				idea.attributes = attributes;
				var linkText = idea.text +	'<span class="editLink" title="' + view.getI18NStringWithParams('ideaBasket_editLinkTitle', [this.view.utils.capitalize(this.ideaTerm)]) + '">' + view.getI18NString('ideaBasket_editLinkText') + '</span>';
				var link = 'delete';
				
				//get the current time
				var newDate = new Date();
				var time = newDate.getTime();
				
				idea.timeLastEdited = time;
				
				if($tr){
					var imAttributes = this.settings.ideaAttributes;
					$tr.html('');
					$tr.append('<td><div class="ideaText">' + linkText + '</div></td>');
					for(var i=0;i<imAttributes.length;i++){
						var attrId = imAttributes[i].id;
						var type = imAttributes[i].type;
						var newTD = $(document.createElement('td'));
						for(var a=0;a<idea.attributes.length;a++){
							if(idea.attributes[a].id === attrId && idea.attributes[a].type === type){
								if(type === 'label' || type === 'source'){
									newTD.append(idea.attributes[a].value); 
								} else if (type === 'icon'){
									newTD.append('<span title="' + idea.attributes[a].value +	'" class="' + idea.attributes[a].value + '"></span>');
								} else if (type === 'tags'){
									var tagsHtml = '';
									for(var x=0;x<idea.attributes[a].value.length;x++){
										tagsHtml += '<span class="tag">' + idea.attributes[a].value[x] + '</span>';
									}
									newTD.append(tagsHtml);
								}
							}
						}
						$tr.append(newTD);
					}
					$tr.append('<td><span class="' + link + '" title="' + link + ' ' + this.ideaTerm + '"></span></td>');
					$tr.effect("pulsate", { times:1 }, 500);
				}

				var currTable = 'idea';
				var $newTr = $('#' + currTable + idea.id);
				var $newLink = $('#' + currTable + idea.id + ' span.' + link);
				var $editLink = $('#' + currTable + idea.id + ' span.editLink');
				
				// re-bind edit link click and row double click to open edit dialog
				$editLink.click(function(){
					var $clicked = $newTr;
					var id = $newTr.attr('id');
					id = id.replace('idea','');
					context.openEditDialog(context,id,$clicked);
				});
				
				// re-bind delete link click
				$newLink.click(function(){
					var $clicked = $(this);
					$('#deleteDialog').dialog({ title:view.getI18NString('ideaManager_deleteIdea_title'), modal:true, resizable:false, width:'400',
						buttons:[
						 	{
						 		text: view.getI18NString('ok'),
						 		click: function(){
						 			var index = $clicked.parent().parent().attr('id');
									index = index.replace('idea','');
									var $tr = $clicked.parent().parent();
									basket.remove(index,$tr);
									$(this).dialog("close");
						 		}
						 	},
						 	{
						 		text: view.getI18NString('cancel'),
						 		click: function(){
						 			$(this).dialog("close");
						 		}
						 	}
						]
					});
					/*if(confirm("Are you sure you want to delete this idea?\n\n(You can always retrieve it from the trash later on if you change your mind.)")){
						var index = $(this).parent().parent().attr('id');
						index = index.replace('idea','');
						var $tr = $(this).parent().parent();
						basket.remove(index,$tr);
					}*/
				});
				
				//get whether the idea was previously public
				var isPublishedToPublic = idea.isPublishedToPublic;
				
				//get the value of the sharing status from the edit idea dialog
				var sharingStatus = $('#sharingStatus').html();
				
				//check if the sharing status is 'Public'
				var sharingStatusIsPublic = sharingStatus == 'Public';
				
				if(isPublishedToPublic !== sharingStatusIsPublic) {
					//the sharing status has changed
					
					if(sharingStatusIsPublic) {
						//the idea has changed to public
						idea.isPublishedToPublic = true;
						this.view.makeIdeaPublic(this, idea.id);
					} else {
						//the idea has changed to private
						idea.isPublishedToPublic = false;
						this.view.makeIdeaPrivate(this, idea.id);
					}
				}
				
				editedIdea = idea;
			}

			break;
		}
	}
	
	return editedIdea;
};

/**
 * Update the order of the ideas in our ideas or deleted array
 * because the student has changed the order in the UI
 * @param target 0 for ideas array, 1 for deleted array
 */
IdeaBasket.prototype.updateOrder = function(target){
	var newOrder = [];
	var table = $('#basketIdeas tbody tr');
	var data = basket.ideas;
	var regex = 'idea';
	if(target===1){
		table = $('#basketDeleted tbody tr');
		data = basket.deleted;
		regex = 'deleted';
	}
	table.each(function(){
		var id = $(this).attr('id');
		id = id.replace(regex,'');
		id = parseInt(id, 10);
		for(var i=0; i<data.length; i++){
			if (data[i].id === id){
				//newOrder.push(data[i]);
				newOrder.splice(0,0,data[i]);
				break;
			}
		}
	});
	if(target===0){
		//check if the order has changed
		if(!this.isSameOrder(basket.ideas, newOrder)) {
			//the new order is not the same
			this.setBasketChanged(true);
		}
		
		basket.ideas = newOrder;
		$("#basketIdeas").trigger("applyWidgets");
	} else if (target===1){
		//check if the order has changed
		if(!this.isSameOrder(basket.deleted, newOrder)) {
			//the new order is not the same
			this.setBasketChanged(true);
		}
		
		basket.deleted = newOrder;
		$("#basketDeleted").trigger("applyWidgets");
	}
	
	//save the idea basket back to the server
	this.save('reOrderPrivateBasket');
};

/**
 * Update the Idea Basket Link on the toolbar to display current number of active ideas
 * @param target an integer (0 or 1) to specify source context (ideamanager.html or vle.html)
 * @param pulsate a boolean to specify whether toolbar link should blink on update (non-loading case)
 */
IdeaBasket.prototype.updateToolbarCount = function(pulsate){
	var total = this.ideas.length;
	if($("#viewIdeaBasketLink span").length){
		$("#viewIdeaBasketLink span#ideaCount").text('(' + total + ')');
		if(pulsate){
			$("#viewIdeaBasketLink span").effect("pulsate", { times:2 }, 500);
		}
	} else if($("#viewIdeaBasketLink span", parent.document.body).length){
		$("#viewIdeaBasketLink span#ideaCount", parent.document.body).text('(' + total + ')');
		if (pulsate){
			$("#viewIdeaBasketLink span", parent.document.body).effect("pulsate", { times:2 }, 500);
		}
	}
};

/**
 * Check if the order of the ideas in the two arrays are the same
 * @param order1 an array containing idea objects
 * @param order2 an array containing idea objects
 * @return whether the orders are same or not
 */
IdeaBasket.prototype.isSameOrder = function(order1, order2) {
	var sameOrder = true;
	
	var maxLength = Math.max(order1.length, order2.length);
	
	for(var x=0; x<maxLength; x++) {
		if(x >= order1.length) {
			sameOrder = false;
			break;
		} else if(x >= order2.length) {
			sameOrder = false;
			break;
		} else {
			var order1Idea = order1[x];
			var order2Idea = order2[x];
			
			if(order1Idea !== null && order2Idea !== null) {
				if(order1Idea.id !== order2Idea.id) {
					sameOrder = false;
					break;
				}
			}
		}
	}
	
	return sameOrder;
};

/**
 * Saves the idea basket back to the server
 * @param thisView the view
 * @param action the action that is being performed to trigger the save
 * e.g. addPrivateIdea, editPrivateIdea, deletePrivateIdea, restorePrivateIdea, reOrderPrivateBasket
 * @param workgroupId the signed in workgroup id
 * @param the idea id
 */
IdeaBasket.prototype.saveIdeaBasket = function(thisView, action, workgroupId, ideaId) {
	/*
	 * the ideaBasketIfrm is only used in the idea basket popup. if we are
	 * on an idea basket step, setting thisView is not required
	 */
	if(thisView === null && parent.window.frames['ideaBasketIfrm'] !== null) {
		//if thisView is not passed in to the function, try to retrieve it from the iframe
		thisView = parent.window.frames['ideaBasketIfrm'].thisView;
	}
	
	if(!action) {
		//set the action to this default value if none is passed in
		action = "saveIdeaBasket";
	}
	
	/*
	 * create a new copy of the idea basket without the fields from the idea basket step
	 * (such as this.node, this.view, this.content, this.states) because we don't want
	 * to save those values in the idea basket, plus it causes an infinite loop
	 * when $.stringify is called below.
	 * 
	 * we need to ask thisView to create the idea basket so that the idea basket is
	 * created in the context of the view and not in the context of this IdeaBasket
	 * object. this is to prevent an error that was occurring when adding a new idea
	 * complained that Idea was not defined. this was because of a weird context error
	 * and is resolved by creating the idea basket from the context of thisView.
	 */
	var newIdeaBasket = thisView.createIdeaBasket(this);
	
	//obtain the JSON string serialization of the basket
	var data = encodeURIComponent($.stringify(newIdeaBasket));
	
	var ideaBasketParams = {
			action:action,
			data:data,
			workgroupId:workgroupId,
			ideaId:ideaId
	};
	
	//check if we are in preview mode
	if(thisView.config.getConfigParam('mode') !== "portalpreview") {
		//we are not in preview mode so we will post the idea basket back to the server to be saved
		thisView.connectionManager.request('POST', 3, thisView.getConfig().getConfigParam('postIdeaBasketUrl'), ideaBasketParams, this.saveIdeaBasketCallback, {thisView:thisView, basket:this});
	}
	
	//set the updated ideaBasket back into the view
	thisView.ideaBasket = newIdeaBasket;
	
	/*
	 * call the function that will fire the 'ideaBasketChanged' event that will
	 * notify listeners to refresh their ideaBasket to get the latest changes
	 */
	if(this.view !== null) {
		//we are on an idea basket step
		thisView.ideaBasketChanged(this);		
	} else {
		//we are on the idea basket popup or explanation builder step
		thisView.ideaBasketChanged();
	}
};

/**
 * The callback after we try to save the idea basket back to the server
 * @param responseText if the basket successfully saved this will be set to
 * "Successfully saved Idea Basket"
 * or if the basket failed to save it will be set to the JSON for the
 * previous basket revision that successfully saved so that we can rollback
 * to that revision
 * @param responseXML
 * @param args
 */
IdeaBasket.prototype.saveIdeaBasketCallback = function(responseText, responseXML, args) {
	var thisView = args.thisView;
	var basket = args.basket;
	
	if(responseText === "Successfully saved Idea Basket") {
		//we saved the basket
		
		//set this value to false since changes have been saved to the server
		basket.setBasketChanged(false);
	} else {
		//we failed to save the basket
		
		//display a message to the student
		thisView.notificationManager.notify(thisView.getI18NStringWithParams('ideaBasket_saveError', [basket.basketTerm]), 3);
		
		//we received the previous basket revision to rollback to
		var ideaBasketJSONObj = $.parseJSON(responseText);
		
		//revert the IdeaBasket and set it into the view
		thisView.ideaBasket = new IdeaBasket(ideaBasketJSONObj);
		thisView.ideaBasket.updateToolbarCount();
	}
};

/**
 * Return whether the idea basket has changed or not
 * @return a boolean value whether the idea basket has changed or not
 */
IdeaBasket.prototype.isBasketChanged = function() {
	return basketChanged;
};

/**
 * Set whether the idea basket has changed or not
 * @param basketChangedBool boolean value whether the idea basket has changed or not 
 */
IdeaBasket.prototype.setBasketChanged = function(basketChangedBool) {
	basketChanged = basketChangedBool;
};

/**
 * Determine if the idea is in the active ideas array
 * @param ideaId the id of the idea
 * @return whether the idea is in the active ideas array
 */
IdeaBasket.prototype.isIdeaActive = function(ideaId) {
	var ideaActive = false;

	//loop through the ideas array
	for(var i=0;i<this.ideas.length;i++){
		if(this.ideas[i].id === parseInt(ideaId, 10)){
			ideaActive = true;
			break;
		}
	}

	return ideaActive;
};

/**
 * Determine if the idea is in the deleted array
 * @param ideaId the id of the idea
 * @return whether the idea is in the deleted array
 */
IdeaBasket.prototype.isIdeaInTrash = function(ideaId) {
	var ideaInTrash = false;

	//loop through the deleted array
	for(var i=0;i<this.deleted.length;i++){
		if(this.deleted[i].id === parseInt(ideaId, 10)){
			ideaInTrash = true;
			break;
		}
	}

	return ideaInTrash;
};

//Return a helper with preserved width of cells
var fixHelper = function(e, ui) {
	ui.children().each(function() {
		$(this).width($(this).width());
	});
	return ui;
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 * 
 * TODO: rename TEMPLATE
 * 
 * note: you do not have to use 'promptDiv' or 'studentResponseTextArea', they
 * are just provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at template.html).
 */
IdeaBasket.prototype.render = function() {
	documentReadyFunction(null, true, this);
	
	//display any prompts to the student
	$('#promptDiv').html(this.content.prompt);
	
	//load any previous responses the student submitted for this step
	var latestState = this.getLatestState();
};

/**
 * This function retrieves the latest student work
 * 
 * TODO: rename TEMPLATE
 * 
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
IdeaBasket.prototype.getLatestState = function() {
	var latestState = null;
	
	//check if the states array has any elements
	if(this.states !== null && this.states.length > 0) {
		//get the last state
		latestState = this.states[this.states.length - 1];
	}
	
	return latestState;
};

/**
 * This function retrieves the student work from the html ui, creates a state
 * object to represent the student work, and then saves the student work.
 * 
 * TODO: rename TEMPLATE
 * 
 * note: you do not have to use 'studentResponseTextArea', they are just 
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at template.html).
 */
IdeaBasket.prototype.save = function(action, workgroupId, ideaId) {
	if(this.isBasketChanged()) {
		this.saveIdeaBasket(this.view, action, workgroupId, ideaId);
	}
};

/**
 * Load the idea basket for an idea basket step
 * @param settings
 */
IdeaBasket.prototype.loadIdeaBasket = function() {
	var settings = null,
		view = this.view;
	var projectMeta = this.view.getProjectMetadata();
	if(projectMeta && projectMeta.hasOwnProperty('tools') && projectMeta.tools.hasOwnProperty('ideaManagerSettings')){
		settings = projectMeta.tools.ideaManagerSettings;
	}
	if(view.ideaBasket !== null) {
		//generate the JSON string for the idea basket
		var ideaBasketJSON = $.stringify(view.ideaBasket);
		
		//generate the JSON object for the idea basket
		var ideaBasketJSONObj = $.parseJSON(ideaBasketJSON);
		
		//load the idea basket into the step
		loadIdeaBasket(ideaBasketJSONObj, true, view, settings);		
	} else if(view.authoringMode) {
		/*
		 * we are in authoring preview step mode so we will just create
		 * a dummy idea basket
		 */
		
		//generate the JSON string for the dummy idea basket
		var ideaBasketJSON = '{"ideas":[],"deleted":[],"nextIdeaId":1,"id":-1,"runId":-1,"workgroupId":-1,"projectId":-1}';
		
		//generate the JSON object for the idea basket
		var ideaBasketJSONObj = $.parseJSON(ideaBasketJSON);
		
		//load the idea basket into the step
		loadIdeaBasket(ideaBasketJSONObj, true, view, settings);	
	} else {
		/*
		 * the vle failed to retrieve the idea basket so we will disable
		 * this idea basket step to prevent the student from overriding
		 * and losing their idea basket.
		 */
		
		//hide the basket UI
		$('#main').hide();
		
		//set the error message
		$('#errorMessageDialog').html(view.getI18NStringWithParams('ideaBasket_loadError', [this.basketTerm]));
		
		//display the error message div
		$('#errorMessageDialog').show();
	}
};

/**
 * Set the public idea basket
 * @param publicIdeaBasketJSONObj the public idea basket
 */
IdeaBasket.prototype.setPublicIdeaBasket = function(publicIdeaBasketJSONObj) {
	this.publicIdeaBasket = publicIdeaBasketJSONObj;
};

/**
 * Load the public idea basket into the UI
 */
IdeaBasket.prototype.loadPublicIdeaBasket = function() {
	//clear out the previous revision of the public idea basket
	$('#publicBasketIdeas tbody').html('');
	
	if(typeof this.publicIdeaBasket !== 'undefined' && this.publicIdeaBasket !== null) {
		//get the public idea basket
		var publicIdeaBasket = this.publicIdeaBasket;
		
		//get the public ideas
		var publicIdeas = publicIdeaBasket.ideas;
		
		if(publicIdeas !== null) {
			
			if(publicIdeas.length === 0) {
				//display the message that says the public idea basket is empty
				$('#publicIdeasEmpty').show();
			} else {
				//hide the message that says the public idea basket is empty
				$('#publicIdeasEmpty').hide();
			}
			
			//loop through all the public ideas
			for(var x=0; x<publicIdeas.length; x++) {
				//get a public idea
				var publicIdea = publicIdeas[x];
				
				//add the public idea row to the UI
				this.addPublicRow(publicIdea);
			}			
		}
	}
	
	//hide these elements since they are not used in the public idea basket
	$('#publicToggleDeleted').hide();
	$('#publicTrash').hide();
};

/**
 * Add a public idea row to the UI
 * @param publicIdea the public idea
 */
IdeaBasket.prototype.addPublicRow = function(publicIdea) {
	var currTable = 'publicIdea',
		table = $('#publicBasketIdeas tbody'),
		link = 'copy',
		title = '',
		linkText = publicIdea.text,
		view = this.view;
	
	if(this.version > 1){
		/*
		 * we are using the newer version of the ideas that can
		 * have authorable attributes
		 */
		
		var imAttributes = this.settings.ideaAttributes;
		html = $(document.createElement('tr')).attr('id',currTable + publicIdea.id).addClass('publicRow');
		html.append('<td><div class="ideaText">' + linkText + '</div></td>');
		
		var numberTimesCopied = 0;
		
		if(publicIdea.workgroupIdsThatHaveCopied !== null) {
			//get the number of times this public idea has been copied
			numberTimesCopied = publicIdea.workgroupIdsThatHaveCopied.length;
		}
		
		//add the column that displays the number of times the public idea has been copied
		html.append('<td><div class="ideaText" align="center">' + numberTimesCopied + '</div></td>');
		
		//add the attributes for the idea
		for(var i=0;i<imAttributes.length;i++){
			var attrId = imAttributes[i].id;
			var type = imAttributes[i].type;
			var newTD = $(document.createElement('td'));
			for(var a=0;a<publicIdea.attributes.length;a++){
				if(publicIdea.attributes[a].id === attrId && publicIdea.attributes[a].type === type){
					if(type === 'label' || type === 'source'){
						newTD.append(publicIdea.attributes[a].value); 
					} else if (type === 'icon'){
						newTD.append('<span title="' + publicIdea.attributes[a].value +	'" class="' + publicIdea.attributes[a].value + '"></span>');
					} else if (type === 'tags'){
						var tagsHtml = '';
						for(var x=0;x<publicIdea.attributes[a].value.length;x++){
							tagsHtml += '<span class="tag">' + publicIdea.attributes[a].value[x] + '</span>';
						}
						newTD.append(tagsHtml);
					}
				}
			}
			html.append(newTD);
		}
		
		//add the copy public idea button
		html.append('<td><input id="copyPublicIdeaButton_' + publicIdea.id + '" type="button" value="' + view.getI18NString('ideaBasket_public_copyLinkText') + '"></input></td>');
	} else {
		/*
		 * we are using the old version of the ideas that have
		 * preset attributes
		 */
		var tags = '';
		
		if(publicIdea.tags && publicIdea.tags !== 'undefined') {
			tags = publicIdea.tags;
		}
		html = '<tr id="' + currTable + publicIdea.id + '"><td><div class="ideaText">' + linkText +
			'</div></td><td>' + publicIdea.source + '</td>' +	'<td><div class="ideaTags">' + tags +
			'</div></td>' + '<td style="text-align:center;"><span title="' +publicIdea.flag +	'" class="' + publicIdea.flag + '"></span></td>'+
			'<td style="text-align:center;"><input id="copyPublicIdeaButton_' + publicIdea.id + '" type="button" value="' + view.getI18NString('ideaBasket_public_copyLinkText') + '"></input></td></tr>';
	}
	
	//add the public idea row to the public idea basket UI
	table.prepend(html);
	
	//get the copy public idea button for this idea
	var $copyPublicIdeaButton = $('#copyPublicIdeaButton_' + publicIdea.id);
	
	var workgroupId = publicIdea.workgroupId,
		ideaId = publicIdea.id,
		thisBasket = this,
		thisView = this.view;
	
	//set the onclick event for the copy public idea button for this idea
	$copyPublicIdeaButton.on('click', function(event) {
		
		/*
		 * check if the student is trying to copy their own idea.
		 * we do not allow students to copy their own idea so if
		 * they are, we will not change the button text to 'Copied'.
		 */
		if(thisBasket !== null && thisBasket.workgroupId !== workgroupId) {
			/*
			 * student is copying someone else's idea so we will 
			 * change the button text from 'Copy' to 'Copied'
			 */
			$(this).val(thisView.getI18NString('ideaBasket_public_copiedIdea'));			
		}
		
		//copy the public idea
		thisView.copyPublicIdea(thisBasket, workgroupId, ideaId);
	});
	
	//check if the student has previously copied this public idea
	if(basket.isPublicIdeaCopied(workgroupId, ideaId)) {
		/*
		 * the student has previously copied this public idea so we 
		 * will change the button from 'Copy' to 'Copied'
		 */
		$('#copyPublicIdeaButton_' + ideaId).val(thisView.getI18NString('ideaBasket_public_copiedIdea'));
	}
};

/**
 * Set the sharing status to public
 */
IdeaBasket.prototype.setSharingStatusPublic = function() {
	$('#sharingStatus').html(this.view.getI18NString('ideaBasket_public_publicLabel'));
};

/**
 * Set the sharing status to private
 */
IdeaBasket.prototype.setSharingStatusPrivate = function() {
	$('#sharingStatus').html(this.view.getI18NString('ideaBasket_public_privateLabel'));
};

/**
 * Check if the idea with the given workgroup id and idea id is in
 * our basket
 * @param ideaWorkgroupId the workgroup id that published the idea
 * @param ideaId the idea id of the published idea
 * @returns whether the idea already exists in the basket
 */
IdeaBasket.prototype.isPublicIdeaInPrivateBasket = function(ideaWorkgroupId, ideaId) {
	var result = false;
	
	/*
	 * loop through all the ideas and check the publishers to
	 * see if any of the ideas were copied from the given 
	 * workgroup id and idea id
	 */
	for(var x=0; x<this.ideas.length; x++) {
		//get an idea
		var idea = this.ideas[x];
		
		//get the publishers of this idea if any
		var publishers = idea.publishers;
		
		if(typeof publishers !== 'undefined' && publishers !== null && publishers.length > 0) {
			
			//get the last publisher
			var lastPublisher = publishers[publishers.length - 1];
			
			if(lastPublisher !== null) {
				//get the workgroup id and idea id
				var publisherWorkgroupId = lastPublisher.workgroupId;
				var publisherIdeaId = lastPublisher.ideaId;
				
				if(ideaWorkgroupId === publisherWorkgroupId && ideaId === publisherIdeaId) {
					/*
					 * we found the workgroup id and idea id which means we have this
					 * public idea in our idea basket already
					 */
					result = true;
					break;
				}
			}
		}
	}
	
	return result;
};

/**
 * Check if the public idea with the given workgroup id and idea id was
 * copied to our private basket
 * @param ideaWorkgroupId the workgroup id of the public idea
 * @param ideaId the idea id of the public idea
 * @returns whether the public idea was copied to our private basket
 */
IdeaBasket.prototype.isPublicIdeaCopied = function(ideaWorkgroupId, ideaId) {
	var result = false;
	
	var workgroupId = basket.workgroupId;
	
	/*
	 * check if the student workgroup id is the same as the public idea workgroup id.
	 * the student can't copy their own public idea so if they are the same,
	 * we do not need to check if the student copied this public idea.
	 */
	if(workgroupId !== ideaWorkgroupId) {
		/*
		 * loop through all the private ideas and check the publishers to
		 * see if any of the ideas were copied from the given 
		 * workgroup id and idea id
		 */
		for(var x=0; x<this.ideas.length; x++) {
			//get an idea
			var idea = this.ideas[x];
			
			//get the publishers of this idea if any
			var publishers = idea.publishers;
			
			if(publishers && publishers.length > 0) {
				
				//get the last publisher
				var lastPublisher = publishers[publishers.length - 1];
				
				if(lastPublisher !== null) {
					//get the workgroup id and idea id
					var publisherWorkgroupId = lastPublisher.workgroupId;
					var publisherIdeaId = lastPublisher.ideaId;
					
					if(ideaWorkgroupId === publisherWorkgroupId && ideaId === publisherIdeaId) {
						/*
						 * we found the workgroup id and idea id which means we have this
						 * public idea in our idea basket already
						 */
						result = true;
						break;
					}
				}
			}
		}
	}
	
	return result;
};

/**
 * Get the next idea id that we can use and increment the counter
 */
IdeaBasket.prototype.getNextIdeaIdAndIncrement = function() {
	var nextIdeaId = this.nextIdeaId;
	
	//increment the counter
	this.nextIdeaId++;
	
	return nextIdeaId;
};

/**
 * Display the public idea basket view
 */
IdeaBasket.prototype.displayPublicIdeaBasket = function() {
	//hide the private basket
	$('#main').hide();
	
	//show the public basket
	$('#publicMain').show();
	
	//change the title to public
	$('#basketTitle').html(this.publicBasketTerm);
};

/**
 * Check if the public idea basket is enabled
 * @returns whether the public idea basket is enabled
 */
IdeaBasket.prototype.isPublicIdeaBasketEnabled = function() {
	var result = false;
	
	if(this.version > 1 && this.view.getProjectMetadata().tools.isPublicIdeaManagerEnabled) {
		/*
		 * public idea basket is available if the idea versions are
		 * greater than 1 and the public idea manager is enabled
		 * in the project metadata
		 */
		result = true;
	}
	
	return result;
};

/**
 * Make the idea row in the UI display the fact that the idea
 * is public
 * @param ideaId the id of the idea
 */
IdeaBasket.prototype.makeIdeaRowPublic = function(ideaId) {
	var view = this.view;
	if(ideaId !== null && ideaId !== '') {
		//add the (Public) text to the row idea text
		var html = $('#ideaText' + ideaId).html();
		
		if(html.indexOf(view.getI18NString('ideaBasket_public_publicRowLabel')) === -1) {
			//the public text has not been added yet so we will add it
			html += ' ' + view.getI18NString('ideaBasket_public_publicRowLabel');
			$('#ideaText' + ideaId).html(html);
			
			var context = this;
			var currTable = 'idea';
			
			var $newTr = $('#' + currTable + ideaId);
			var $editLink = $('#' + currTable + ideaId + ' span.editLink');

			//rebind the edit link click action
			$editLink.click(function(){
				var $clicked = $newTr;
				var id = $newTr.attr('id');
				id = id.replace('idea','');
				context.openEditDialog(context,id,$clicked);
			});
		}
	}
};

/**
 * Make the idea row in the UI display the fact that the idea
 * is not public
 * @param ideaId the id of the idea
 * @param ideaId
 */
IdeaBasket.prototype.makeIdeaRowPrivate = function(ideaId) {
	if(ideaId !== null && ideaId !== '') {
		//remove the (Public) text from the row idea text
		var html = $('#ideaText' + ideaId).html();
		var regex = new RegExp(' ' + this.view.getI18NString('ideaBasket_public_publicRowLabel'));
		html = html.replace(regex, '');
		$('#ideaText' + ideaId).html(html);
		
		var context = this;
		var currTable = 'idea';
		
		var $newTr = $('#' + currTable + ideaId);
		var $editLink = $('#' + currTable + ideaId + ' span.editLink');
		
		//rebind the edit link click action
		$editLink.click(function(){
			var $clicked = $newTr;
			var id = $newTr.attr('id');
			id = id.replace('idea','');
			context.openEditDialog(context,id,$clicked);
		});
	}
};

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains three fields
 * enableStep
 * message
 * workToImport
 */
IdeaBasket.prototype.processTagMaps = function() {
	var enableStep = true;
	var message = '';
	var workToImport = [];
	
	var tagMaps = null;
	
	if(typeof this.node !== 'undefined' && this.node !== null) {
		//get the tag maps
		tagMaps = this.node.tagMaps;
	}
	
	//check if there are any tag maps
	if(typeof tagMaps !== 'undefined' && tagMaps !== null) {
		
		//loop through all the tag maps
		for(var x=0; x<tagMaps.length; x++) {
			
			//get a tag map
			var tagMapObject = tagMaps[x];
			
			if(tagMapObject !== null) {
				//get the variables for the tag map
				var tagName = tagMapObject.tagName;
				var functionName = tagMapObject.functionName;
				var functionArgs = tagMapObject.functionArgs;
				
				if(functionName === "showPreviousWork") {
					//show the previous work in the previousWorkDiv
					this.node.showPreviousWork($('#previousWorkDiv'), tagName, functionArgs);
				} else if(functionName === "checkCompleted") {
					//we will check that all the steps that are tagged have been completed
					
					//get the result of the check
					var result = this.node.checkCompleted(tagName, functionArgs);
					enableStep = enableStep && result.pass;
					
					if(message === '') {
						message += result.message;
					} else {
						//message is not an empty string so we will add a new line for formatting
						message += '<br>' + result.message;
					}
				}
			}
		}
	}
	
	if(message !== '') {
		//message is not an empty string so we will add a new line for formatting
		message += '<br>';
	}
	
	//put the variables in an object so we can return multiple variables
	var returnObject = {
		enableStep:enableStep,
		message:message,
		workToImport:workToImport
	};
	
	return returnObject;
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager !== 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/ideaBasket/basket.js');
}