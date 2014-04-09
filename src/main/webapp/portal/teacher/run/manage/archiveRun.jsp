<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
    
<title><spring:message code="teacher.run.manage.archiveRun.archiveClassroomRun"/></title>
</head>

<body style="background:#FFF;">

<div class="dialogContent">		

	<div class="sectionHead"><spring:message code="teacher.run.manage.archiveRun.archiveRun"/>: ${run.name}</div>	    	

	<div class="sectionContent" style="color:red;"><spring:message code="teacher.run.manage.archiveRun.areYouSureYouWantToEndRun"/></div>
	<div class="sectionContent"><spring:message code="teacher.run.manage.archiveRun.doNotArchiveUntilStudentsDone"/></div>
	<div class="sectionContent">
		<p class="info"><spring:message code="teacher.run.manage.archiveRun.noteWhenRunIsArchived"/></p>
		<p class="info"><spring:message code="teacher.run.manage.archiveRun.youCanReActiveArchivedRun"/></p>
	</div>
	
	<div class="sectionContent">
		<form method="post" action="archiveRun.html" id="archiveRun" autocomplete='off'>
		  <input type="hidden" name="runId" id="runId" value="${run.id}"></input>
		  <input type="hidden" name="command" id="command" value="archiveRun"></input>
		  <input type="submit" name="archiveproject" value="<spring:message code="teacher.run.manage.archiveRun.archiveProjectRun"/>" ></input>
		</form>	
	</div>

</div>

</body>
</html>