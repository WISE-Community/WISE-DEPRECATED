/*
 * File:        FacetedFilter.js
 * Version:     1.0.1
 * Description: Creates user-defined search and faceted filtering tools for DataTables instances
 * Author:      Jonathan Lim-Breitbart (jbreitbart.com)
 * Created:     Thu May 26 12:10:00 PDT 2011
 * Modified:    Sun Oct 17 00:10:00 PDT 2011 by Jonathan Lim-Breitbart
 * Language:    Javascript
 * License:     LGPL
 * Project:     
 * Contact:     jbreitbart.com
 * 
 * Copyright 2011 Jonathan Lim-Breitbart, all rights reserved.
 *
 */

/* Global scope for FacetedFilter */
var FacetedFilter;

(function($, window, document) {
/** 
 * FacetedFilter provides search and faceted filtering tools to DataTables enhanced tables
 * @class FacetedFilter
 * @constructor
 * @param {Object} oDT DataTables instance
 * @param {Object} oOpts FacetedFilter options
 * @param {String} oOpts.sDisplaySide Side which the FacetedFilter tool panel should be inserted - 'left' or 'right'
 * @param {String} oOpts.sWidth Width of the FacetedFilter tool panel
 * @param {Boolean} oOpts.bScroll Whether FacetedFilter tool panel should scroll with the window
 * @param {String} oOpts.oSearchLabel Label for the search section of the tool panel
 * @param {String} oOpts.oFilterLabel Label for the filter section of the tool panel
 * @param {String} oOpts.oClearSearchLabel Label for link to clear all search terms
 * @param {String} oOpts.oClearFilterLabel Label for links to clear all facets for a filter set
 * @param {String} oOpts.oSearchResultsLabel Label for search results header
 * @param {Object} oOpts.aSearchOpts List of search options for the FactedFilter instance
 * @param {Object} oOpts.aFilterOpts List of filter options for the FactedFilter instance
 * @param {Function} oOpts.fnCallback Callback function for the FactedFilter instance
 * @param {Function} oOpts.fnInitCallback Callback function to run on initialization complete for the FactedFilter instance
 * @param {Integer} oOpts.iFadeDuration Integer to specify duration (ms) of fadeIn/fadeOut effect for the FactedFilter instance
 */
FacetedFilter = function( oDT, oOpts ) {
	
	/* Sanity check that we are a new instance */
	if ( !this.CLASS || this.CLASS !== "FacetedFilter" ) {
		alert( "FacetedFilter Warning: FacetedFilter must be initialised with the keyword 'new'" );
	}
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public class variables
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/**
	 * @namespace Settings object which contains customizable information for FacetedFilter instance
	 */
	this.s = {
		/** 
		 * DataTables objects
		 * @property oTable
		 * @type     object
		 * @default  null
		 */
		"oTable": null,
		
		/** 
		 * DataTables settings objects
		 * @property dt
		 * @type     object
		 * @default  null
		 */
		"dt": null,
		
		/** 
		 * DataTables ApiIndex for this FacetedFilter instance, TODO: not sure if this is necessary - figure out
		 * @property apiIndex
		 * @type     Integer
		 * @default  null
		 */
		"apiIndex": null,
		
		/** 
		 * index for this FacetedFilter instance
		 * @property id
		 * @type     Integer
		 * @default  null
		 */
		"id": null,
		
		/**
		 * Customization object
		 *  @property oOpts
		 *  @type     Object
		 *  @default  null
		 */
		"oOpts": null,
		
		/**
		 * Side which the filtering tool panel should be inserted. Can be 'left' or 'right'
		 *  @property displaySide
		 *  @type     String
		 *  @default  ''
		 */
		"displaySide": "",
		
		/**
		 * Width of filtering tool panel
		 *  @property width
		 *  @type     String
		 *  @default  ''
		 */
		"width": "",
		
		/**
		 * Whether filtering tool panel should scroll with the window
		 *  @property scroll
		 *  @type     Boolean
		 *  @default  null
		 */
		"scroll": null,
		
		/**
		 * Settings object for the search options
		 *  @property searchOpts
		 *  @type     Array
		 *  @default  []
		 */
		"searchOpts": [],
		
		/**
		 * Settings object for the filter options
		 *  @property filterOpts
		 *  @type     Array
		 *  @default  []
		 */
		"filterOpts": [],
		
		/**
		 * Display string for search section header
		 *  @property searchLabel
		 *  @type     String
		 *  @default  ''
		 */
		"searchLabel": "",
		
		/**
		 * Display string for filter section header
		 *  @property filterLabel
		 *  @type     String
		 *  @default  ''
		 */
		"filterLabel": "",
		
		/**
		 * Display string for link to clear all search terms
		 *  @property clearSearchLabel
		 *  @type     String
		 *  @default  ''
		 */
		"clearSearchLabel": "",
		
		/**
		 * Display string for links to clear all facets for a filter set
		 *  @property clearFilterLabel
		 *  @type     String
		 *  @default  ''
		 */
		"clearFilterLabel": "",
		
		/**
		 * Display string for search results display
		 *  @property searchResultsLabel
		 *  @type     String
		 *  @default  ''
		 */
		"searchResultsLabel": "",
		
		/**
		 * Variable to store sidebar position after scrolling
		 *  @property sidebarpos
		 *  @type     Integer
		 *  @default  null
		 */
		"sidebarpos": null,
		
		/**
		 * Callback function to run once FacetedFilter has completed
		 *  @property callback
		 *  @type     Function
		 *  @default  null
		 */
		"callback": null,
		
		/**
		 * Callback function to run once FacetedFilter instance has been instantiated
		 *  @property initCallback
		 *  @type     Function
		 *  @default  null
		 */
		"callback": null,
		
		/**
		 * Integer to specify duration (ms) of fadeIn/fadeOut animations
		 *  @property fadeDuration
		 *  @type     Integer
		 *  @default  ''
		 */
		"fadeDuration": null,
	};
	
	/**
	 * @namespace Common and useful DOM elements for the class instance
	 */
	this.dom = {
		/**
		 * DIV element that is created. All FacetedFilter search and filter options (and their children) are put into this element
		 *  @property sidebar
		 *  @type     node
		 *  @default  null
		 */
		"sidebar": null
	};
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public class methods
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/**
	 * Retrieve the settings object from an instance
	 *  @method fnSettings
	 *  @returns {object} FacetedFilter settings object
	 */
	this.fnSettings = function () {
		return this.s;
	};
	
	/* Constructor logic */
	if ( typeof oOpts === 'undefined' ) {
		oOpts = {};
	}
	
	/* Store global reference */
	FacetedFilter.aInstances.push( this );
	
	this.s.oTable = oDT.oInstance;
	this.s.dt = oDT;
	this.s.id = $.fn.dataTableExt.iApiIndex;
	this.dom.table = this.s.dt.nTable;
	this._fnConstruct( oOpts );
	
	return this;
};


FacetedFilter.prototype = {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/**
	 * Constructor logic
	 *  @method  _fnConstruct
	 *  @param   {Object} oOpts Same as FacetedFilter constructor
	 *  @returns void
	 *  @private 
	 */
	"_fnConstruct": function ( oOpts ) {
		var that = this;
		
		this._fnCustomizeSettings( oOpts );
		
		/* Wrapper (sidebar) element */
		this.dom.sidebar = document.createElement('div');
		this.dom.sidebar.style.position = "relative";
		this.dom.sidebar.style.float = this.s.displaySide;
		this.dom.sidebar.style.width = this.s.width;
		this.dom.sidebar.className = "FF_sidebar";
		this.dom.sidebar.setAttribute('id','FF_sidebar_' + this.s.id);
		
		/* Set up search options */
		if (this.s.searchOpts.length) {
			this._fnSearchDefinitions( this.s.searchOpts, this.dom.sidebar );
		}
		
		/* Set up filter options */
		if (this.s.filterOpts.length) {
			this._fnFilterDefinitions( this.s.filterOpts, this.dom.sidebar );
		}
		
		/* Insert wrapper element before DT wrapper */
		var tableWrapper = this.s.dt.nTableWrapper;
		$(tableWrapper).before(this.dom.sidebar);
		
		/* Set margins */
		if (this.s.displaySide === "left"){
			$(this.dom.sidebar).css("float", "left");
			$(tableWrapper).css('margin-left', $(this.dom.sidebar).outerWidth() + 5);
		} else if (this.s.displaySide === "right"){
			$(this.dom.sidebar).css("float", "right");
			$(tableWrapper).css('margin-right', $(this.dom.sidebar).outerWidth() + 5);
		}
		
		this.s.sidebarpos = $(this.dom.sidebar).offset().top;
		
		/* Set up sidebar scrolling */
		if(this.s.scroll){
			/* Bind scroll event for window movement */
			FacetedFilter.afnScroll.push( function () {
				that._fnScroll.call(that);
			} );
		}
		
		/* run initialization callback function */
		this.s.initCallback();
	},
	
	
	/**
	 * Take the user defined settings and the default settings and combine them.
	 *  @method  _fnCustomizeSettings
	 *  @param   {Object} oOpts Same as FacetedFilter constructor
	 *  @returns void
	 *  @private 
	 */
	"_fnCustomizeSettings": function ( oOpts ) {
		/* Store the DataTables apiIndex for this FacetedFilter instance */
		this.s.apiIndex = this._fnDataTablesApiIndex.call(this);
		
		/* Clone the defaults and then the user options */
		this.s.custom = $.extend( {}, FacetedFilter.DEFAULTS, oOpts );
		
		this.s.displaySide = this.s.custom.sDisplaySide;
		this.s.scroll = this.s.custom.bScroll;
		this.s.width = this.s.custom.sWidth;
		this.s.searchLabel = this.s.custom.sSearchLabel;
		this.s.filterLabel = this.s.custom.sFilterLabel;
		this.s.clearSearchLabel = this.s.custom.sClearSearchLabel;
		this.s.clearFilterLabel = this.s.custom.sClearFilterLabel;
		this.s.searchResultsLabel = this.s.custom.sSearchResultsLabel;
		this.s.searchOpts = this.s.custom.aSearchOpts;
		this.s.filterOpts = this.s.custom.aFilterOpts;
		this.s.callback = this.s.custom.fnCallback;
		this.s.initCallback = this.s.custom.fnInitCallback;
		this.s.fadeDuration = this.s.custom.iFadeDuration;
	},
	
	/**
	 * Get the position in the DataTables instance array of the table for this instance of FacetedFilter
	 *  @method  _fnDataTablesApiIndex
	 *  @returns {int} Index
	 *  @private 
	 */
	"_fnDataTablesApiIndex": function () {
		var i;
		for ( i=0, iLen=this.s.dt.oInstance.length ; i<iLen ; i++ )	{
			if ( this.s.dt.oInstance[i] === this.s.dt.nTable ) {
				return i;
			}
		}
		return 0;
	},
	
	/**
	 * Set sidebar to scroll with page
	 *  @method  _fnScroll
	 *  @param sidebar DOM object to scroll
	 *  @returns null
	 *  @private 
	 */
	"_fnScroll": function() {
		var that = this;
		var sidebar = $(this.dom.sidebar);
		if(sidebar.is(':visible')){
			var sidebarpos_original = this.s.sidebarpos;
			var tableWrapper = this.s.dt.nTableWrapper;
			
			var maxBottom = $(tableWrapper).offset().top + $(tableWrapper).outerHeight();
		    var windowpos = $(window).scrollTop();
		    var finaldestination = windowpos;
		    if(windowpos < sidebarpos_original) {
		        finaldestination = sidebarpos_original;
		        sidebar.stop().css({'top':0});
		        this.s.sidebarpos = $(sidebar).offset().top;
		    } else {
		    	var dest;
		    	if((finaldestination + $(sidebar).outerHeight()) > maxBottom){
		    		dest = maxBottom - $(sidebar).outerHeight() - sidebarpos_original;
		    	} else {
		    		dest = finaldestination-sidebarpos_original+5;
		    	}
		    	sidebar.stop().animate({'top':dest},200,function(){
		    	});
		    }
		}
	},
	
	/**
	 * Take the user input search options array and expand it to be fully defined, then add search options to a given DOM element
	 *  @method  _fnSearchDefinitions
	 *  @param {array} searchSet Set of user defined search options
	 *  @param {node} wrapper Node to add the created search options to
	 *  @returns void
	 *  @private 
	 */
	"_fnSearchDefinitions": function ( searchSet, wrapper ) {
		var that = this;
		var callback = this.s.callback;
		var fadeDuration = this.s.fadeDuration;
		
		/* Add search header to wrapper */
		var searchHeader = document.createElement('div');
		searchHeader.className = 'side_header';
		searchHeader.innerHTML  = this.s.searchLabel;
		$(searchHeader).css('margin-top','0');
		wrapper.appendChild(searchHeader);
		
		$.each(searchSet, function(i, item){
			if(typeof item.label !== "string" || typeof item.column !== "number" || typeof item.identifier !== "string"){
				alert('Invalid search option: ' + i + ', ignoring');
				return;
			}
			
			var maxlength;
			if(typeof item.maxLength === 'number') {
				maxlength = item.maxlength;
			} else {
				maxlength = 50;
			}
			
			/* Create search input elements, insert into DOM */
			var searchInput = document.createElement('div');
			searchInput.className = "search_field custom_filter";
			searchInput.setAttribute('id',item.identifier + '_input_' + that.s.id);
			var label = document.createElement('label');
			label.innerHTML  = item.label;
			searchInput.appendChild(label);
			var input = document.createElement('input');
			input.setAttribute('type','text');
			input.setAttribute('maxlength',maxlength);
			searchInput.appendChild(input);
			wrapper.appendChild(searchInput);
			
			/* If user defined instructions for search option, insert into DOM */
			if(typeof item.instructions === 'string' && item.instructions !== ''){
				var instructions = document.createElement('div');
				instructions.className = "help custom_filter";
				instructions.innerHTML  = item.instructions;
				wrapper.appendChild(instructions);
			}
			
			/* Bind enter keypress to search input field */
			$(input).keypress(function(e) {
				if(e.keyCode === 13) {
					var val = $(this).val();
					// if user defined regex replace for search option, process
	    			if(item.regexreplace && typeof item.regexreplace.match === "string" && 
	    					typeof item.regexreplace.replacement === "string"){
	    				val = val.replace(eval(item.regexreplace.match),item.regexreplace.replacement);
	    			}
	    			$(that.dom.table).fadeOut(that.fadeDuration,function(){
	    				var oldIndex = $.fn.dataTableExt.iApiIndex;
						$.fn.dataTableExt.iApiIndex = that.s.apiIndex;
	    				that.s.oTable.fnFilter(val,item.column); // execute DataTables filter
	    				that._fnAddSearchTerm(val,item); // add search to active terms (or update existing)
	    				$.fn.dataTableExt.iApiIndex = oldIndex;
	    				
	    				$(this).fadeIn(fadeDuration,callback);
	    			});
				}
			});
		});
		
		/* Add search display section to wrapper */
		var nSearchDisplay = this._fnSearchDisplay();
		wrapper.appendChild(nSearchDisplay);
	},
	
	/**
	 * Create DOM object for displaying active search terms
	 * @method _fnSearchDisplay
	 * @returns searchDisplay DOM object
	 * @private
	 */
	"_fnSearchDisplay": function (){
		var that = this;
		var index = this.s.id;
		var callback = this.s.callback;
		var fadeDuration = this.s.fadeDuration;
		
		var searchDisplay = document.createElement('div');
		searchDisplay.setAttribute('id', 'searchFilters_' + index);
		searchDisplay.className = 'active_filters custom_filter';
		searchDisplay.style.display = 'none';
		var searchDisplayHead = document.createElement('div');
		searchDisplayHead.className = "active_search_header";
		searchDisplayHead.innerHTML  = this.s.searchResultsLabel;
		var clearSearch = document.createElement('a');
		clearSearch.setAttribute('id', 'clear_search_' + index);
		clearSearch.className = "clear_search";
		clearSearch.innerHTML  = this.s.clearSearchLabel;
		searchDisplayHead.appendChild(clearSearch);
		searchDisplay.appendChild(searchDisplayHead);
		
		// bind click action to clearSearch link
		$(clearSearch).click(function(){
			$(that.dom.table).fadeOut(that.fadeDuration,function(){
				$.each(that.s.searchOpts, function(){
					that._fnClearSearchTerm(this);
				});
    			$(this).fadeIn(fadeDuration,callback);
    		});
		});
		
		var activeTerms = document.createElement('div');
		activeTerms.setAttribute('id', 'active_terms_' + index);
		searchDisplay.appendChild(activeTerms);
		
		return searchDisplay;
	},
	
	/**
	 * Display executed search term in DOM
	 * @method _fnAddSearchTerm
	 * @param {string} val User-entered search string
	 * @param {object} searchItem Active search option object
	 * @returns void
	 * @private
	 */
	"_fnAddSearchTerm": function( val, searchItem ){
		var that = this;
		var index = this.s.id;
		var callback = this.s.callback;
		var fadeDuration = this.s.fadeDuration;
		
		if(!$('#searchFilters_' + index).is(':visible')){
			$('#searchFilters_' + index).slideDown();
			$('#clear_search_' + index).fadeIn();
		}
		
		if($('#' + searchItem.identifier + 'term_' + index).length){
			$('#' + searchItem.identifier + 'term_' + index).text(searchItem.label + val);
		} else {
			if(val !== ''){
				var item = document.createElement('div');
				item.setAttribute('id', searchItem.identifier + 'search_' + index);
				item.className = "active_search";
				var itemDisplay = document.createElement('div');
				itemDisplay.setAttribute('id', searchItem.identifier + 'term_' + index);
				itemDisplay.className = "search_display";
				itemDisplay.innerHTML  = searchItem.label + val;
				item.appendChild(itemDisplay);
				var clearItem = document.createElement('div');
				clearItem.setAttribute('id', searchItem.identifier + 'clear_' + index);
				clearItem.className = "remove_search";
				$(clearItem).append('<a>X</a>');
				item.appendChild(clearItem);
				$('#active_terms_' + index).append(item);
				
				// bind click action to clear search link
				$(clearItem).click(function(){
					$(that.dom.table).fadeOut(that.fadeDuration,function(){
						that._fnClearSearchTerm(searchItem);
						$(this).fadeIn(fadeDuration,callback);
					});
				});
			}
		}
	},
	
	/**
	 * Remove selected search option from DOM and clear corresponding DataTable filter
	 * @method _fnClearSearchTerm
	 * @param {object} searchItem Selected search options object
	 * @returns void
	 * @private
	 */
	"_fnClearSearchTerm": function( searchItem ) {
		/* Set apiIndex for this FacetedFilter instance */
		var index = this.s.id;
		var oldIndex = $.fn.dataTableExt.iApiIndex;
		$.fn.dataTableExt.iApiIndex = this.s.apiIndex;
		
		/* Clear search term and remove from DOM */
		var object = $('#' + searchItem.identifier + 'search_' + index);
		$('#' + searchItem.identifier + '_input_' + index + ' > input').val('');
		$(object).remove();
		
		/* Clear DataTable filter */
		this.s.oTable.fnFilter('',searchItem.column);
		
		/* If no active searchers, hide active search term display */
		if($('#active_terms_' + index).children().length === 0){
			$('#searchFilters_' + index).slideUp();
		}
		
		/* Reset apiIndex */
		$.fn.dataTableExt.iApiIndex = oldIndex;
	},
	
	/**
	 * Take the user input faceted filter options array and expand it to be fully defined, then add filter sets to a given DOM element
	 *  @method  _fnFilterDefinitions
	 *  @param {array} filterSet Set of user defined facets
	 *  @param {node} wrapper Node to add the created facets to
	 *  @returns void
	 *  @private 
	 */
	"_fnFilterDefinitions": function ( filterSet, wrapper ) {
		var that = this;
		
		/* Add filter header to wrapper */
		var filterHeader = document.createElement('div');
		if($('#FF_sidebar_' + this.s.id +  ' .side_header').length){
			$(filterHeader).css('margin-top','0');
		}
		filterHeader.className = 'side_header';
		filterHeader.innerHTML = this.s.filterLabel;
		wrapper.appendChild(filterHeader);
		//$(wrapper).append('<div class="side_header" style="margin-top:0;">' + this.s.filterLabel + '</div>');
		
		$.each(filterSet, function(i, item){
			if(typeof item.label !== "string" || typeof item.column !== "number" || typeof item.identifier !== "string" ||
					typeof item.options !== "object" || !item.options.length){
				alert('Invalid facet set: ' + i + ', ignoring');
			} else {
				/* Create DOM elements for current facet set */
				var filterDisplay = that._fnFilterDisplay(item,i);
				
				/* Insert facet set into DOM */
				wrapper.appendChild(filterDisplay);
			}
		});
	},
	
	/**
	 * Create DOM object to display selected facet set
	 * @method _fnFilterhDisplay
	 * @param {object} facetSet The selected filter set object
	 * @param {integer} i Index of current filter set
	 * @returns filterDisplay DOM object
	 * @private
	 */
	"_fnFilterDisplay": function( facetSet, i ){
		var that = this;
		var index = this.s.id;
		var callback = this.s.callback;
		var fadeDuration = this.s.fadeDuration;
		
		/*Create wrapper element for this facet set */
		var filterDisplay = document.createElement('div');
		filterDisplay.className = "active_filters custom_filter";
		var filterHeader = document.createElement('div');
		filterHeader.className = "active_filters_header";
		filterHeader.innerHTML  = facetSet.label;
		var clearFilter = document.createElement('a');
		clearFilter.setAttribute('id', 'clear_' + facetSet.identifier + '_' + index);
		clearFilter.className = "clear_filters";
		clearFilter.innerHTML  = this.s.clearFilterLabel;
		filterHeader.appendChild(clearFilter);
		filterDisplay.appendChild(filterHeader);
		var terms = document.createElement('div');
		terms.setAttribute('id', facetSet.identifier + '_terms_' + index);
		filterDisplay.appendChild(terms);
		
		/* Create elements for each facet, insert into set wrapper */
		$.each(facetSet.options, function(a, facet){
			if (typeof facet.query === "string" && typeof facet.display === "string") {
				var facetDisplay = document.createElement('div');
				facetDisplay.setAttribute('id', facet.query + '_search_' + index);
				facetDisplay.className = "active_filter";
				var facetText = document.createElement('div');
				facetText.className = 'filter_display';
				$(facetText).append('<a>' + facet.display + '</a>');
				facetDisplay.appendChild(facetText);
				var remove = document.createElement('div');
				remove.setAttribute('id', facet.query + '_clear_' + index);
				remove.className = 'remove_filter';
				$(remove).append('<a>X</a>');
				facetDisplay.appendChild(remove);
				
				/* Add facet to display of facet terms */
				terms.appendChild(facetDisplay);
				
				/* Bind click action to facet object */
				$(facetDisplay).click(function(){
					var turnOn = ($(this).hasClass('active')) ? false : true;
					$(that.dom.table).fadeOut(that.fadeDuration,function(){
						that._fnToggleFacet(facetSet.column,facetSet.identifier,facet,facetDisplay,turnOn);
						$(this).fadeIn(fadeDuration,callback);
					});
				});
			} else {
				alert('Invalid filter option: ' + i + '[' + a + ']' + ', ignoring');
			}
		});
		
		/* Bind click action to "clear" link for this facet set */
		$(clearFilter).click(function(){
			that._fnClearFacets(facetSet,this);
		});
		
		return filterDisplay;
	},
	
	/**
	 * Execute or remove selected facet, toggle DOM object 'active' class
	 * @method _fnToggleFacet
	 * @param {integer} column Column of selected facet set
	 * @param {string} identifier Identifier for selected facet set
	 * @param {object} facet Faceted filter options object
	 * @param {node} facetNode Corresponding node for facet
	 * @param {boolean} turnOn Boolean to specify whether facet's filter should be applied or not
	 * @returns void
	 * @private
	 */
	"_fnToggleFacet": function( column, identifier, facet, facetNode, turnOn ){
		var that = this;
		
		/* Set apiIndex for this FacetedFilter instance */
		var index = this.s.id;
		var oldIndex = $.fn.dataTableExt.iApiIndex;
		$.fn.dataTableExt.iApiIndex = this.s.apiIndex;
		
		var currentFilter = this.s.dt.aoPreSearchCols[column].sSearch;
		var currents = currentFilter.split('|');
		var newFilter = '';
		
		/* If facet is currently active, deactivate it and remove active class, vice versa */
		if(turnOn) { // Facet is currently inactive, so execute
			$(facetNode).addClass('active');
			if(currentFilter != ""){
				$.each(currents, function(){
					newFilter += this + '|';
				});
				newFilter += facet.query;
			} else {
				newFilter = facet.query;
			}
		} else { // Facet is currently active, so remove
			$(facetNode).removeClass('active');
			$.each(currents, function() {
				if(this != facet.query && this != ''){
					newFilter += this + '|';
				}
			});
			newFilter = newFilter.substring(0, newFilter.length-1);
		}
		
		/* Show or hide the clear link for this facet set */
		if(newFilter == ''){
			$('#clear_' + identifier + '_' + index).hide();
		} else {
			$('#clear_' + identifier + '_' + index).show();
		}
		
		/* Apply new filter */
		that.s.oTable.fnFilter(newFilter,column,true,false);
		
		/* Reset apiIndex */
		$.fn.dataTableExt.iApiIndex = oldIndex;
	},
	
	/**
	 * Remove all faceted filters for selected facet group
	 * @method _fnClearFacets
	 * @param {object} facetSet Selected facet group
	 * @param {node} clearLink Node that has been clicked (clear link for facet group)
	 * @returns void
	 * @private
	 */
	"_fnClearFacets": function( facetSet, clearLink ){
		var that = this;
		var index = this.s.id;
		var callback = this.s.callback;
		var fadeDuration = this.s.fadeDuration;
		
		$(clearLink).hide();
		$('#' + facetSet.identifier + '_terms_' + index + ' > div').removeClass('active');
		$(this.dom.table).fadeOut(that.fadeDuration,function(){
			/* Clear all filters for selected facet group */
			$.each(facetSet.options,function(){
				var facetDisplay = $('#' + this.query + '_search_' + index);
				that._fnToggleFacet(facetSet.column,facetSet.identifier,this,facetDisplay,false);
			});
			$(this).fadeIn(fadeDuration,callback);
		});
	}
};



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Static variables
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Static methods
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Static object methods
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Rebuild the filters for a given table, or all tables if no parameter given
 *  @method  FacetedFilter.fnRebuild
 *  @static
 *  @param   object oTable DataTable instance to consider - optional
 *  @returns void
 */
/*FacetedFilter.fnRebuild = function ( oTable ) {
	var nTable = null;
	if ( typeof oTable !== 'undefined' ) {
		nTable = oTable.fnSettings().nTable;
	}
	var i;
	for ( i=0, iLen=ColVis.aInstances.length ; i<iLen ; i++ ) {
		if ( typeof oTable === 'undefined' || nTable === FacetedFilter.aInstances[i].s.dt.nTable ) {
			FacetedFilter.aInstances[i].fnRebuild();
		}
	}
};*/

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Static object properties
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
/**
 * Collection of all FacetedFilter instances
 *  @property FacetedFilter.aInstances
 *  @static
 *  @type     Array
 *  @default  []
 */
FacetedFilter.aInstances = [];

/**
 * Array of functions that are to be executed when window scrolls
 * @property FacetedFilter.afnScroll
 * @static
 * @type	 Array
 * @default	 []
 */
FacetedFilter.afnScroll = [];


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * @namespace FacetedFilter default settings for initialisation
 */
FacetedFilter.DEFAULTS = {
	"sDisplaySide":			"left",
	"sWidth":				"220px",
	"bScroll":				true,
	"sSearchLabel":			"Search",
	"sFilterLabel":			"Filter By",
	"sClearSearchLabel":	"Clear",
	"sClearFilterLabel":	"Show All",
	'sSearchResultsLabel':	"You searched for:",
	"aSearchOpts":			[],
	"aFilterOpts":			[],
	"fnCallback":			function(){},
	"fnInitCallback":		function(){},
	"iFadeDuration":		400
};


/**
 * Name of this class
 *  @constant CLASS
 *  @type     String
 *  @default  FacetedFilter
 */
FacetedFilter.prototype.CLASS = "FacetedFilter";


/**
 * FacetedFilter version
 *  @constant  VERSION
 *  @type      String
 *  @default   1.0.0
 */
FacetedFilter.VERSION = "1.0.0";
FacetedFilter.prototype.VERSION = FacetedFilter.VERSION;




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Initialisation
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/*
 * Register a new feature with DataTables
 */
if ( typeof $.fn.dataTable === "function" &&
     typeof $.fn.dataTableExt.fnVersionCheck === "function" &&
     $.fn.dataTableExt.fnVersionCheck('1.7.0') ) {
	$.fn.dataTableExt.aoFeatures.push( {
		"fnInit": function( oDTSettings ) {
			var oOpts = typeof oDTSettings.oInit.oFacetedFilter !== 'undefined' ? 
				oDTSettings.oOpts.oFacetedFilter : {};
			var oFF = new FacetedFilter( oDTSettings, oOpts );
			return oFF.dom.sidebar;
		},
		//"cFeature": "FF",
		"sFeature": "FacetedFilter"
	} );
}
else {
	alert( "Warning: FacetedFilter requires DataTables 1.7 or greater - www.datatables.net/download");
}

})(jQuery, window, document);


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Global processing
 */

/*
 * A 'scroll' event handler in FacetedFilter, which calls the required components.
 */
jQuery(window).scroll( function () {
	for ( var i=0, iLen=FacetedFilter.afnScroll.length ; i<iLen ; i++ )	{
		FacetedFilter.afnScroll[i]();
	}
} );
