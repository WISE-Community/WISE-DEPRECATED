/**
 * Creates an Portfolio instance
 * @param portfolioJSONObj optional argument, if it is provided it will load
 * the data from the JSON into this object
 * @param createForStep boolean value whether we are creating the portfolio  
 * for a portfolio step
 * @param node the node we are creating the portfolio for (if createForStep is true)
 * @param settings Portfolio settings object, which specifies version, portfolio attribute fields, terminology
 * @return an Portfolio instance
 */
function Portfolio(view, portfolioJSONObj, createForStep, node, settings) {
	this.view = view;
	this.id;
	this.runId;
	this.workgroupId;
	this.items = [];
	this.deletedItems = [];
	this.version = 1;
	this.settings = null;

	// set Portfolio settings and version
	if(settings){
		this.settings = settings;
		if(settings.hasOwnProperty('version')){
			this.version = parseInt(settings.version, 10);
		}
	}

	if(createForStep) {
		//we are adding a portfolio for a portfolio step

		//set the values for the portfolio step
		this.node = node;
		this.view = node.view;
		this.content = node.getContent().getContentJSON();

		if(node.studentWork !== null) {
			this.states = node.studentWork; 
		} else {
			this.states = [];  
		}
	}

	if(!portfolioJSONObj) {
		//JSON is not provided so we will just initialize the UI
		this.init(this);
	} else {
		/*
		 * JSON is provided so we will populate the data and not initialize the UI.
		 */
		this.load(portfolioJSONObj, false, null);
	}
};

function PortfolioItem(object) {
	this.title = object.title;
	this.itemType = object.itemType;
	this.nodeId = object.nodeId;
};

/**
 * Initialize the Portfolio turning on tablesorter to allow sorting
 * by columns and turning on sortable to allow students to drag and drop
 * rows to manually sort the table
 * @param context
 */
Portfolio.prototype.init = function(context) {
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
};


/**
 * Load the portfolio items into the tables in the interface
 * @param potfolioJSONObj the JSON object to populate the data from
 * @param generateUI boolean value whether to generate the UI
 * @param view VLE View instance object
 * @param publicPortfolioJSONObj (optional) the public portfolio JSON object
 */
