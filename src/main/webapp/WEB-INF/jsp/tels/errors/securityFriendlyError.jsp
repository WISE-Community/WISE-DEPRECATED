<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />

<title><spring:message code="errors.securityFriendlyError.accessDenied" /> <spring:message code="wiseHomepage" /></title>
</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage" />"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="infoContentBox">
					<div class="errorMsgNoBg">
						<p><spring:message code="errors.securityFriendlyError.accessDeniedNotEnoughPermissions" /></p>
					</div>
				</div>
				<a href="/webapp/index.html" title="<spring:message code="wiseHome" />"><spring:message code="wiseHomepage"/></a>
			</div>
		</div>
	</div>
</div>

</body>
</html>
