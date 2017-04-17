<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<%@ include file="../../favicon.jsp"%>
<title><spring:message code="teacher.run.editrun.editRun"/></title>

<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<script type='text/javascript'>
    function writeMessage(msg){
		$('#msgDiv').html(msg);
		setTimeout(function(){$('#msgDiv').html('')}, 10000);
	}

    function getNotesJSON() {
    	var notesStr = $("#privateNotes").html();
		if (notesStr != "") {
			return JSON.parse(notesStr);
		} else {
			return {"generalComments":""};
		}
    }

	$(document).ready(function() {
		// populate private notes textarea
		var privateNotes = getNotesJSON();
		$("#privateNotesTextarea").val(privateNotes.generalComments);

		$(".save").click(function() {
			var privateNotes = getNotesJSON("private");
			privateNotes.generalComments = $("#privateNotesTextarea").val();

			$.ajax(
					{   type:'POST',
						url:'updaterun.html',
						data:"command=saveNotes"+
							  "&runId="+$("#runId").html()+
							  "&privateNotes="+JSON.stringify(privateNotes),
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

	<div id="runId" style="display:none;">${run.id}</div>
	<div id='msgDiv'></div>

	<div id='runInfo' class="dialogSection">
		<span style='font-color:gray'>Write any personal notes for this classroom run here. Other users will not be able to see them.</span><br/>
		<textarea cols="100" rows="14" id='privateNotesTextarea'></textarea><br/>
		<input type="button"  class="save" value="<spring:message code='save'/>"></input>
	</div>
</div>
</body>
</html>