Portfolio.prototype.load = function(portfolioJSONObj, generateUI, settings, view, publicPortfolioJSONObj) {
	console.log('portfolio.js, load');
	if(settings){
		this.settings = settings;
		this.version = parseInt(settings.version, 10);
	}

	if(view){
		this.view = view;
	}

	//set the public portfolio if it was provided
	if(publicPortfolioJSONObj) {
		//this.setPublicPortfolio(publicPortfolioJSONObj);
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
	 * portfolioJSONObj will be null in authoring preview step in which case
	 * we do not want to load anything
	 */
	if(portfolioJSONObj) {
		//set the values from the JSON object we received from the server

		this.id = portfolioJSONObj.id;
		this.runId = portfolioJSONObj.runId;
		this.workgroupId = portfolioJSONObj.workgroupId;

		if(portfolioJSONObj.hasOwnProperty('items') && portfolioJSONObj.items !== null) {
			this.items = JSON.parse(portfolioJSONObj.items);
		}

		if(portfolioJSONObj.hasOwnProperty('deletedItems') && portfolioJSONObj.deletedItems !== null) {
			this.deletedItems = JSON.parse(portfolioJSONObj.deletedItems);		
		}
	}

	return this;
};

/**
 * Add PortfolioItem to the portfolio and save to server
 * 
 */
Portfolio.prototype.addItem = function(portfolioItem) {
	this.items.push(portfolioItem);

	if(this.view.config.getConfigParam('mode') !== "portalpreview") {
		//we are not in preview mode so we will post the idea basket back to the server to be saved
		portfolioParams = {
			"action":"savePortfolio",
			"items":JSON.stringify(this.items)
		};
		this.view.connectionManager.request('POST', 3, 
				this.view.getConfig().getConfigParam('postPortfolioUrl'), 
				portfolioParams, 
				this.addItemCallback, 
				{portfolio:this});
	}
};

/**
 * Add PortfolioItem to the portfolio and save to server
 * 
 */
Portfolio.prototype.addItemCallback = function(responseText, responseXML, args) {
	var portfolio = args.portfolio;
	alert(portfolio.view.getI18NString("add_to_portfolio_success"));
};

/**
 * Hander for add item event
 */
Portfolio.prototype.addItemEventHandler = function(event) {
	var view = event.data.view;
	var item = new PortfolioItem(event.data);
	view.portfolio.addItem(item);
};

/**
 * Render the portfolio in the specified dom id
 */
Portfolio.prototype.render = function(domId) {
	console.log('Portfolio.prototype.render, domId:'+domId);

	var workgroupId = this.view.getUserAndClassInfo().getWorkgroupId();

	//check if the portfolioDiv exists
	if($("#"+domId).size()==0){
		//it does not exist so we will create it
		$('#w4_vle').append('<div id="'+domId+'"><div id="portfolioItems"></div></div>');
	}

	var title = this.view.getI18NString("portfolio");
	if('portfolioSettings' in this.view.getProjectMetadata().tools){
		var portfolioSettings = this.view.getProjectMetadata().tools.portfolioSettings;
		if('portfolioTerm' in portfolioSettings && this.view.utils.isNonWSString(portfolioSettings.portfolioTerm)){
			title = portfolioSettings.portfolioTerm;
		}
	}

	$("#"+domId).dialog({autoOpen:false,closeText:'',resizable:true,modal:true,show:{effect:"fade",duration:200},hide:{effect:"fade",duration:200},title:title,open:this.view.portfolioDivOpen,close:this.view.portfolioDivClose,
		dragStart: function(event, ui) {
			$('#portfolioOverlay').show();
		},
		dragStop: function(event, ui) {
			$('#portfolioOverlay').hide();
		},
		resizeStart: function(event, ui) {
			$('#portfolioOverlay').show();
		},
		resizeStop: function(event, ui) {
			$('#portfolioOverlay').hide();
		}
	});

	// close all dialogs
	view.utils.closeDialogs();

	//open the portfolio dialog
    var docHeight = $(document).height()-25;
	var docWidth = $(document).width()-25;
	$("#"+domId).dialog({height:docHeight,width:docWidth});
    $("#"+domId).dialog('open');
    $("#"+domId).scrollTop(0);

	// clear existing portfolio items
	$("#portfolioItems").html("");

	// display portfolio items
	for (var i=0; i<this.items.length;i++) {
		var portfolioItem = this.items[i];
		var nodeId = portfolioItem.nodeId;
		var node = this.view.getProject().getNodeById(nodeId);
		var nodeShowAllWorkHtml = node.getShowAllWorkHtml(this.view);

		$("#portfolioItems").append("<div>"+portfolioItem.itemType+"</div>")
		.append("<div>"+portfolioItem.title+"</div>")
		.append("<div>"+portfolioItem.nodeId+"</div>")
		.append("<div>"+nodeShowAllWorkHtml+"</div>")
		.append("<div>"+portfolioItem.annotation+"</div>");
		$("#portfolioItems").append("<br/>");

		//only perform this for steps that have a grading view
		if(node.hasGradingView()) {
			//get the node id
			var nodeId = node.id;

			//get the latest node visit that contains student work for this step
			var nodeVisit = this.view.getState().getLatestNodeVisitByNodeId(nodeId);

			//check if the student has any work for this step
			if(nodeVisit != null) {
				//get the div to display the work in
				var studentWorkDiv = $("#latestWork_" + nodeVisit.id);

				//render the work into the div to display it
				node.renderGradingView(studentWorkDiv, nodeVisit, "", workgroupId);

				if($("#new_latestWork_" + nodeVisit.id).length != 0) {
					/*
					 * render the work into the new feedback div if it exists. the
					 * new feedback div exists when the teacher has given a new
					 * score or comment and we need to show the work and feedback
					 * for that step at the the top of the show all work
					 */
					node.renderGradingView($("#new_latestWork_" + nodeVisit.id), nodeVisit, "", workgroupId);
				}
			}
		}
	}
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager !== 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/portfolio/portfolio.js');
}