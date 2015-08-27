var coreScripts = [
    /*
     * TODO: rename box2dModel
     * TODO: rename Box2dModelNode.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizNode.js'
     */
	'vle/node/box2dModel/Box2dModelNode.js',
	/*
     * TODO: rename box2dModel
     * TODO: rename box2dModelEvents.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizEvents.js'
	 */
	'vle/node/box2dModel/box2dModelEvents.js'
];

var studentVLEScripts = [
 	/*
     * TODO: rename box2dModel
     * TODO: rename box2dModel.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quiz.js'
	 */
	'vle/node/box2dModel/box2dModel.js',
	/*
     * TODO: rename box2dModel
     * TODO: rename box2dModelState.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/box2dModel/box2dModelState.js',
	scriptloader.jquerySrc,
	scriptloader.jqueryUISrc,
	'vle/lib/highcharts/highcharts.src.js',
	'vle/lib/highcharts/highcharts-regression.js',
	'vle/lib/highcharts/technical-indicators.src.js'
];

var authorScripts = [
	/*
	 * TODO: rename box2dModel
	 * TODO: rename authorview_box2dModel.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/authorview_quiz.js'
	 */
	'vle/node/box2dModel/authorview_box2dModel.js'
];

var gradingScripts = [
  	/*
	 * TODO: rename box2dModel
	 * TODO: rename box2dModelState.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/box2dModel/box2dModelState.js'
];

var dependencies = [
  	/*
	 * TODO: rename box2dModel
	 * TODO: rename Box2dModelNode.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/QuizNode.js'
	 */
	{child:"vle/node/box2dModel/Box2dModelNode.js", parent:["vle/node/Node.js"]},
	{child:'vle/lib/highcharts/highcharts.src.js', parent:[scriptloader.jquerySrc]},
	{child:'vle/lib/highcharts/highcharts-regression.js', parent:['vle/lib/highcharts/highcharts.src.js']},
	{child:'vle/lib/highcharts/technical-indicators.src.js', parent:['vle/lib/highcharts/highcharts.src.js']}
];

/*
 * TODO: rename box2dModel
 * For example if you are creating a quiz node and you want to use custom icons,
 * you would change it to 'quiz' and replace the 'box2dModel16.png' and 'box2dModel28.png'
 * files in the node's 'icons' directory with 'quiz16.png' and 'quiz28.png' 
 * (the icons should be png files with 16x16 and 28x28 pixels respectively)
 * 
 * TODO: rename Box2dModel
 * For example if you are creating a quiz node you would change it to
 * 'Quiz'
 * 
 * If you want to provide authors with multiple icon options for this node type,
 * add another entry to the nodeClasses array and add the corresponding icons
 * (using that nodeClass in the filenames) to the 'icons' directory
 */
var nodeClasses = [
	{nodeClass:'box2dModel', nodeClassText:'Box2dModel', icon:'node/box2dModel/icons/box2dModel28.png'}
];

/*
 * TODO: rename box2dModel
 * TODO: rename Box2dModelNode
 */
var nodeIconPath = 'node/box2dModel/icons/';
componentloader.addNodeIconPath('Box2dModelNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);

/*
 * TODO: rename box2dModel
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addScriptToComponent('box2dModel', studentVLEScripts);

scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);

scriptloader.addDependencies(dependencies);

/*
 * TODO: rename Box2dModelNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeClasses('Box2dModelNode', nodeClasses);

/*
 * TODO: rename the file path value
 * 
 * For example if you are creating a quiz node you would change it to
 * 'vle/node/quiz/quiz.css'
 */
var css = [
       	"vle/node/box2dModel/box2dModel.css",
       	"vle/node/box2dModel/libs/jquery-ui-1.9.0.custom.min.css"
];

/*
 * TODO: rename box2dModel
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addCssToComponent('box2dModel', css);

var nodeTemplateParams = [
	{
		/*
		 * TODO: rename the file path value
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'node/quiz/quizBox2dModel.qz'
		 */
		nodeTemplateFilePath:'node/box2dModel/box2dModelTemplate.b2m',
		
		/*
		 * TODO: rename the extension value for your step type, the value of the
		 * extension is up to you, we just use it to easily differentiate between
		 * different step type files
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'qz'
		 */
		nodeExtension:'b2m'
	}
];

/*
 * TODO: rename Box2dModelNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeTemplateParams('Box2dModelNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename box2dModel to your new folder name
	 * 
	 * For example if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/setup.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/box2dModel/setup.js');
};