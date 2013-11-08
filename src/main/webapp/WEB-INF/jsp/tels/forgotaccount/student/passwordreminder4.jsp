<%@ include file="../../include.jsp"%>

<!DOCTYPE html>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />    
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<title><spring:message code="forgotaccount.student.passwordreminder4.passwordReminderStep4"/></title>
</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage"/>"><spring:message code="wise"/></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.student.passwordreminder4.studentLostUsernamePassword"/></div>
				<div class="infoContentBox">
					<div><spring:message code="forgotaccount.student.passwordreminder4.yourUsernameIsStill"/>&nbsp;<span style="font-weight:bold;">${username}.</span></div>
					<div class="errorMsgNoBg"><p><spring:message code="forgotaccount.student.passwordreminder4.yourPasswordHasBeenChanged"/></p></div>
					<div><spring:message code="forgotaccount.student.passwordreminder4.clickOnButtonToSignIn"/></div>
				</div>
				<a href="/webapp/login.html" class="wisebutton" style="margin-top:.25em;"><spring:message code="forgotaccount.student.passwordreminder4.signIn"/></a>
			</div>
		</div>
	</div>
</div>
</body>
</html>
