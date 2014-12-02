
function renderDragAndDrop(){
	$('.bucket_ul').sortable({
		connectWith:'.bucket_ul',
		tolerance: 'pointer',
		forcePlaceholderSize: true,
		revert: 100,
		over: function(e, ui){
			ui.placeholder.parent().addClass('over');
		},
		out: function(e, ui){
			ui.placeholder.parent().removeClass('over');
		},
		stop: function(e, ui){
			ui.item.parent().removeClass('over');
			
			// update the match sequence
			ms.orderSourceBucket();
			ms.addOrderingToChoices();
			ms.saveState();
			
			//check if we can enable the check answer button
			if(ms.canSubmitButtonBeEnabled()) {
				ms.enableCheckAnswerButton();						
			}
		}
	});
	$('.bucket_ul').disableSelection();
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/matchsequencedragdrop.js');
}