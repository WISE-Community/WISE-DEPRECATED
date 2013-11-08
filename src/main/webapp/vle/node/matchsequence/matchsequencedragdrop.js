
function renderDragAndDrop(){
	$('#play ul').sortable(
			{
				connectWith:'ul',
				stop:function(e,ui){
					/* update the match sequence */
					ms.orderSourceBucket();
					ms.addOrderingToChoices();
					ms.saveState();
					
					//check if we can enable the check answer button
					if(ms.canSubmitButtonBeEnabled()) {
						ms.enableCheckAnswerButton();						
					}
				}
			});
	$('#play ul').disableSelection();
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/matchsequencedragdrop.js');
}