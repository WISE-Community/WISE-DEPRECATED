var coreScripts = [
    /*
     * TODO: rename highchartsTest
     * TODO: rename HighchartsTestNode.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizNode.js'
     */
	'vle/node/highchartsTest/HighchartsTestNode.js',
	/*
     * TODO: rename highchartsTest
     * TODO: rename highchartsTestEvents.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizEvents.js'
	 */
	'vle/node/highchartsTest/highchartsTestEvents.js'
];

var studentVLEScripts = [
	scriptloader.jquerySrc,
	scriptloader.jqueryUISrc,
 	/*
     * TODO: rename highchartsTest
     * TODO: rename highchartsTest.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quiz.js'
	 */
	'vle/node/highchartsTest/highchartsTest.js',
	/*
     * TODO: rename highchartsTest
     * TODO: rename highchartsTestState.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/highchartsTest/highchartsTestState.js',
	'vle/lib/highcharts/highcharts.src.js',
	'vle/lib/highcharts/highcharts-regression.js',
	'vle/lib/highcharts/technical-indicators.src.js'
];

var authorScripts = [
	/*
	 * TODO: rename highchartsTest
	 * TODO: rename authorview_highchartsTest.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/authorview_quiz.js'
	 */
	'vle/node/highchartsTest/authorview_highchartsTest.js'
];

var gradingScripts = [
  	/*
	 * TODO: rename highchartsTest
	 * TODO: rename highchartsTestState.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/highchartsTest/highchartsTestState.js'
];

var dependencies = [
  	/*
	 * TODO: rename highchartsTest
	 * TODO: rename HighchartsTestNode.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/QuizNode.js'
	 */
	{child:"vle/node/highchartsTest/HighchartsTestNode.js", parent:["vle/node/Node.js"]},
	{child:'vle/lib/highcharts/highcharts.src.js', parent:[scriptloader.jquerySrc]},
	{child:'vle/lib/highcharts/highcharts-regression.js', parent:['vle/lib/highcharts/highcharts.src.js']},
	{child:'vle/lib/highcharts/technical-indicators.src.js', parent:['vle/lib/highcharts/highcharts.src.js']}
];

/*
 * TODO: rename highchartsTest
 * For example if you are creating a quiz node and you want to use custom icons,
 * you would change it to 'quiz' and replace the 'highchartsTest16.png' and 'highchartsTest28.png'
 * files in the node's 'icons' directory with 'quiz16.png' and 'quiz28.png' 
 * (the icons should be png files with 16x16 and 28x28 pixels respectively)
 * 
 * TODO: rename HighchartsTest
 * For example if you are creating a quiz node you would change it to
 * 'Quiz'
 * 
 * If you want to provide authors with multiple icon options for this node type,
 * add another entry to the nodeClasses array and add the corresponding icons
 * (using that nodeClass in the filenames) to the 'icons' directory
 */
var nodeClasses = [
	{nodeClass:'highchartsTest', nodeClassText:'HighchartsTest'}
];

/*
 * TODO: rename highchartsTest
 * TODO: rename HighchartsTestNode
 */
var nodeIconPath = 'node/highchartsTest/icons/';
componentloader.addNodeIconPath('HighchartsTestNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreScripts);

/*
 * TODO: rename highchartsTest
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addScriptToComponent('highchartsTest', studentVLEScripts);

scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);

scriptloader.addDependencies(dependencies);

/*
 * TODO: rename HighchartsTestNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeClasses('HighchartsTestNode', nodeClasses);

/*
 * TODO: rename the file path value
 * 
 * For example if you are creating a quiz node you would change it to
 * 'vle/node/quiz/quiz.css'
 */
var css = [
       	"vle/node/highchartsTest/highchartsTest.css"
];

/*
 * TODO: rename highchartsTest
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addCssToComponent('highchartsTest', css);

var nodeTemplateParams = [
	{
		/*
		 * TODO: rename the file path value
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'node/quiz/quizHighchartsTest.qz'
		 */
		nodeTemplateFilePath:'node/highchartsTest/highchartsTestTemplate.hct',
		
		/*
		 * TODO: rename the extension value for your step type, the value of the
		 * extension is up to you, we just use it to easily differentiate between
		 * different step type files
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'qz'
		 */
		nodeExtension:'hct'
	}
];

/*
 * TODO: rename HighchartsTestNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeTemplateParams('HighchartsTestNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename highchartsTest to your new folder name
	 * 
	 * For example if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/setup.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/highchartsTest/setup.js');
};