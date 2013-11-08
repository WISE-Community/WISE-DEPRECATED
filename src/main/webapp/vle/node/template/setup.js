var coreScripts = [
    /*
     * TODO: rename template
     * TODO: rename TemplateNode.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizNode.js'
     */
	'vle/node/template/TemplateNode.js',
	/*
     * TODO: rename template
     * TODO: rename templateEvents.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizEvents.js'
	 */
	'vle/node/template/templateEvents.js'
];

var studentVLEScripts = [
	/*
	 * TODO: If your node requires the jQuery library, keep the following the line
	 * to load the jQuery version included with the WISE installation.
	 * 
	 * If your node requires a legacy or specific version of jQuery, remove the
	 * following line, include the jQuery source file in your node's folder and
	 * add an entry to its path here (e.g. 'vle/node/template/jquery.js')
	 */
	scriptloader.jquerySrc,
	/*
	 * TODO: If your node requires the jQuery UI library, keep the following the line
	 * to load the jQuery UI version included with the WISE installation.
	 * 
	 * If your node requires a legacy or specific version of jQuery UI, remove the
	 * following line, include the jQuery UI source file in your node's folder and
	 * add an entry to its path here (e.g. 'vle/node/template/jquery-ui.js')
	 */
	scriptloader.jqueryUISrc,
 	/*
     * TODO: rename template
     * TODO: rename template.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quiz.js'
	 */
	'vle/node/template/template.js',
	/*
     * TODO: rename template
     * TODO: rename templateState.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/template/templateState.js'
];

var authorScripts = [
	/*
	 * TODO: rename template
	 * TODO: rename authorview_template.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/authorview_quiz.js'
	 */
	'vle/node/template/authorview_template.js'
];

var gradingScripts = [
  	/*
	 * TODO: rename template
	 * TODO: rename templateState.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/template/templateState.js'
];

var dependencies = [
  	/*
	 * TODO: rename template
	 * TODO: rename TemplateNode.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/QuizNode.js'
	 */
	{child:"vle/node/template/TemplateNode.js", parent:["vle/node/Node.js"]}
];

/* 
 * TODO: rename template
 * 
 * For example if you are creating a quiz node you would change it to
 * 'node/quiz/icons/'
 */
var nodeIconPath = 'node/template/icons/';

/*
 * TODO: rename template
 * For example if you are creating a quiz node and you want to use custom icons,
 * you would change it to 'quiz' and replace the 'template28.png'
 * file in the node's 'icons' directory with 'quiz28.png' 
 * (the icon should be a png file with 28x28 pixels)
 * 
 * TODO: rename Template
 * For example if you are creating a quiz node you would change it to
 * 'Quiz'
 * 
 * If you want to provide authors with multiple icon options for this node type,
 * add another entry to the nodeClasses array and add the corresponding icons
 * (using that nodeClass in the filenames) to the 'icons' directory
 */
var nodeClasses = [
	{nodeClass:'template', nodeClassText:'Template', icon:'node/template/icons/template28.png'}
];

/* 
 * TODO: rename TemplateNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeIconPath('TemplateNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreScripts);

/*
 * TODO: rename template
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addScriptToComponent('template', studentVLEScripts);

scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);

scriptloader.addDependencies(dependencies);

/*
 * TODO: rename TemplateNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeClasses('TemplateNode', nodeClasses);

var css = [
        /*
         * If your node requires the jQuery UI library, keep the following
         * line to load the jQuery UI css styles included with the WISE
         * installation.
         * 
         * If you would like to substitute your own jQuery UI css styles,
         * remove the following line, include the jQuery UI images and css
         * file in your node's directory and add an entry to the css path here
         * (e.g. 'vle/node/template/jquery-ui.css')
         */
        scriptloader.jqueryUICss,
        /*
         * TODO: rename the file path value
         * 
         * For example if you are creating a quiz node you would change it to
         * 'vle/node/quiz/quiz.css'
         */
       	"vle/node/template/template.css"
];

/*
 * TODO: rename template
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addCssToComponent('template', css);

var nodeTemplateParams = [
	{
		/*
		 * TODO: rename the file path value
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'node/quiz/quizTemplate.qz'
		 */
		nodeTemplateFilePath:'node/template/templateTemplate.te',
		
		/*
		 * TODO: rename the extension value for your step type, the value of the
		 * extension is up to you, we just use it to easily differentiate between
		 * different step type files
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'qz'
		 */
		nodeExtension:'te'
	}
];

/*
 * TODO: rename TemplateNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeTemplateParams('TemplateNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename template to your new folder name
	 * 
	 * For example if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/setup.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/template/setup.js');
};