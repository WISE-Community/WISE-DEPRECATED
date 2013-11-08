
View.prototype.studentResponseBoxSizeManager = function() {
	this.view;
};

View.prototype.studentResponseBoxSizeManager.dispatcher = function(type, args, obj) {
	if(type=='stepStudentResponseBoxSizeChanged') {
		obj.updateStudentResponseBoxSize();
	}
};

View.prototype.studentResponseBoxSizeManager.insertStudentResponseBoxSize = function(view) {
	this.view = view;
	$('#studentResponseBoxSizeContainer').append($('#studentResponseBoxSizeDiv').show().detach());
	
	this.view.populateStudentResponseBoxSize();
};

View.prototype.studentResponseBoxSizeManager.cleanupStudentResponseBoxSize = function() {
	$('body').append($('#studentResponseBoxSizeDiv').hide().detach());
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/components/authorview_studentresponseboxsize.js');
};