var coreScripts = [
    /*
     * xTODO: rename template
     * xTODO: rename TemplateNode.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizNode.js'
     */
	'vle/node/explanationbuilder/ExplanationBuilderNode.js',
	/*
     * xTODO: rename template
     * xTODO: rename templateEvents.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizEvents.js'
	 */
	'vle/node/explanationbuilder/explanationBuilderEvents.js'
];

var coreMinScripts = [
    'vle/node/explanationbuilder/explanationbuilder_core_min.js'               
];
                      

var studentVLEScripts = [
    scriptloader.jquerySrc,
	scriptloader.jqueryUISrc,
	'vle/jquery/jquery-validation/jquery.validate.min.js',
	'vle/jquery/js/jquery.form.js',
	'vle/jquery/js/jsonplugin.js',
	//'vle/jquery/jquery-tools/jquery.tools.tooltip.min.js',
	'vle/jquery/miniTip/jquery.miniTip.min.js',
	'vle/ideaBasket/basket.js',
 	/*
     * xTODO: rename template
     * xTODO: rename template.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quiz.js'
	 */
	'vle/node/explanationbuilder/explanationBuilder.js',
	/*
     * xTODO: rename template
     * xTODO: rename templatestate.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quizstate.js'
	 */
	'vle/node/explanationbuilder/explanationbuilderstate.js'
];

var authorScripts = [
	/*
	 * xTODO: rename template
	 * xTODO: rename authorview_template.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/authorview_quiz.js'
	 */
	'vle/node/explanationbuilder/authorview_explanationbuilder.js'
];

var gradingScripts = [
  	/*
	 * xTODO: rename template
	 * xTODO: rename templatestate.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/quizstate.js'
	 */
	'vle/node/explanationbuilder/explanationbuilderstate.js',
	'vle/node/explanationbuilder/explanationBuilder.js'
];

var gradingMinScripts = [
    'vle/node/explanationbuilder/explanationbuilder_grading_min.js'                         
];
                        

var dependencies = [
  	/*
	 * xTODO: rename template
	 * xTODO: rename TemplateNode.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/QuizNode.js'
	 */
	{child:"vle/node/explanationbuilder/ExplanationBuilderNode.js", parent:["vle/node/Node.js"]},
	{child:"vle/jquery/jquery-validation/jquery.validate.min.js", parent:[scriptloader.jquerySrc]},
	{child:"vle/jquery/js/jquery.form.js", parent:[scriptloader.jquerySrc]},
	//{child:"vle/jquery/jquery-tools/jquery.tools.tooltip.min.js", parent:[scriptloader.jquerySrc]}
	{child:"vle/jquery/miniTip/jquery.miniTip.min.js", parent:[scriptloader.jquerySrc]}
];

var css = [
       	scriptloader.jqueryUICss,
       	"vle/css/ideaManager/blue/style.css",
       	"vle/jquery/miniTip/miniTip.css",
       	"vle/css/ideaManager/basket.css",
       	"vle/node/explanationbuilder/explanation.css",
       	"vle/node/common/css/stepContent.css",
       	"vle/css/ideaManager/jquery-validate/cmxformTemplate.css"
];

var nodeClasses = [
	{nodeClass:'codeit', nodeClassText:'Explanation Builder', icon:'node/explanationbuilder/icons/codeit28.png'}
];

var nodeIconPath = 'node/explanationbuilder/icons/';
componentloader.addNodeIconPath('ExplanationBuilderNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreMinScripts);

/*
 * xTODO: rename template
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addScriptToComponent('explanationbuilder', studentVLEScripts);

scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingMinScripts);
scriptloader.addDependencies(dependencies);
scriptloader.addCssToComponent('explanationbuilder', css);

componentloader.addNodeClasses('ExplanationBuilderNode', nodeClasses);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/explanationbuilder/explanationBuilderTemplate.eb',
		nodeExtension:'eb'
	}
];

componentloader.addNodeTemplateParams('ExplanationBuilderNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * xTODO: rename template to your new folder name
	 * 
	 * For example if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/setup.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/explanationbuilder/setup.js');
};