<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="forgotaccount.selectaccounttype.findYourPassword" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
    
<script src="${contextPath}/<spring:theme code="generalsource"/>" type="text/javascript"></script>

</head>
<body>
<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="${contextPath}/index.html" title="<spring:message code="wiseHomepage" />"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.selectaccounttype.lostUsernameOrPassword"/></div>
				<div class="infoContentBox">
					<div id="lostSubHeader"><spring:message code="forgotaccount.selectaccounttype.whatSortofWISEAccount"/></div><br/>
					<div><a href="student/passwordreminder.html" class="wisebutton"><spring:message code="forgotaccount.selectaccounttype.studentAccount"/></a></div>
					<div><spring:message code="forgotaccount.selectaccounttype.or"/></div>
					<div><a href="teacher/index.html" class="wisebutton" style="margin-top:.25em;"><spring:message code="forgotaccount.selectaccounttype.teacherAccount"/></a></div>
				</div>
				<a href="${contextPath}/index.html" title="<spring:message code="wiseHome" />"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>	
</body>
</html>