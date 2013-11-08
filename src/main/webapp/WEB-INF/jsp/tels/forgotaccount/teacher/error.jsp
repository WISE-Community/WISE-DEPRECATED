<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />	
<title><spring:message code="forgotaccount.teacher.error.forgotUsernameOrPassword"/></title>
</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage" />"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.teacher.error.lostUsernameOrPassword"/></div>
				<div class="infoContentBox">
					<div class="errorMsgNoBg"> 
						<p><span style="font-weight:bold;">${email}${username}:</span> <spring:message code="forgotaccount.teacher.error.usernameEmailDoesNotMatch"/></p>
					</div>
					<div><a href="index.html"><spring:message code="forgotaccount.teacher.error.tryAgain"/></a></div>
				</div>
				<a href="/webapp/index.html" title="<spring:message code="wiseHome" />"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>
 
</body>
</html>

