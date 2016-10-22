<%@ include file="../../../include.jsp"%>

<!DOCTYPE html >
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.create.createrunarchive.settingUpAProjectRunStep2" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" />
    
<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>

</head>
<body>
<div id="pageWrapper">

	<%@ include file="../../../headermain.jsp"%>
		
	<div id="page">
			
		<div id="pageContent">
			
			<div class="contentPanel">
				<div class="panelHeader">
					<spring:message code="teacher.run.create.createrunarchive.setupAClassroomRun" />
					<span class="pageTitle"><spring:message code="teacher.run.create.createrunarchive.management"/></span>
				</div>
				<form:form method="post" commandName="runParameters" autocomplete='off'>
				
				<div class="panelContent">
				
				<div id="setUpRunBox">
							<div id="stepNumber" class="sectionHead"><spring:message code="teacher.run.create.createrunarchive.step2Of5"/>&nbsp;<spring:message code="teacher.run.create.createrunarchive.archiveExistingProjectRuns"/></div>
							<div class="sectionContent">
	
								<h5><spring:message code="teacher.run.create.createrunarchive.yourActiveClassroomRuns"/></h5>
								<h5><spring:message code="teacher.run.create.createrunarchive.whenYouArchive"/></h5>
								<h5><spring:message code="teacher.run.create.createrunarchive.archiveRunInformation"/></h5>
	
								<c:choose>
									<c:when test="${fn:length(existingRunList) == 0}">
								      <h5 style="font-weight:bold;"><spring:message code="teacher.run.create.createrunarchive.youAreNotRunningAny"/></h5>
									</c:when>
									<c:otherwise>
										<div id="setupProjectTableContainer">
											<table  id="setupProjectTable" class="wisetable">
												<thead>
													<tr>
														<th><spring:message code="teacher.run.create.createrunarchive.checkToArchive"/></th>
														<th><spring:message code="teacher.run.create.createrunarchive.projectTitle"/></th>
														<th><spring:message code="teacher.run.create.createrunarchive.runId"/></th>
														<th><spring:message code="teacher.run.create.createrunarchive.runCreatedOn"/></th>
														<th><spring:message code="teacher.run.create.createrunarchive.lastRevisionOn"/></th>
													</tr>
												</thead>
											    <c:forEach var="run" items="${existingRunList}">
												    <tr>
												     <td class="center">
												     
												     <!-- CHECKBOXES -->
													    <div class="runcheckboxes">
													       <form:checkbox path="runIdsToArchive" value="${run.id}" /><br/> 
													    </div>
													 <!-- END CHECKBOXES -->
											    <!--end of SetUpRunBox -->
												     </td>
													        <td><strong>${run.project.name}</strong></td>
													        <td>${run.id}</td>
													        <td>${run.starttime.month + 1}/${run.starttime.date}/${run.starttime.year + 1900}</td>
													        <td>${run.endtime}</td>
												     </tr>
												</c:forEach>
											</table>
										</div>
										<h5><spring:message code="teacher.run.create.createrunarchive.ifYouDoNotWish"/>&nbsp;<em><spring:message code="teacher.run.create.createrunarchive.next"/></em>&nbsp;<spring:message code="teacher.run.create.createrunarchive.toContinue"/></h5>
									</c:otherwise>
									
								</c:choose>
							
							</div>
						</div> <!-- /* End setUpRunBox */-->
											<div class="center">
					
						    <input id="goToPageInput" type="hidden" name="_page" value="2" />
	   						<input id="goBackButton" type="submit" name="_back" value="<spring:message code="teacher.run.create.createrunperiods.back"/>"/>
							<input id="cancelButton" type="submit" name="_cancel" value="<spring:message code="teacher.run.create.createrunarchive.cancel" />" />
							<input type="submit" name="_target2" value="<spring:message code="teacher.run.create.createrunarchive.next" />" id='nextButt' />
							</div>
						
					</div>
				</form:form>
				
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->

	<%@ include file="../../../footer.jsp"%>
</div>
<script type="text/javascript">
$("#goBackButton").click(function() {
	$("#goToPageInput").val("0");	
});

$("#cancelButton").click(function() {
	$("#goToPageInput").remove();
});
</script>
</body>
</html>