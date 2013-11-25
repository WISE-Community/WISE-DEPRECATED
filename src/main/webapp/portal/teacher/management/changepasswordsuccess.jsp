<%@ include file="../../include.jsp"%>

<!DOCTYPE html>

<html lang="en">
<head>

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<title><spring:message code="manageAccount"/></title>
</head>

<body>

<div id="pageWrapper">

	<%@ include file="../headerteacher.jsp"%>
	
	<div id="page">
		
		<div id="pageContent">
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
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->
	
	<%@ include file="../../footer.jsp"%>
</div>
	
</body>
</html>