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
	this.items = [];
	this.deletedItems = [];
	this.version = 1;
	this.settings = null;

	/*
	 * portfolioJSONObj will be null in authoring preview step in which case
	 * we do not want to load anything
	 */
	if(portfolioJSONString) {
		var portfolioDataJSONString = JSON.parse(portfolioJSONString).data;
		var portfolioJSONObj = JSON.parse(portfolioDataJSONString);
		
		//set the values from the JSON object we received from the server

		this.id = portfolioJSONObj.id;
		this.runId = portfolioJSONObj.runId;
		this.workgroupId = portfolioJSONObj.workgroupId;

		if(portfolioJSONObj.hasOwnProperty('items') && portfolioJSONObj.items !== null) {
			var portfolioItemsJSONArray = portfolioJSONObj.items;
			for (var i=0; i< portfolioItemsJSONArray.length; i++) {
				var portfolioItemJSON = portfolioItemsJSONArray[i];
				this.items.push(new PortfolioItem(this.view, portfolioItemJSON));
			}
		}

		if(portfolioJSONObj.hasOwnProperty('deletedItems') && portfolioJSONObj.deletedItems !== null) {
			var portfolioDeletedItemsJSONArray = portfolioJSONObj.deletedItems;
			for (var i=0; i< portfolioDeletedItemsJSONArray.length; i++) {
				var portfolioDeletedItemJSON = portfolioDeletedItemsJSONArray[i];
				this.deletedItems.push(new PortfolioItem(this.view, portfolioDeletedItemJSON));
			}
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
	var portfolioItem = new PortfolioItem(this.view,portfolioItemArgs);
	this.addItem(portfolioItem);
	this.saveToServer(this.addItemSaveToServerCallback,{portfolio:this});
	
	this.items.push(portfolioItem);
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
	var portfolioItem = new PortfolioItem(view,event.data);
	portfolioItem.id = view.portfolio.getHighestItemId()+1; // assign new item id
	view.portfolio.addItem(portfolioItem);
	view.portfolio.saveToServer(view.portfolio.addItemSaveToServerCallback,{portfolio:view.portfolio});
};

/**
 * Hander for deleting item event
 */
Portfolio.prototype.deleteItemEventHandler = function(event) {
	var portfolioItemIdToDelete = event.data.portfolioItemId;
	var view = event.data.view;
	view.portfolio.deleteItem(portfolioItemIdToDelete);
	view.portfolio.saveToServer(view.portfolio.deleteItemSaveToServerCallback,{portfolio:view.portfolio,'portfolioItemId':portfolioItemIdToDelete});
};

/**
 * Delete a PortfolioItem specified by portfolioItemIdToDelete
 * This simply moves the item from this.items to this.deletedItems
 */
Portfolio.prototype.deleteItem = function(portfolioItemIdToDelete) {
	for (var i=0; i<this.items.length; i++) {
		var item = this.items[i];
		if (item.id == portfolioItemIdToDelete) {
			this.items.splice(i,1);
			this.deletedItems.push(item);
		}
	}
};

/**
 * Callback when the portfolio has been updated on the server after deleting a portfolio item
 */
Portfolio.prototype.deleteItemSaveToServerCallback = function(responseText, responseXML, args) {
	var portfolio = args.portfolio;
	var deletedItemId = args.portfolioItemId;
	// show some kind of feedback to user here
	$("#portfolioItem_"+deletedItemId).hide();
};

/**
 * Render the portfolio
 */
Portfolio.prototype.render = function() {
	var title = this.view.getI18NString("portfolio");
	if('portfolioSettings' in this.view.getProjectMetadata().tools){
		var portfolioSettings = this.view.getProjectMetadata().tools.portfolioSettings;
		if('portfolioTerm' in portfolioSettings && this.view.utils.isNonWSString(portfolioSettings.portfolioTerm)){
			title = portfolioSettings.portfolioTerm;
		}
	}

	$("#portfolioIframe").dialog({autoOpen:false,closeText:'',resizable:true,modal:true,show:{effect:"fade",duration:200},hide:{effect:"fade",duration:200},title:title,open:this.view.portfolioDivOpen,close:this.view.portfolioDivClose,
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

	// clear portfolio
	var portfolioContent = $("<div>").attr("id","portfolioContent");
	//$("#"+domId).html(portfolioContent);
	
	// clear existing Table of Contents
	var portfolioTOC = $("<div>").attr("id", "portfolioTOC");
	portfolioContent.append(portfolioTOC);	
	
	//	clear existing portfolio items
	var portfolioItems = $("<div>").attr("id", "portfolioItems");
	portfolioContent.append(portfolioItems);
	
	//	open the portfolio dialog
	var docHeight = $(document).height()-25;
	var docWidth = $(document).width()-25;
	$("#portfolioIframe").dialog({height:docHeight,width:docWidth});
	$("#portfolioIframe").dialog('open');
	$("#portfolioIframe").scrollTop(0);
	$("#portfolioIframe").attr("src","portfolio.html");
	$("#portfolioIframe").css("width","100%");
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
 * If itemType is stepWork, there are three levels to specify which work to store:
 * 1. just nodeId: always get the latest work for the node
 * 2. nodeId+stepWorkId: get the specific stepWork for the node
 * 3. nodeId+stepWorkId+nodeStateId: get the specific nodeState within the specified stepWork for the node.
 *
 * If itemType is studentUploadedAssets, here's the relevant data:
 *  studentUploadedAssetURL: absolute url to student assets directory
 *  title: asset file name
 */
function PortfolioItem(view,object) {
	this.view = view;
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