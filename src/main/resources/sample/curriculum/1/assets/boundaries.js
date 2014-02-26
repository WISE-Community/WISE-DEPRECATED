var num = "";
var file = "";

var stateCompleted = {items: [
   {id: "0", complete:false},
   {id: "1", complete:false},
   {id: "2", complete:false},
   {id: "3", complete:false},
   {id: "4", complete:false},
   {id: "5", complete:false},
   {id: "6", complete:false},
   ]
};

$(document).ready(function() {
	if(getLatestState()){
		stateCompleted = getLatestState();
	}
	for (var x in stateCompleted.items){
		if (stateCompleted.items[x].complete == true){
			var id = stateCompleted.items[x].id;
			$('#' + id).addClass('complete');
		}
	}
	
});


function isObject(targetID){

   var isFound = false;
   var el = document.getElementById(targetID);
   
   if(el && (el.nodeName === "OBJECT" || el.nodeName === "EMBED")){
      isFound = true;
   }
   
   return isFound;
}

//Support function: creates an empty
//element to replace embedded SWF object

function replaceSwfWithEmptyDiv(targetID){

   var el = document.getElementById(targetID);
   
   if(el){
   
      var div = document.createElement("div");
      el.parentNode.insertBefore(div, el);
 
      //Remove the SWF
      swfobject.removeSWF(targetID);
   
      //Give the new DIV the old element's ID
      div.setAttribute("id", "flashObject");
      
   }
   
}

function loadSWF(height, width, obj){
	var imgSrc = "";
	var facts = "<ul>";
	if (obj){
		$(".section li").each(function(){
            $(this).removeClass('active');
	    });
		num = obj.id;
		var section = $('#'+num);
		section.addClass('active');
		$.ajax({
            type: "GET",
            url: "assets/boundaries.xml",
            dataType: "xml",
            success: function(xml) {
				$(xml).find('boundary').each(function(){
	                    if ($(this).attr("id") == num){
	                    	file = "assets/" + $(this).find("url").text(); 
	                    	//imgSrc = "assets/" + $(this).find('img').text();
	                    	//$('#world-img').attr("src",imgSrc);
	                    	$('#type').html($(this).find('title').text());
	                    	//$(this).find('fact').each(function(){
	                    		//facts += "<li>" + $(this).text() + "</li>";
	                    	//});
	                    	//facts += "</ul>";
	                    	//$('#facts').html(facts);
	                    	load(height,width);
	                    }
	                });
            }
        });
		
	} else {
		file = "assets/intro.swf";
		load(height,width);
	}
};

function load(height,width){
   //Check for existing SWF
   if(isObject("flashObject")){
   
      //replace object/element with a new div
      replaceSwfWithEmptyDiv("flashObject");
      
   }


   //Embed SWF
   var flashvars = {file: file, id: num};
   var params = {};
   params.allowFullScreen = "true";
	var attributes = {};
	attributes.scale = "exactfit";
	attributes.id = "flashObject";
	swfobject.embedSWF('assets/boundaries-loader2.swf', "flashObject", width, height, "9.0.0", "expressInstall.swf", flashvars, params, attributes);
	   
}

function updateComplete(id){
	//alert("Animation " + id + " is complete.")
	var section = $('#' + id).parent().parent().attr("id");
	if(!$('#' + id).hasClass('complete')){
		stateCompleted.items[id].complete = true;
		var data = JSON.stringify(stateCompleted);
		$('#' + id).addClass('complete');
		saveToVLE(data,section);
	}
}

function saveToVLE(data,section){
	vle.saveState(data);
	/*var nodeId;
	if(section=="convergent"){
		nodeId = "node_35.or";
	} else if (section=="divergent"){
		nodeId = "node_36.or";		
	} else if(section=="transform"){
		nodeId = "node_37.or";
	}
	
	var complete = true;
	Check if section has been completed and pop up note if true
	$("#" + section).children("ul").children("li").each(function(){
		if(!$(this).hasClass("complete")){
			complete = false;
		}
	});
	if (complete == true){
		vle.renderNode(nodeId);
	}*/
}

function getLatestState(){
	var response = vle.getLatestStateForCurrentNode();
	if(response != ""){
		data = JSON.parse(response);
	} else {data="";}
	return data;
}
 