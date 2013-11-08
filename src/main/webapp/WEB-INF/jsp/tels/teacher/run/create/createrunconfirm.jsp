<%@ include file="../../../include.jsp"%>

<!DOCTYPE html >
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherrunstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
    
<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="<spring:theme code="jquerycookiesource"/>"></script>
<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>

<title><spring:message code="teacher.run.create.createrunconfirm.settingUpAProjectRunStep1" /></title>

<script type="text/javascript">

	/* checks the cleaning variables and determines what on this page is displayed */
	window.onload = function(){
		if('${forceCleaning}'==='true'){
			/* show the cleaning div */
			document.getElementById('cleaningDiv').style.display = 'block';
			if('${isAllowedToClean}'==='true'){
				document.getElementById('cleaningAllowedDiv').style.display = 'block';
				enableCleaning();
			} else {
				document.getElementById('notAllowedButCleaningNeededDiv').style.display = 'block';
			};
		} else {
			enableRunCreation();
		};
	};

	/* enables the parts of this page needed to create a run */
	function enableRunCreation(){
		/* hide the cleaning divs */
		document.getElementById('cleaningDiv').style.display = 'none';
		document.getElementById('cleaningAllowedDiv').style.display = 'none';
		document.getElementById('notAllowedButCleaningNeededDiv').style.display = 'none';

		/* show the centered div, next and cancel buttons */
		document.getElementById('setUpRunBox').style.display = 'block';
		document.getElementById('prevButt').style.display = 'inline';
		document.getElementById('nextButt').style.display = 'inline';
	};

	/* launches the cleaning for this project */
	function runCleaning(allowed){
		document.getElementById('notAllowedButCleaningNeededDiv').style.display = 'none';
		var cleaning = document.getElementById('cleaningAllowedDiv');
		cleaning.style.display = 'block';

		cleaning.innerHTML = "<iframe name='cleaningFrm' id='cleaningFrm' scrolling='auto' width='100%' height='100%' frameborder='0'></iframe>";
		document.getElementById('cleaningFrm').src = '../../author/authorproject.html?command=launchAuthoring&param1=cleanProject&projectId=${project.id}';
		window.frames['cleaningFrm'].isOwner = allowed;
	};

	/* displays the html to run cleaing for this project */
	function enableCleaning(){
		var cleaning = document.getElementById('cleaningDisplayDiv');
		cleaning.innerHTML = '<spring:message code="teacher.run.create.createrunconfirm.weHaveDetectedNotCleaned" /><br/>' +
			'<spring:message code="teacher.run.create.createrunconfirm.beforeRunProjectMustBeCleaned" /> <a onclick="runCleaning(\'true\')"><font color="blue"><spring:message code="teacher.run.create.createrunconfirm.cleanTheProject" /></font></a> ' +
			'<spring:message code="teacher.run.create.createrunconfirm.forAnyProblemsDetected" />';
	};

	/* processes the results an allows the appropriate action based on the results */
	function processCleaningResults(results){
		var cleaning = document.getElementById('cleaningAllowedDiv');
		var html = '<div id="cleaningDisplayDiv" class="cleaner"></div>';
		
		cleaning.innerHTML = html;

		var displayHtml = '<b><spring:message code="teacher.run.create.createrunconfirm.cleaningResults" /> </b><br/><table><tbody><tr><td></td><td><spring:message code="teacher.run.create.createrunconfirm.numberProblemsDetected" /></td><td><spring:message code="teacher.run.create.createrunconfirm.numberProblemsResolved" /></td></tr>' +
		'<tr><td><spring:message code="teacher.run.create.createrunconfirm.severe" /></td><td>' + results.severe.detected + '</td><td>' + results.severe.resolved + '</td></tr>' +
		'<tr><td><spring:message code="teacher.run.create.createrunconfirm.warning" /></td><td>' + results.warning.detected + '</td><td>' + results.warning.resolved + '</td></tr>' +
		'<tr><td><spring:message code="teacher.run.create.createrunconfirm.notifications" /></td><td>' + results.notification.detected + '</td><td>' + results.notification.resolved + '</td></tr></tbody></table><br/><br/>'
	
		/* determine appropriate display based on results */
		if('${isAllowedToClean}'==='true'){
			/* if any severe problems detected equals resolved then we can proceed */
			if(results.severe.detected==results.severe.resolved){
				displayHtml += '<spring:message code="teacher.run.create.createrunconfirm.cleaningCompletedAllResolved" /> ' +
					'<a onclick="enableRunCreation()"><font color="blue"><spring:message code="teacher.run.create.createrunconfirm.setUpARun" /></font></a>.';
			/* otherwise, they need to re-run cleaning to continue */
			} else {
				displayHtml += '<spring:message code="teacher.run.create.createrunconfirm.cleaningCompletedNotAllResolved" /> ' +
					'<spring:message code="teacher.run.create.createrunconfirm.continuingToSetUpARun" /><br/><br/>' +
					'<a onclick="runCleaning(\'true\')"><font color="blue"><spring:message code="teacher.run.create.createrunconfirm.reRunCleaning" /></font></a>';
			};
		/* non-owner but severe detected, needs to contact run owner */
		} else if(results.severe.detected>0){
			displayHtml += '<spring:message code="teacher.run.create.createrunconfirm.severeProblems" /> <a onclick="sendCleanMessage()"><font color="blue">' +
					'<spring:message code="teacher.run.create.createrunconfirm.sendAMessage" /></font></a> <spring:message code="teacher.run.create.createrunconfirm.toTheOwner" /> ' +
					'<spring:message code="teacher.run.create.createrunconfirm.note" />';
		/* non-owner but no severe detected, can continue to set up run */
		} else {
			displayHtml += '<spring:message code="teacher.run.create.createrunconfirm.noSevereProblems" /> <a onclick="enableRunCreation()"><font color="blue"><spring:message code="teacher.run.create.createrunconfirm.setUpARun" /></font></a>.';
		};

		/* display the html */
		document.getElementById('cleaningDisplayDiv').innerHTML = displayHtml;
	};

	/**
	 * Sends a cleaning message to the owners of the project
	 */
	function sendCleanMessage(){
		/*
		if('${project.metadata}' && '${project.metadata.title}'){
			var projectName = '${project.metadata.title}';
		} else {
			var projectName = '${project.name}';
		};
		*/

		var projectName = '<c:out value="${project.name}" />';
		
		var body = '<spring:message code="teacher.run.create.createrunconfirm.helloIAm" /> ${currentUsername} <spring:message code="teacher.run.create.createrunconfirm.wouldLikeToRequestCleaning" /> ' + projectName +
				' <spring:message code="teacher.run.create.createrunconfirm.withProjectId" /> ${project.id} <spring:message code="teacher.run.create.createrunconfirm.soThatIMaySetUpRun" />';
		var postData = 'recipient=${projectOwners}&subject=<spring:message code="teacher.run.create.createrunconfirm.requestForProjectCleaning" />&body=' + body;
		var callback = {
				success:function(o){
					if(o.responseText != null && o.responseText == 'success'){
						var msg = '<font color="green"><spring:message code="teacher.run.create.createrunconfirm.messageWasSent" /></font>';
					} else {
						var msg = '<font color="red"><spring:message code="teacher.run.create.createrunconfirm.errorSendingMessage" /></font>';
					};
					
					document.getElementById('cleaningDisplayDiv').innerHTML = msg;
				},
				failure:function(o){
					document.getElementById('cleaningDisplayDiv').innerHTML = '<font color="red"><spring:message code="teacher.run.create.createrunconfirm.errorSendingMessage" /></font>';
				},
				scope:this
		};

		YAHOO.util.Connect.asyncRequest('POST', '/webapp/message.html?action=compose', callback, postData);
	};

