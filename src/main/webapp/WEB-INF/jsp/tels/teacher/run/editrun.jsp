<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<title><spring:message code="teacher.run.editrun.editRun"/></title>

<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<script type='text/javascript'>
	var runUpdated = false;
	
	function updateRunTitle(runId){
		$('#msgDiv').html('');
		var val = $('#editRunTitleInput').val();

		/* validate user entered value */
		if(!val || val==''){
			writeMessage('<spring:message code="teacher.run.editrun.mustSpecifyTitle"/>');
			return;
		}

		$.ajax({type:'POST', url:'updaterun.html', data:{command:'updateTitle',runId:runId,title:val}, error:updateFailure, success:updateTitleSuccess});
	}

	function updateRunPeriod(runId){
		$('#msgDiv').html('');
		var val=$.trim($('#editRunPeriodsInput').val());

		/* validate user entered value */
		if(!val || val==''){
			writeMessage('<spring:message code="teacher.run.editrun.mustSpecifyPeriod"/>');
			return;
		} else if (val != val.match( /[A-Za-z0-9 ]*/ )) {
			writeMessage('<spring:message code="teacher.run.editrun.periodMustBeAlphanumeric"/>');
			return;
		} else if ($("#period_"+val+"").length > 0) {
			writeMessage('<spring:message code="teacher.run.editrun.alreadyHavePeriodWithThisName"/>');
			return;			
		}

		$.ajax({type:'POST', url:'updaterun.html', data:'command=addPeriod&runId=' + runId + '&name=' + val, error:updateFailure, success:updatePeriodSuccess});
	}

	function writeMessage(msg){
		$('#msgDiv').html(msg);
		setTimeout(function(){$('#msgDiv').html('')}, 10000);
	}

	function updateSuccess(){
		writeMessage('<spring:message code="teacher.run.editrun.successfullyUpdatedRunSettings"/>');
	}
	
	function updateTitleSuccess(){
		runUpdated = true;
		writeMessage('<spring:message code="teacher.run.editrun.successfullyUpdatedRunTitle"/>');
	}

	function updateFailure(){
		writeMessage('<spring:message code="teacher.run.editrun.errorUpdatingRunInformation"/>');
	}

	function updatePeriodSuccess(){
		runUpdated = true;
		var val = $('#editRunPeriodsInput').val();
		$('#existingPeriodsList').append('<li><spring:message code="teacher.run.editrun.periodName"/> <span id="period_'+val+'">' + val + "</span></li>");
		writeMessage('<spring:message code="teacher.run.editrun.periodSuccessfullyAdded"/>');
	}

	$(document).ready(function() {		
		$(".runInfoOption").bind("click", function() {
			$('#msgDiv').html('');
			var runId = $("#runId").html();
			var infoOptionName = this.id;
			var isEnabled = this.checked;

			$.ajax({type:'POST', url:'updaterun.html', data:'command='+infoOptionName+'&runId=' + runId + '&isEnabled=' + isEnabled, error:updateFailure, success:updateSuccess});
			
			if(infoOptionName == 'enableXMPP' && isEnabled == false) {
				//hide the Classroom Monitor link because the teacher has enabled xmpp
				$('#runId\\=' + runId + '\\&gradingType\\=monitor', window.parent.document).hide();
			} else if(infoOptionName == 'enableXMPP' && isEnabled == true) {
				//show the Classroom Monitor link because the teacher has disabled xmpp
				$('#runId\\=' + runId + '\\&gradingType\\=monitor', window.parent.document).show();
			}
		});
	});
</script>
</head>
<body style="background:#FFFFFF;">
<div class="dialogContent">
	<div id="runId" style="display:none;">${run.id}</div>
	<div id='msgDiv'></div>
	<div id="editRunTitleDiv" class="dialogSection">
		<spring:message code="teacher.run.editrun.runTitle"/> <input id="editRunTitleInput" class="dialogTextInput" type="text" size="40" value="<c:out value='${run.name}' />"/><input type="button" value="<spring:message code="teacher.run.editrun.updateTitle"/>" onclick="updateRunTitle('${run.id}')"/>
	</div>
	<div id='runInfo' class="dialogSection">
		<!-- <c:choose>
			<c:when test="${run.studentAssetUploaderEnabled}">
				<input id='enableStudentAssetUploader' class='runInfoOption' type="checkbox" checked="checked"></input>Enable Student File Uploader
			</c:when>
			<c:otherwise>
				<input id='enableStudentAssetUploader' class='runInfoOption' type="checkbox"></input>Enable Student File Uploader
			</c:otherwise>
		</c:choose>
		<br/> -->
		<c:choose>
			<c:when test="${run.XMPPEnabled}">
				<input id='enableXMPP' class='runInfoOption' type="checkbox" checked="checked"></input><spring:message code="teacher.run.editrun.enableClassroomMonitor"/>
			</c:when>
			<c:otherwise>
				<input id='enableXMPP' class='runInfoOption' type="checkbox"></input><spring:message code="teacher.run.editrun.enableClassroomMonitor"/>
			</c:otherwise>
		</c:choose>
	</div>
	<div class="sectionHead"><spring:message code="teacher.run.editrun.existingClassPeriods"/></div>
	<div id="editRunPeriodsDiv" class="dialogSection">
		<div id="editRunPeriodsExistingPeriodsDiv">
			<ul id="existingPeriodsList">
				<c:forEach var="period" items="${run.periods}">
					<li><spring:message code="teacher.run.editrun.periodName"/> <span id="period_${period.name}">${period.name}</span></li>
				</c:forEach>
			</ul>
		</div>
	</div>
	<div class="sectionHead"><spring:message code="teacher.run.editrun.addANewPeriod"/></div>
	<div class="dialogSection">
		<div id="editRunPeriodsAddPeriodDiv">
			<div><spring:message code="teacher.run.editrun.enterPeriodName"/> <input id="editRunPeriodsInput" class="dialogTextInput" type="text" size="10"/><input type="button" value="<spring:message code="teacher.run.editrun.addPeriod"/>" onclick="updateRunPeriod('${run.id}')"/></div>
		</div>
		<div class="buffer"></div>
	</div>
</div>
</body>
</html>