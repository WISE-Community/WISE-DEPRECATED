<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.editrun.editRun"/></title>

<script type="text/javascript" src="${contextPath}/<spring:theme code="generalsource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<script type='text/javascript'>

    function writeMessage(msg){
		$('#msgDiv').html(msg);
		setTimeout(function(){$('#msgDiv').html('')}, 10000);
	}
    
    function getNotesJSON(privateOrPublic) {
    	var notesStr = "";
    	if (privateOrPublic == "private") {
    		notesStr = $("#privateNotes").html();
    	} else {
    		notesStr = $("#publicNotes").html();    		
    	}
		if (notesStr != "") {
			return JSON.parse(notesStr);		
		} else {
			return {"generalComments":""};
		}
    }

	$(document).ready(function() {
		// populate private and public notes textarea
		var privateNotes = getNotesJSON("private");
		$("#privateNotesTextarea").val(privateNotes.generalComments);

		var publicNotes = getNotesJSON("public");
		$("#publicNotesTextarea").val(publicNotes.generalComments);

		$(".save").click(function() {
			var privateNotes = getNotesJSON("private");
			privateNotes.generalComments = $("#privateNotesTextarea").val();
			var publicNotes = getNotesJSON("public");
			publicNotes.generalComments = $("#publicNotesTextarea").val();
			
			$.ajax(
					{   type:'POST', 
						url:'updaterun.html', 
						data:"command=saveNotes"+
							  "&runId="+$("#runId").html()+
							  "&privateNotes="+JSON.stringify(privateNotes)+
						      "&publicNotes="+JSON.stringify(publicNotes),						
						error:function() {
							alert('Failed to save notes. Please contact WISE Staff. Sorry about the inconvience.');
						}, 
						success:function() {
							writeMessage('<spring:message code="teacher.run.notes.saveSuccess"/>');
						}
					}
				  );
		});
	});
</script>
</head>
<body style="background:#FFFFFF;">
<div class="dialogContent">
	<div id="privateNotes" style="display:none;">${run.privateNotes}</div>
	<div id="publicNotes" style="display:none;">${run.publicNotes}</div>

	<div id="runId" style="display:none;">${run.id}</div>
	<div id='msgDiv'></div>
	
	<div id='runInfo' class="dialogSection">
		<span style='font-weight:bold'><spring:message code="teacher.run.notes.privateNotes"/></span><br/>
		<span style='font-color:gray'>Write any notes for this classroom run here. Only you will be able to see them.</span><br/>
		<textarea cols="100" rows="16" id='privateNotesTextarea'></textarea><br/>
		<input type="button"  class="save" value="<spring:message code='save'/>"></input><br/><br/>
		<hr style="border:1px solid gray"/>
		<span style='font-weight:bold'><spring:message code="teacher.run.notes.publicNotes"/></span><br/>
		<span style='font-color:gray'>If you have any advice, suggestions, or thoughts for other WISE teachers who will be running this project in their classroom, write them here.</span><br/>
		<textarea cols="100" rows="15" id='publicNotesTextarea'></textarea><br/>
		<input type="button" class="save" value="<spring:message code='save'/>"></input>
	</div>
</div>
</body>
</html>