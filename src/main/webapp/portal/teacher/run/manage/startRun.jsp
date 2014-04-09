<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
    
<title><spring:message code="teacher.run.manage.startRun.restoreClassroomRun"/></title>
</head>

<body style="background:#FFF;">

<div class="dialogContent">		

	<div class="sectionHead"><spring:message code="teacher.run.manage.startRun.restoreClassroomRun"/></div>

	<form method="post" action="startRun.html" id="startRun" autocomplete='off'>
	  <input type="hidden" name="runId" id="runId" value="${run.id}" ></input>
	  <input type="hidden" name="command" id="command" value="unArchiveRun"></input>
	  <input type="submit" name="cancelarchive" value="<spring:message code="teacher.run.manage.startRun.reActivateRun"/>" />
	</form>
</div>
</body>
</html>