</script>

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
		
	<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
	
	<div id="page">
			
		<div id="pageContent">
			
			<div class="contentPanel">
				<div class="panelHeader">
					<spring:message code="teacher.run.create.createrunconfirm.setupAClassroomRun" />
					<span class="pageTitle"><spring:message code="teacher.run.create.createrunconfirm.management"/></span>
				</div>
				<div class="panelContent">
					<div id="setUpRunBox" style='display:none;'>
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

					<div id='cleaningDiv' style='display:none;'>
						<div id='notAllowedButCleaningNeededDiv' style='display:none;' class='cleaner'>
							<spring:message code="teacher.run.create.createrunconfirm.weDetectedProjectNeedsCleaning"/> <a onclick='runCleaning("false")'><font color="blue"><spring:message code="teacher.run.create.createrunconfirm.cleanTheProject"/></font></a>
						</div>
						<div id='cleaningAllowedDiv' style='display:none;'>
							<div id='cleaningDisplayDiv' class='cleaner'></div>
						</div>
					</div>
					
					<!-- 
					FOR MON:
					BEFORE MOVING ON TO THE FINAL PAGE, MAKE REQUEST TO COPY PROJECT SYNCHRONOUSLY. IF SUCCESS, MOVE ON. ELSE, FAIL.
					 -->
					
					<div style="text-align:center;">
						<form method="post">
							<input type="submit" name="_target0" class="disabled" disabled value="<spring:message code="teacher.run.create.createrunconfirm.back" /> " style="display:none;" id='prevButt'/>
							<input type="submit" name="_cancel" value="<spring:message code="teacher.run.create.createrunconfirm.cancel" />" />
							<input type="submit" name="_target1" value="<spring:message code="teacher.run.create.createrunconfirm.next" />" style="display:none;" id='nextButt'/>
						</form>
					
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