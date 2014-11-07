<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
	<title><spring:message code="teacher.run.manage.endRunSuccess.archiveRunSuccess"/></title>
	<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
	<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />

	<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script> 
	<script type="text/javascript" src="${contextPath}/<spring:theme code="jqueryuisource"/>"></script>
</head>
<body style="background:#FFF;">
	<div class="dialogContent">
		<div class="dialogSection errorMsgNoBg">
			<p>
				<spring:message code="teacher.run.manage.endRunSuccess.classroomRunSuccessfullyEnded"/>
				<spring:message code="teacher.run.manage.endRunSuccess.runMovedToArchivedSection"/>
			</p>
			<p>
				<input id="runSurveyButton" type="button" value="<spring:message code="teacher.run.manage.endRunSuccess.pleaseTakeSurvey"/>"></input>
			</p>
		</div>
	</div>
	
	<script type="text/javascript">
	// setup survey dialog
	$('#runSurveyButton').on('click',function(){
		window.open("${contextPath}/teacher/run/survey.html?runId=" + ${run.id});
	});
	</script>
</body>
</html>