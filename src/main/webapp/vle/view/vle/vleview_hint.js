/**
 * Display hints for the current step.
 * Hints will popup in a dialog and each hint will
 * be in its own tab
 * 
 * TODO: Internationalize!
 */
View.prototype.showStepHints = function() {
	$('#hintsLink').stop();
	$('#hintsLink').css('color','#FFFFFF');
	
	var currentNode = this.getCurrentNode();
	
	// hide all dialogs
	this.utils.closeDialogs();
	
	// show the hints panel
    $('#hintsPanel').dialog('open');
		
	// log when hint was opened
	var hintState = new HINTSTATE({action:"hintopened",nodeId:currentNode.id});
	currentNode.view.pushHintState(hintState);
	
	// by default, the first part is selected.
	var hintState = new HINTSTATE({"action":"hintpartselected","nodeId":currentNode.id,"partindex":0});
	currentNode.view.pushHintState(hintState);
};

View.prototype.displayHint = function(){	
	/* set hints link in nav bar if hint exists for this step
	 * populate hints panel with current node's hints
	 * */
	var currentNode = this.getCurrentNode(); //get the node the student is currently on
	var hints = currentNode.getHints(); // get the hints object for the current node
    if (currentNode.getHints() != null && currentNode.getHints().hintsArray != null && currentNode.getHints().hintsArray.length > 0) {
    	//var hintTerm = '';
    	//if(hints.hintTerm && this.utils.isNonWSString(hints.hintTerm)){
    		//hintTerm = hints.hintTerm;
    	//} else {
    		//hintTitle = this.getI18NString("hint_hint");
    	//}
    	
    	var hintTitle = '';
    	if(hints.hintTermPlural && this.utils.isNonWSString(hints.hintTermPlural)){
    		hintTitle = this.utils.capitalize(hints.hintTermPlural);
    	} else {
    		hintTitle = this.getI18NString("hint_title");
    	}
    	
    	var hintsLink = "<a id='hintsLink' onclick='eventManager.fire(\"showStepHints\")' title='"+this.getI18NString("hint_button_title")+hintTitle+"'>"+hintTitle+"</a>";
    	$('#hints').empty().html(hintsLink);
	
		var numHints = hints.hintsArray.length; //get the number of hints for current node
		
		function highlight(){
			$('#hintsLink').animate({
				color: '#FFE347'
			}, {
				duration: 1000,
				complete: function(){
					$('#hintsLink').animate({
						color: '#FFFFFF'
					}, {
						duration: 1000,
						complete: function(){
							highlight();
						}
					});
				}
			});
		}
		
		var modal = false;
		if(typeof hints.isModal == 'boolean'){
			modal = hints.isModal;
		}

		var isMustViewAllPartsBeforeClosing = false;
		if(typeof hints.isMustViewAllPartsBeforeClosing == 'boolean'){
			isMustViewAllPartsBeforeClosing = hints.isMustViewAllPartsBeforeClosing;
		}

		//check if the hintsDiv div exists
	    if($('#hintsPanel').size()==0){
	    	//the show hintsDiv does not exist so we will create it
	    	$('<div id="hintsPanel"></div>').dialog(
			{	autoOpen:false,
				closeText:'Close',
				modal:modal,
				show:{effect:"fade",duration:200},
				hide:{effect:"fade",duration:200},
				title:hintTitle,
				//zindex:9999,
				width:600,
				height:'auto',
				open: function(){
					$(this).parent().css('z-index',9999);
				},
				resizable:true    					
			}).on( "dialogbeforeclose", {view:currentNode.view}, function(event, ui) {
				// check if isMustViewAllPartsBeforeClosing is true. If true, check if this is the first time they view the hints, and student has viewed all parts.
				var currHints = event.data.view.getCurrentNode().getHints();
				if ($(this).data("uiDialog").isOpen() && currHints && currHints.isMustViewAllPartsBeforeClosing && event.data.view.getState()) {
					
					var studentHasSeenAllParts = false;
					var nodeVisitsForThisNode = event.data.view.getState().getNodeVisitsByNodeId(event.data.view.getCurrentNode().id);
					for (var h=0;h<nodeVisitsForThisNode.length; h++) { // h is for hints
						var nodeVisitForThisNode = nodeVisitsForThisNode[h];
						if (nodeVisitForThisNode.hintStates) {
							var hintPartIdsViewedInThisVisit = [];  // keep track of all hint parts the student viewed during this node visit
							for (var z=0;z<nodeVisitForThisNode.hintStates.length;z++) {  // z is for zebra
								var nodeVisitHintState = nodeVisitForThisNode.hintStates[z];
								if (nodeVisitHintState.data.action == "hintpartselected") {
									if (hintPartIdsViewedInThisVisit.indexOf(nodeVisitHintState.data.partindex) == -1) {
										hintPartIdsViewedInThisVisit.push(nodeVisitHintState.data.partindex);
									};
								};
							};
							// after going thru the hintstates in this nodevisit, see if they visited all hint parts by checking if the size match
							if (hintPartIdsViewedInThisVisit.length == currHints.hintsArray.length) {
								studentHasSeenAllParts = true;
								break;
							};
						};
					};

					if (!studentHasSeenAllParts) {
				    	// student can't close the hints yet because they haven't viewed all parts
						var hintTermPlural = event.data.view.getI18NString("hint_plural");
						if(typeof hints.hintTermPlural == 'string'){
							hintTermPlural = hints.hintTermPlural;
						}
						
						var you_must_view_all = event.data.view.getI18NStringWithParams("hints_viewAll", [hintTermPlural]);
						
						$(".hintMsg").html(you_must_view_all);
				    	return false;
				    };
				};
				
			    // before the dialog closes, save hintstate
		    	if ($(this).data("uiDialog").isOpen()) {	    		    		
		    		var hintState = new HINTSTATE({"action":"hintclosed","nodeId":event.data.view.getCurrentNode().id});
		    		event.data.view.pushHintState(hintState);
		    		//$('#hintsHeader').html('&nbsp').addClass('visited');
		    	};
		    }).on( "tabsselect", {view:currentNode.view}, function(event, ui) {
	    		var hintState = new HINTSTATE({"action":"hintpartselected","nodeId":event.data.view.getCurrentNode().id,"partindex":ui.index});
	    		event.data.view.pushHintState(hintState);
		    });
	    };
		
	    // append hints into one html string
	    var hintsStringPart1 = "";   // first part will be the <ul> for text on tabs
	    var hintsStringPart2 = "";   // second part will be the content within each tab
	    var hintsArr = hints.hintsArray;
	    
	    var contentBaseUrl = this.config.getConfigParam("getContentBaseUrl");
	    for (var i=0; i< hintsArr.length; i++) {
	    	var currentHint = hintsArr[i];
	    	var nextLink = '<span class="tabNext">'+this.getI18NString("hint_next")+'</span>';
	    	var prevLink = '<span class="tabPrev">'+this.getI18NString("hint_prev")+'</span>';
	    	if(i==0){
	    		prevLink = '';
	    		if(numHints<2){
	    			nextLink = '';
	    		}
	    	} else if (i==numHints-1){
	    		nextLink = '';
	    	}
	    	var href = location.href;
	    	hintsStringPart1 += "<li><a href='" + href + "#tabs-"+i+"'>"+hintTitle+" "+(i+1)+"</a></li>";
	    	hintsStringPart2 += "<div id='tabs-"+i+"'>"+
	    	    "<div class='hintMsg' id='hintMsg'></div>"+
		    	"<div class='hintHeader'>"+ (i+1) + ' ' + this.getI18NString("hint_num_separator") + ' ' + numHints + "</div>"+
		    	"<div class='hintText'>"+currentHint+"</div>"+
		    	"<div class='hintControls'>" + prevLink + nextLink + "</div>"+
	    		"</div>";
	    }
	    hintsStringPart1 = "<ul>" + hintsStringPart1 + "</ul>";

	    hintsString = "<div id='hintsTabs'>" + hintsStringPart1 + hintsStringPart2 + "</div>";
	    //set the html into the div
	    $('#hintsPanel').html(hintsString);

	    // initialize tabs
		var $tabs = $("#hintsTabs").tabs();
		
		// bind tab navigation link clicks
		$('.tabPrev').click(function(){
			$(".hintMsg").html("");
			var selected = $tabs.tabs('option', 'active');
			if(selected != 0){
				$tabs.tabs('option', 'active', selected-1);
			}
			//eventManager.fire("adjustHintSize");
		});
		
		// bind tab navigation links
		$('.tabNext').click(function(){
			$(".hintMsg").html("");
			var selected = $tabs.tabs('option', 'active');
			if(selected < numHints-1){
				$tabs.tabs('option', 'active', selected+1);
			}
			//eventManager.fire("adjustHintSize");
		});
		
		// check if forceShow is set
		var forceShow = currentNode.getHints().forceShow;
		if (forceShow == "always") {  // always force show hints
			setTimeout(function(){ // TODO: remove - for some reason, if this timeout isn't set and the hints dialog is modal, it does not show the modal overlay
				this.eventManager.fire("showStepHints");
			},1000);
		} else if (forceShow == "firsttime") {  // only show hints if this is the first time
		    var nodeVisitArray = view.getState().getNodeVisitsByNodeId(currentNode.id);
		    if (nodeVisitArray.length == 1) {  // if this is the first time, the first nodevisit will already be created.
		    	setTimeout(function(){ // TODO: remove - for some reason, if this timeout isn't set and the hints dialog is modal, it does not show the modal overlay
					this.eventManager.fire("showStepHints");
				},1000);
		    }
		} else {
			var nodeVisitArray = view.getState().getNodeVisitsByNodeId(currentNode.id);
		    if (nodeVisitArray.length == 1) {  // if this is the first time and hint is never shown automatically, highlight hints link.
		    	highlight();
		    }
		}
    } else {
    	$("#hints").empty();
    }
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_hint.js');
}