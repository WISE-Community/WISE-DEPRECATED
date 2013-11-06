/**
 * The following four variables are used for setting and using the
 * appropriate icons for the nodes.
 * 
 * Note: the variables in this file are no longer used
 */
var iconUrlOld = 'images/stepIcons/UCCP/';
var nodeTypesOld = ['HtmlNode', 'BrainstormNode', 'FillinNode', 'MatchSequenceNode', 'MultipleChoiceNode', 
		'NoteNode', 'JournalEntryNode', 'OutsideUrlNode', 'OpenResponseNode', 'BlueJNode', 'DrawNode',
		'DataGraphNode', 'MySystemNode', 'SVGDrawNode', 'MWNode', 'AssessmentListNode', 'ChallengeNode',
		'BranchNode', 'SensorNode', 'ExplanationBuilderNode'];
var nodeClassesOld = [['intro', 'curriculum', 'display', 'cartoon', 'codeit', 'simulation', 'movie', 'homework', 'summary'],
			['brainstorm', 'qadiscuss'],
			['fillblank'],
			['matchsequence'],
			['multiplechoice'],
			['note'],
			['journal'],
			['www'],
			['openresponse'],
			['codeit'],
			['quickdraw'],
			['datatable'],
			['mysystem'],
			['quickdraw'],
			['simulation'],
			['instantquiz', 'teacherquiz'],
			['instantquiz'],
			['multiplechoice'],
			['simulation'],
			['codeit']];
var nodeClassTextOld = [['Introductory Page', 'Curriculum Page', 'Display Page', 'Cartoon Page', 'Coding Page', 'Simulation Page', 'Movie Page', 'Homework Page', 'Summary Page'],
			['Brainstorm session', 'Q&A Discussion'],
			['Fill the Blank'],
			['Match & Sequence'],
			['Multiple Choice'],
			['Reflection Note (popup)'],
			['Journal Question'],
			['WWW Page'],
			['Open Response'],
			['Code it'],
			['Drawing'],
			['Data Graph'],
			['My System'],
			['Drawing'],
			['Molecular Workbench'],
			['Survey 1', 'Survey 2'],
			['Challenge Question'],
			['Multiple Choice Branch'],
			['Sensor'],
			['Explanation Builder']];

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/util/icon.js');
}