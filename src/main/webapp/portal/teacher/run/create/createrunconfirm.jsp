<%@ include file="../../../include.jsp"%>

<!DOCTYPE html >
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.create.createrunconfirm.settingUpAProjectRunStep1" /></title>

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
<script src="${contextPath}/<spring:theme code="generalsource"/>" type="text/javascript"></script>

</head>
<body>
<!-- Support for Spring errors object -->
<spring:bind path="runParameters.project">
  <c:forEach var="error" items="${status.errorMessages}">
    <c:choose>
      <c:when test="${fn:length(error) > 0}" >
        <script type="text/javascript">
            alert("${error}");
        </script>
      </c:when>
    </c:choose>
  </c:forEach>
</spring:bind>
<div id="pageWrapper">
	<%@ include file="../../../headermain.jsp"%>
	<div id="page">
		<div id="pageContent">
			<div class="contentPanel">
				<div class="panelHeader">
					<spring:message code="teacher.run.create.createrunconfirm.setupAClassroomRun" />
					<span class="pageTitle"><spring:message code="teacher.run.create.createrunconfirm.management"/></span>
				</div>
				<div class="panelContent">
					<div id="setUpRunBox">
						<div id="stepNumber" class="sectionHead" style="padding-top:0;"><spring:message code="teacher.run.create.createrunconfirm.step1Of5"/>&nbsp;<spring:message code="teacher.run.create.createrunconfirm.confirmProject"/></div>
     	    	    	<div class="sectionContent">
     	    	    		<h5><spring:message code="teacher.run.create.createrunconfirm.thisProcessWillHelp"/>&nbsp;<spring:message code="teacher.run.create.createrunconfirm.classroomRun"/>&nbsp;<spring:message code="teacher.run.create.createrunconfirm.studentsWillBeAbleToRun"/><spring:message code="teacher.run.create.createrunconfirm.youCanCancel"/></h5>
							<h5><spring:message code="teacher.run.create.createrunconfirm.youHaveSelected"/>&nbsp;<spring:message code="teacher.run.create.createrunconfirm.projectToRun"/></h5>
							
							<div class="projectSummary projectBox">
								<div class="projectTitle">${project.name} (ID: ${project.id})</div> <!-- TODO: Add thumb, library icon and tag if library project, shared info -->
								<div class="summaryInfo">
									<div class="basicInfo">
										<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
										<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}">Grades ${project.metadata.gradeRange} | </c:if>
										<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}">Duration: ${project.metadata.totalTime} | </c:if>
										<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
										<div style="float:right;">Created: <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" /></div>
									</div>
									<div id="summaryText_${project.id}" class="summaryText"><span style="font-weight:bold;">Summary:</span> ${project.metadata.summary}</div>
									<div class="details" id="details_${project.id}">
										<c:if test="${project.metadata.keywords != null && project.metadata.keywords != ''}"><p><span style="font-weight:bold;">Tags:</span> ${project.metadata.keywords}</p></c:if>
										<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;">Tech Requirements:</span> ${project.metadata.techDetailsString}</p></c:if>
										<c:if test="${project.metadata.compTime != null && project.metadata.compTime != ''}"><p><span style="font-weight:bold;">Computer Time:</span> ${project.metadata.compTime}</p></c:if>
										<c:if test="${project.metadata.contact != null && project.metadata.contact != ''}"><p><span style="font-weight:bold;">Contact Info:</span> ${project.metadata.contact}</p></c:if>
										<c:if test="${project.metadata.author != null && project.metadata.author != ''}"><p><span style="font-weight:bold;">Contributors:</span> ${project.metadata.author}</p></c:if>
										<c:set var="lastEdited" value="${project.metadata.lastEdited}" />
										<c:if test="${lastEdited == null || lastEdited == ''}">
											<c:set var="lastEdited" value="${project.dateCreated}" />
										</c:if>
										<p><span style="font-weight:bold;">Last Updated:</span> <fmt:formatDate value="${lastEdited}" type="both" dateStyle="medium" timeStyle="short" /></p>
									</div>
								</div>
							</div>
							<h5>
								<spring:message code="teacher.run.create.createrunconfirm.ifThisIsCorrectProject"/>&nbsp;<em><spring:message code="teacher.run.create.createrunconfirm.next"/></em>&nbsp;<spring:message code="teacher.run.create.createrunconfirm.below"/>
							</h5>
     	    	    	</div>
     	    	    </div> <!-- /* End setUpRunBox */-->
					<div style="text-align:center;">
						<form method="post">
							<input id="goToPageInput" type="hidden" name="_page" value="1" />
							<input id="cancelButton" type="submit" name="_cancel" value="<spring:message code="teacher.run.create.createrunconfirm.cancel" />" />
							<input type="submit" name="_target1" value="<spring:message code="teacher.run.create.createrunconfirm.next" />" id='nextButt'/>
						</form>
					</div>
				</div>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->
	<%@ include file="../../../footer.jsp"%>
</div>
<script type="text/javascript">
$("#cancelButton").click(function() {
	$("#goToPageInput").remove();
});
</script>
</body>
</html>