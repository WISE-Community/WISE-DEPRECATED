<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<%@ include file="../favicon.jsp"%>
<title><spring:message code="teacher.registerTeacherConfirm.createAWiseAccount" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="registerstylesheet"/>" media="screen" rel="stylesheet" type="text/css" />

</head>
<body>
<div id="pageWrapper">
	<div id="page">
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="${contextPath}" title="<spring:message code="wiseHomepage"/>"><spring:message code="wise" /></a>
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
						<div><span class="usernameDisplay">${displayname}</span> <a href="account"><spring:message code="teacher.registerTeacherConfirm.edit"/></a></div>

					</div>
	  				<br /><div><a href="${contextPath}/login" class="wisebutton"><spring:message code="teacher.registerTeacherConfirm.signInToWise"/></a></div>
				</div>
			</div>
		</div>
	</div>
</div>
<%@ include file="../analytics.jsp" %>
</body>
</html>
