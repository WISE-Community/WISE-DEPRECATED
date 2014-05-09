/*globals svgEditor*/
/*
The config.js file is intended for the setting of configuration or
  preferences which must run early on; if this is not needed, it is
  recommended that you create an extension instead (for greater
  reusability and modularity).
*/

// CONFIG AND EXTENSION SETTING
/*
See defaultConfig and defaultExtensions in svg-editor.js for a list
  of possible configuration settings.

See svg-editor.js for documentation on using setConfig().
*/

// URL OVERRIDE CONFIG
svgEditor.setConfig({
	/**
	To override the ability for URLs to set URL-based SVG content,
	    uncomment the following:
	*/
	// preventURLContentLoading: true,
	/**
	To override the ability for URLs to set other configuration (including
	    extension config), uncomment the following:
	*/
	// preventAllURLConfig: true,
	/**
	To override the ability for URLs to set their own extensions,
	  uncomment the following (note that if setConfig() is used in
	  extension code, it will still be additive to extensions,
	  however):
	*/
	// lockExtensions: true,
});

svgEditor.setConfig({
	/*
	Provide default values here which differ from that of the editor but
		which the URL can override
	*/
}, {allowInitialUserOverride: true});

var thisNode, extensions;

// build extensions list based on current wise4 node's content JSON
if(typeof vle !== 'undefined'){
	thisNode = vle.getCurrentNode();
} else {
	// we might be in a grading enlarge view
	thisNode = window.opener.$('#' + divId).data('node');	
}
svgEditor.nodeType = 'draw';
if(thisNode){
	extensions = ['ext-connector.js','ext-closepath.js',/*'ext-panning.js',*/'ext-wise.js'];
	
	var nodeType = thisNode.type,
		content = thisNode.content.getContentJSON(),
		view = thisNode.view;
	if(nodeType === "AnnotatorNode"){
		svgEditor.nodeType = 'annotator';
		extensions = extensions.concat(['ext-panning.js','ext-labels.js']);
	} else if (nodeType === "SVGDrawNode"){
		extensions = extensions.concat(['ext-arrows.js','ext-simple_color.js','ext-clearlayer.js']);
		if (view.utils.isNonWSString(content.prompt)){
			extensions.push('ext-prompt.js');
		}
	}

	if (content.description_active){
		extensions.push('ext-description.js');
	}
	if (content.stamps && content.stamps.length){
		extensions.push('ext-stamps.js');
	}
	if (content.snapshots_active){
		extensions.push('ext-snapshots.js');
	}
	if (content.toolbar_options && content.toolbar_options.importStudentAsset){
		extensions.push('ext-importstudentasset.js');
	}
	thisNode.extensions = extensions;
} else {
	extensions = ['ext-connector.js','ext-closepath.js','ext-wise.js','ext-panning.js','ext-clearlayer.js','ext-arrows.js','ext-simple_color.js','ext-description.js','ext-stamps.js','ext-prompt.js','ext-snapshots.js']
}

// EXTENSION CONFIG
svgEditor.setConfig({
	extensions: extensions
	, noDefaultExtensions: true // noDefaultExtensions can only be meaningfully used in config.js or in the URL
});

// OTHER CONFIG
svgEditor.setConfig({	
	// canvasName: 'default',
	canvas_expansion: 1,
	// initFill: {
		// color: 'FF0000', // solid red
		// opacity: 1
	// },
	// initStroke: {
		// width: 5,
		// color: '000000', // solid black
		// opacity: 1
	// },
	// initOpacity: 1,
	// colorPickerCSS: null,
	// initTool: 'select',
	// wireframe: false,
	// showlayers: false,
	no_save_warning: true,
	// PATH CONFIGURATION
	imgPath: '../../../node/draw/svg-edit/images/',
	langPath: '../../../node/draw/svg-edit/locale/',
	extPath: '../../../node/draw/svg-edit/extensions/',
	jGraduatePath: '../../../node/draw/svg-edit/jgraduate/images/',
	// DOCUMENT PROPERTIES
	dimensions: [600, 450],
	// EDITOR OPTIONS
	// gridSnapping: false,
	// gridColor: '#000',
	// baseUnit: 'px',
	// snappingStep: 10,
	showRulers: false,
	// EXTENSION-RELATED (GRID)
	// showGrid: false, // Set by ext-grid.js
	// EXTENSION-RELATED (STORAGE)
	noStorageOnLoad: true, // Some interaction with ext-storage.js; prevent even the loading of previously saved local storage
	// forceStorage: false, // Some interaction with ext-storage.js; strongly discouraged from modification as it bypasses user privacy by preventing them from choosing whether to keep local storage or not
	// emptyStorageOnDecline: true, // Used by ext-storage.js; empty any prior storage if the user declines to store
	nodeType: nodeType // used by ext-wise.js to modify setup based on current WISE node type
});

// PREF CHANGES
/**
setConfig() can also be used to set preferences in addition to
  configuration (see defaultPrefs in svg-editor.js for a list of
  possible settings), but at least if you are using ext-storage.js
  to store preferences, it will probably be better to let your
  users control these.
As with configuration, one may use allowInitialUserOverride, but
  in the case of preferences, any previously stored preferences
  will also thereby be enabled to override this setting (and at a
  higher priority than any URL preference setting overrides).
  Failing to use allowInitialUserOverride will ensure preferences
  are hard-coded here regardless of URL or prior user storage setting.
*/
svgEditor.setConfig(
	{
		// lang: '', // Set dynamically within locale.js if not previously set
		 iconsize: 'm', // Will default to 's' if the window height is smaller than the minimum height and 'm' otherwise
		/**
		* When showing the preferences dialog, svg-editor.js currently relies
		* on curPrefs instead of $.pref, so allowing an override for bkgd_color
		* means that this value won't have priority over block auto-detection as
		* far as determining which color shows initially in the preferences
		* dialog (though it can be changed and saved).
		*/
		// bkgd_color: '#FFF',
		// bkgd_url: '',
		// img_save: 'embed',
		// Only shows in UI as far as alert notices
		// save_notice_done: false,
		// export_notice_done: false
	}
);
svgEditor.setConfig(
	{
		// Indicate pref settings here if you wish to allow user storage or URL settings
		//   to be able to override your default preferences (unless other config options
		//   have already explicitly prevented one or the other)
	},
	{allowInitialUserOverride: true}
);
