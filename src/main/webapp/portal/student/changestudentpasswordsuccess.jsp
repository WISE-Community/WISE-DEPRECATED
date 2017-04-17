<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<%@ include file="../favicon.jsp"%>
<title><spring:message code="student.title"/></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
</head>
<body>
	<div class="infoContent">
		<div class="panelHeader"><spring:message code="changePassword"/></div>
		<div class="infoContentBox">
			<br/>
			<br/>
			<br/>
			<div class="errorMsgNoBg"><p><spring:message code="forgotaccount.changepasswordsuccess.passwordSuccessfullyChanged" /></p></div>
			<br/>
			<br/>
			<br/>
		</div>
	</div>
</body>
</html>
