<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.create.createrunfinish.classroomRunCreated" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherrunstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" >
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="generalsource"/>" type="text/javascript" ></script>

</head>
<body>
<div id="pageWrapper">
	<%@ include file="../../../headermain.jsp"%>
	<div id="page">
		<div id="pageContent">
			
			<div class="contentPanel">
				<div class="panelHeader">
					<spring:message code="teacher.run.create.createrunfinish.setupAClassroomRun" />
					<span class="pageTitle"><spring:message code="teacher.run.create.createrunfinish.management"/></span>
				</div>
				
				<div class="panelContent">

					<div>
						<div class="sectionHead"><spring:message code="teacher.run.create.createrunfinish.classroomRunCreated"/></div>
						<div class="sectionContent">
		
							<h5><spring:message code="teacher.run.create.createrunfinish.newRunHasBeenPlaced"/>&nbsp;<a href="${contextPath}/teacher/management/classroomruns.html"><spring:message code="teacher.run.create.createrunfinish.gradeAndManageClassroomRuns"/></a>&nbsp;<spring:message code="teacher.run.create.createrunfinish.section"/></h5>
			
							<table id="projectRunConfirmTable">
								<tr>
									<td style="font-weight:bold;"><spring:message code="teacher.run.create.createrunfinish.title" /></td>
									<td><c:out value="${run.project.name}" /></td>
								</tr>
								<tr>
									<td style="font-weight:bold;"><spring:message code="teacher.run.create.createrunfinish.projectId" /></td>
									<td><c:out value="${run.project.id}" /> <span class="instructions"><spring:message code="teacher.run.create.createrunfinish.everyProjectHasUniqueId" /></span></td>
								</tr>
								<tr>
									<td style="font-weight:bold;"><spring:message code="teacher.run.create.createrunfinish.runId" /></td>
									<td><strong><span id="runId"><c:out value="${run.id}" /></span></strong> <span class="instructions"><spring:message code="teacher.run.create.createrunfinish.everyRunHasUniqueId" /></span></td>
								</tr>
								<tr>
									<td style="font-weight:bold;"><spring:message code="teacher.run.create.createrunfinish.runCreated" /></td>
									<td><strong><c:out value="${run.starttime}" /></strong></td>
								</tr>
								<tr>
									<td style="font-weight:bold; width:170px;"><spring:message code="teacher.run.create.createrunfinish.studentAccessCode" /></td>
									<td style="color: #FF563F;">
								    	<div id="runCode" style="font-weight:bold; font-size:1.25em; margin-top:0;"><c:out value="${run.runcode}" /></div>
								    	<span><spring:message code="teacher.run.create.createrunfinish.everyRunHasUniqueAccessCode" /></span>
								    </td>
								</tr>
							</table>
						</div>
					</div>
					<div style="margin-top:1em;">
						<a id="myClassroomRunLink" class="wisebutton" style="margin:0 auto;" href="${contextPath}/teacher/management/classroomruns.html"><spring:message code="teacher.run.create.createrunfinish.myClassroomRuns"/></a>
					</div>
				</div>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->
	<%@ include file="../../../footer.jsp"%>
</div>
</body>
</html>