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
function Portfolio(portfolioJSONObj, createForStep, node, settings) {
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

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager !== 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/portfolio/portfolio.js');
}