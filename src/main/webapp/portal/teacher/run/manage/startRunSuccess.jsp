<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.manage.startRunSuccess.successReactivatingArchivedRun"/></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<script type='text/javascript'>
var refreshRequired = true;
</script>
</head>
<body style="background:#FFF;">
	<div class="dialogContent">
		<div class="dialogSection">
			<div class="errorMsgNoBg">
				<p><spring:message code="teacher.run.manage.startRunSuccess.runSuccessfullyRestored"/></p>
				<p><spring:message code="teacher.run.manage.startRunSuccess.gradingAndSavingStudentWorkEnabled"/></p>
			</div>
		</div>
	</div>
</body>
</html>