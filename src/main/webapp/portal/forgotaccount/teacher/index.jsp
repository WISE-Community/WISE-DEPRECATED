<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<%@ include file="../../favicon.jsp"%>
<title><spring:message code="forgotaccount.teacher.index.forgotUsernameOrPassword"/></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

</head>
<body>
<div id="pageWrapper">

	<div id="page">

		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="${contextPath}" title="<spring:message code="wiseHomepage" />"><spring:message code="wise" /></a>
			</div>

			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.teacher.index.lostUsernameOrPassword"/></div>
				<div class="infoContentBox">

					<form id="forgotAccountForm" method="post" action="${contextPath}/forgotaccount/teacher" commandName="userDetails" autocomplete='off'>
						<div>
						 <h4><spring:message code="forgotaccount.teacher.index.rememberUsernameButForgotPassword"/></h4>
						 <div><spring:message code="forgotaccount.teacher.index.enterYourUsername"/><br/><spring:message code="forgotaccount.teacher.index.aLinkToChangePasswordWillBeSentToEmail"/></div>
				 		<div>
					 		<label for="username" /><spring:message code="forgotaccount.teacher.index.username" />:
							<input type="text" id="username" name="username" size="30" tabindex="1" />
							<input type="submit" name="sendpassword" id="sendpassword" value="<spring:message code="forgotaccount.teacher.index.changePassword"/>" />
						</div>
						 </div>

						<div><spring:message code="forgotaccount.teacher.index.or"/></div>

						<h4><spring:message code="forgotaccount.teacher.index.forgotYourUsername"/></h4>
						<div><spring:message code="forgotaccount.teacher.index.enterTheEmailAddressWhenRegistering"/> <br/> <spring:message code="forgotaccount.teacher.index.yourUsernameWillBeSentToEmail"/></div>
						<div>
							<label for="emailAddress" /><spring:message code="forgotaccount.teacher.index.email" />:
							<input type="text" name="emailAddress" id="emailAddress" size="40" tabindex="2" />
							<input type="submit" name="sendemailAndPwd" id="sendEmailAndPwd" value="<spring:message code="forgotaccount.teacher.index.sendUsername"/>" />
						</div>

						<div><spring:message code="forgotaccount.teacher.index.ifYoureStillStuck"/> <a href="${contextPath}/contact/contactwise.html"><spring:message code="forgotaccount.teacher.index.contactWISE"/></a></div>

					 </form>
				</div>
				<a href="${contextPath}/index.html" title="<spring:message code="wiseHome" />"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>
</body>
</html>
