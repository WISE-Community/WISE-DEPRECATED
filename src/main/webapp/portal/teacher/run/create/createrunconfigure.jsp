<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.create.createrunconfigure.settingUpAProjectRunStep4" /></title>

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
<div id="pageWrapper">
	<%@ include file="../../../headermain.jsp"%>
		
	<div id="page">
			
		<div id="pageContent">
			
			<div class="contentPanel">
				<div class="panelHeader">
					<spring:message code="teacher.run.create.createrunconfigure.setupAClassroomRun" />
					<span class="pageTitle"><spring:message code="teacher.run.create.createrunconfigure.management"/></span>
				</div>
				<form:form method="post" commandName="runParameters" autocomplete='off'>
					<div class="panelContent">
						<div id="setUpRunBox">
							<div id="stepNumber" class="sectionHead"><spring:message code="teacher.run.create.createrunconfigure.step4Of5"/>&nbsp;<spring:message code="teacher.run.create.createrunconfigure.configureTheRun"/></div>
							<div class="sectionContent">

								<h5><spring:message code="teacher.run.create.createrunconfigure.selectNumberStudentsInWorkgroup"/>&nbsp;<spring:message code="teacher.run.create.createrunconfigure.next"/>.</h5>


								<h5 style="margin:.5em;">
									<spring:message code="teacher.run.create.createrunconfigure.howManyStudentsPerComputer"/><br/>
									<form:radiobutton path="maxWorkgroupSize" value='1'/><spring:message code="teacher.run.create.createrunconfigure.always1"/><br/>
									<form:radiobutton path="maxWorkgroupSize" value='${maxWorkgroupSize}'/><spring:message code="teacher.run.create.createrunconfigure.1to"/>${maxWorkgroupSize} <spring:message code="teacher.run.create.createrunconfigure.studentsPerComputer"/>
								</h5>
								<h5 style="margin:.5em;">
									<spring:message code="teacher.run.create.createrunconfigure.enableRealTimeStudentMonitoring"/> (<spring:message code="teacher.run.create.createrunconfigure.enableRealTimeStudentMonitoringInformation"/> <a href="${contextPath}/pages/teacherfaq.html#realtime" target="_blank"><spring:message code="teacher.run.create.createrunconfigure.enableRealTimeStudentMonitoringFAQ"/></a>)<br/>
									<form:radiobutton path="enableRealTime" value='true'/><spring:message code="teacher.run.create.createrunconfigure.enableRealTimeRadioButtonLabel"/><br/>
									<form:radiobutton path="enableRealTime" value='false'/><spring:message code="teacher.run.create.createrunconfigure.disableRealTimeRadioButtonLabel"/>
								</h5>
							</div>
						</div>
						<div class="center">
							<input id="goToPageInput" type="hidden" name="_page" value="4" />
							<input id="goBackButton" type="submit" name="_back" value="<spring:message code="teacher.run.create.createrunperiods.back"/>"/>
							<input id="cancelButton" type="submit" name="_cancel" value="<spring:message code="teacher.run.create.createrunconfigure.cancel"/>" />
							<input type="submit" name="_target4" value="<spring:message code="teacher.run.create.createrunconfigure.next"/>" id='nextButt' />
						</div>
					</div>
				</form:form>
				<form:form method="post" commandName="runParameters" autocomplete='off'>
				    <input id=goToPageField" type="hidden" name="_page" value="2" />
				</form:form>
				
											
				
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->

	<%@ include file="../../../footer.jsp"%>
</div>
<script type="text/javascript">
$("#goBackButton").click(function() {
	$("#goToPageInput").val("2");	
});
$("#cancelButton").click(function() {
	$("#goToPageInput").remove();
});
</script>
</body>
</html>