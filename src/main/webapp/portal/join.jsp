<%@ include file="include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" /> 
<title><spring:message code="signup.title" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />

</head>
<body>
<div id="pageWrapper">
	<div id="page">
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="${contextPath}" title="<spring:message code="wiseHomepage"/>"></a>
			</div>
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="signup.header"/></div>
				<div class="infoContentBox">
					<h4><spring:message code="signup.accountType"/></h4>
					<div><a href="${contextPath}/student/join" class="wisebutton" title="<spring:message code="signup.student"/>"><spring:message code="signup.student"/></a></div>
					<div><a href="${contextPath}/teacher/join" class="wisebutton" title="<spring:message code="signup.teacher"/>"><spring:message code="signup.teacher"/></a></div>
					<div style="margin-top:1em;"><spring:message code="signup.whichAccount" /></div>
					<div class="instructions"><spring:message code="signup.studentDescription" /></div>
					<div class="instructions"><spring:message code="signup.teacherDescription" /></div>
				</div>
				<a href="${contextPath}" title="<spring:message code="wiseHomepage"/>"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>
</body>
</html>