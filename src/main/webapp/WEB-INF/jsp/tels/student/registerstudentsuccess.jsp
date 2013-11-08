<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="registerstylesheet"/>" media="screen" rel="stylesheet" type="text/css" />

<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="<spring:theme code="utilssource"/>"></script>
<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
  
<title><spring:message code="student.registerstudentsuccess.registerStudentSuccess" /></title>

</head>


<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="WISE Homepage"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="student.registerstudentsuccess.studentRegistration"/></div>
				<div class="infoContentBox">
					<div>
						<h4><spring:message code="student.registerstudentsuccess.accountCreated"/></h4>
						<h4><spring:message code="student.registerstudentsuccess.newUsername"/> <span class="usernameDisplay">${username}</span></h4>
						<div style="color:#ff563f;"><spring:message code="student.registerstudentsuccess.writeDownUserInfo"/></div>
					    <div class="instructions"><spring:message code="student.registerstudentsuccess.rememberUsername"/></div>
					    <div class="instructions"><spring:message code="student.registerstudentsuccess.usernameExample"/></div>
					</div>
					<div><spring:message code="student.registerstudentsuccess.registerMoreTeammates"/></div>
					<div><a href="registerstudent.html" class="wisebutton"><spring:message code="student.registerstudentsuccess.createNewAccount"/></a></div>
					<div><spring:message code="student.registerstudentsuccess.startUsingWISE"/></div>
					<div><a href="/webapp/login.html" class="wisebutton"><spring:message code="student.registerstudentsuccess.signIn"/></a></div>
				</div>
			</div>
		</div>
	</div>
</div>

</body>

</html>




