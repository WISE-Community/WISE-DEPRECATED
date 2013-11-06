<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="homepagestylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
    
<title><spring:message code="contact.contactwiseconfirm.contactWISEGeneralIssues" /></title>
</head>
<body>

<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>
	
	<div id="page">
		
		<div id="pageContent">
		
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="contact.contactwiseconfirm.contactWISE"/></div>
				<div class="infoContentBox">
					<div><spring:message code="contact.contactwiseconfirm.messageSent" /></div>
					<div><spring:message code="contact.contactwiseconfirm.messageSuccessfullySent" /></div>
					<div><spring:message code="contact.contactwiseconfirm.weWillRespondQuicklyAsPossible" /></div>
				</div>
				<a href="/webapp/index.html" title="<spring:message code="wiseHome"/>"><spring:message code="returnHome"/></a>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page -->
	
	<%@ include file="../footer.jsp"%>
</div>
</body>
</html>