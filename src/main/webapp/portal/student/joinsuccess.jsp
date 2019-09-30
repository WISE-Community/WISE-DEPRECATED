<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<%@ include file="../favicon.jsp"%>
<title><spring:message code="student.registerstudentsuccess.registerStudentSuccess" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="registerstylesheet"/>" media="screen" rel="stylesheet" type="text/css" />

<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="generalsource"/>"></script>

</head>
<body>
<div id="pageWrapper">

	<div id="page">

		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="${contextPath}/legacy" title="WISE Homepage"><spring:message code="wise" /></a>
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
					<div><a href="join" class="wisebutton"><spring:message code="student.registerstudentsuccess.createNewAccount"/></a></div>
					<div><spring:message code="student.registerstudentsuccess.startUsingWISE"/></div>
					<div><a href="${contextPath}/legacy/login" class="wisebutton"><spring:message code="student.registerstudentsuccess.signIn"/></a></div>
				</div>
			</div>
		</div>
	</div>
</div>
<%@ include file="../analytics.jsp" %>
</body>
</html>
