/**
 * Creates an Portfolio instance
 * @param portfolioJSONString optional argument, if it is provided it will load
 * the data from the JSON into this object
 * @return an Portfolio instance
 */
function Portfolio(view, portfolioJSONString) {
	this.view = view;
	this.id;
	this.runId;
	this.workgroupId;
	this.metadata;
	this.items = [];
	this.deletedItems = [];
	this.version = 1;
	this.settings = null;

	/*
	 * portfolioJSONObj will be null in authoring preview step in which case
	 * we do not want to load anything
	 */
	if(portfolioJSONString) {
		var portfolioJSONObj = {};
		try {
			portfolioJSONObj = JSON.parse(portfolioJSONString);
			
			//set the values from the JSON object we received from the server

			this.id = portfolioJSONObj.id;
			this.runId = portfolioJSONObj.runId;
			this.workgroupId = portfolioJSONObj.workgroupId;
			this.metadata = portfolioJSONObj.metadata ? portfolioJSONObj.metadata : "";

			if(portfolioJSONObj.hasOwnProperty('items') && portfolioJSONObj.items !== null) {
				var portfolioItemsJSONArray = JSON.parse(portfolioJSONObj.items);
				for (var i=0; i< portfolioItemsJSONArray.length; i++) {
					var portfolioItemJSON = portfolioItemsJSONArray[i];
					this.items.push(new PortfolioItem(portfolioItemJSON));
				}
			}

			if(portfolioJSONObj.hasOwnProperty('deletedItems') && portfolioJSONObj.deletedItems !== null) {
				var portfolioDeletedItemsJSONArray = JSON.parse(portfolioJSONObj.deletedItems);
				for (var i=0; i< portfolioDeletedItemsJSONArray.length; i++) {
					var portfolioDeletedItemJSON = portfolioDeletedItemsJSONArray[i];
					this.deletedItems.push(new PortfolioItem(portfolioDeletedItemJSON));
				}
			}
		} catch(err) {
			// probably in regular preview mode, so don't load any portfolio data
		}
	}
};

/**
 * Returns Portfolio Item with the specified Id.
 */
Portfolio.prototype.getItemById = function(itemId) {
	for (var i=0; i<this.items.length; i++) {
		var item = this.items[i];
		if (item.id == itemId) {
			return item;
		}
	}
	for (var k=0; k<this.deletedItems.length; k++) {
		var deletedItem = this.deletedItems[k];
		if (deletedItem.id == itemId) {
			return deletedItem;
		}
	}
	return null;
};

/**
 * Returns the highest item id number
 */
Portfolio.prototype.getHighestItemId = function() {
	var highestItemIdSoFar = -1;
	for (var i=0; i<this.items.length; i++) {
		var item = this.items[i];
		if (item.id > highestItemIdSoFar) {
			highestItemIdSoFar = item.id;
		}
	}
	for (var k=0; k<this.deletedItems.length; k++) {
		var deletedItem = this.deletedItems[k];
		if (deletedItem.id > highestItemIdSoFar) {
			highestItemIdSoFar = deletedItem.id;
		}
	}
	return highestItemIdSoFar;
};

/**
 * Add PortfolioItem to the portfolio
 * @param PortfolioItem object to add
 */
Portfolio.prototype.addItem = function(portfolioItem) {
	this.items.push(portfolioItem);
};

/**
 * Add PortfolioItem of StudentUploadedAsset type to the portfolio
 * @param PortfolioItem object to add
 */
Portfolio.prototype.addStudentUploadedAssetItem = function(assetFilename, assetFileURL) {
	var portfolioItemArgs = {
		id: this.getHighestItemId()+1,
		itemType:"studentUploadedAsset",
		title: assetFilename,
		studentUploadedAssetURL : assetFileURL,
	};
	var portfolioItem = new PortfolioItem(portfolioItemArgs);
	this.addItem(portfolioItem);
	this.saveToServer(this.addItemSaveToServerCallback,{portfolio:this});
	this.view.displayPortfolio(portfolioItem.id);
};


Portfolio.prototype.saveToServerCallback = function(responseText, responseXML, args) {
	var portfolio = args.portfolio;
	// show some kind of feedback to user here
	//alert(portfolio.view.getI18NString("portfolio_save_success"));
};

Portfolio.prototype.saveToServer = function(callback,callbackArgs) {
	if(this.view.config.getConfigParam('mode') !== "portalpreview") {
		//we are not in preview mode so we will post the portfolio back to the server to be saved
		this.runId = this.view.getConfig().getConfigParam('runId');
		this.workgroupId = this.view.getUserAndClassInfo().getWorkgroupId();
		portfolioParams = {
				"action":"savePortfolio",
				"portfolio":JSON.stringify(this),
		};
		this.view.connectionManager.request('POST', 3, 
				this.view.getConfig().getConfigParam('postPortfolioUrl'), 
				portfolioParams, 
				callback, 
				callbackArgs);
	}
};

Portfolio.prototype.addItemSaveToServerCallback = function(responseText, responseXML, args) {
	var portfolio = args.portfolio;
	// show some kind of feedback to user here
};

/**
 * Hander for add new portfolio item event
 */
Portfolio.prototype.addItemEventHandler = function(event) {
	var view = event.data.view;
	var portfolioItem = new PortfolioItem(event.data);
	portfolioItem.id = view.portfolio.getHighestItemId()+1; // assign new item id
	view.portfolio.addItem(portfolioItem);
	view.portfolio.saveToServer(view.portfolio.addItemSaveToServerCallback,{portfolio:view.portfolio});
	view.displayPortfolio(portfolioItem.id);
};

Portfolio.prototype.toJSON = function() {
	return {
		"id":this.id,
		"workgroupId":this.workgroupId,
		"runId":this.runId,
		"metadata":this.metadata,
		"items":this.items,
		"deletedItems":this.deletedItems,
		"isPublic":this.isPublic,
		"isSubmitted":this.isSubmitted,
		"tags":this.tags
	};
};

/**
 * PortfolioItem is an item entry (both current and deleted) in the portfolio.
 * 
 * Possible itemTypes: stepWork, ideabasket, studentUploadedAssets, outside resource
 * If itemType is nodeVisit (stepWork), there are three levels to specify which work to store:
 * 1. just nodeId: always get the latest work for the node
 * 2. nodeId+nodeVisitId: get the specific stepWork for the node
 * 3. nodeId+nodeVisitId+nodeStateId: get the specific nodeState within the specified nodeVisit (stepwork) for the node.
 *
 * If itemType is studentUploadedAssets, here's the relevant data:
 *  studentUploadedAssetURL: absolute url to student assets directory
 *  title: asset file name
 */
function PortfolioItem(object) {
	this.id = object.id;
	this.title = object.title;
	this.itemType = object.itemType;
	this.nodeId = object.nodeId;
	this.nodeVisitId = object.nodeVisitId;
	this.studentAnnotation = object.studentAnnotation;
	this.studentUploadedAssetURL = object.studentUploadedAssetURL;
	if (object.timeCreated) {
		this.timeCreated = object.timeCreated;
	} else {
		this.timeCreated = Date.parse(new Date());
	}
};

PortfolioItem.prototype.toJSON = function() {
	return {
		"id":this.id,
		"title":this.title,
		"itemType":this.itemType,
		"nodeId":this.nodeId,
		"nodeVisitId":this.nodeVisitId,
		"studentAnnotation":this.studentAnnotation,
		"studentUploadedAssetURL":this.studentUploadedAssetURL,
		"timeCreated":this.timeCreated
	};
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager !== 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/model/portfolio.js');
}