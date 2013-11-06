<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="registerstylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
  
<title><spring:message code="teacher.registerTeacherConfirm.createAWiseAccount" /></title>

<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="<spring:theme code="utilssource"/>"></script>
<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
</head>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage"/>"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="teacher.registerTeacherConfirm.teacherRegistration"/></div>
				<div class="infoContentBox">
					<div>
						<h4><spring:message code="teacher.registerTeacherConfirm.accountCreated"/></h4>
						<h4><spring:message code="teacher.registerTeacherConfirm.yourNewUsernameIs"/>&nbsp;<span class="usernameDisplay">${username}</span></h4>
						
						<div><spring:message code="teacher.registerTeacherConfirm.pleaseMemorizeUsername"/></div>
					    <div class="instructions"><spring:message code="teacher.registerTeacherConfirm.noteThereAreNoSpaces"/> <spring:message code="teacher.registerTeacherConfirm.aNumberMayBeAppended"/></div>
						
						<br /><div><spring:message code="teacher.registerTeacherConfirm.yourNameDisplayedAs"/></div>
						<div><span class="usernameDisplay">${displayname}</span> <a href="management/updatemyaccountinfo.html"><spring:message code="teacher.registerTeacherConfirm.edit"/></a></div>
								
					</div>
	  				<br /><div><a href="/webapp/login.html" class="wisebutton"><spring:message code="teacher.registerTeacherConfirm.signInToWise"/></a></div>
				</div>
			</div>
		</div>
	</div>
</div>

</body>

</html>




