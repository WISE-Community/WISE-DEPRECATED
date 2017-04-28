<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<%@ include file="../favicon.jsp"%>
<title><spring:message code="forgotaccount.resetpassword.forgotUsernameOrPasswordTeacher"/></title>

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
				<div class="panelHeader"><spring:message code="forgotaccount.resetpassword.resetYourPassword" /></div>
					<div class="infoContentBox">
						<c:if test="${displayForgotPasswordSelectAccountTypeLink == false && displayLoginLink == false}">
							<div>
								<form id="submittedAccountPasswords" method="post" commandName="passwordReminderParameters" autocomplete='off'>
									<table id="submittedAccountPasswordTable" style="margin:0 auto;">
									<tr>
										<td><label id="passwordform" for="newPassword"><spring:message code="forgotaccount.resetpassword.newPassword" /></label></td>
										<td><input type="password" name="newPassword" id="newPassword" size="25" tabindex="1" /></td>
											<!-- 			Special script pulls focus onto immediately preceding Input field-->
							 				<script type="text/javascript">document.getElementById('newPassword').focus();
											</script>
										</tr>
									<tr>
										<td><label id="passwordform2" for="verifyPassword"><spring:message code="forgotaccount.resetpassword.verifyPassword" /></label></td>
										<td><input id="verifyPassword" name="verifyPassword" type="password" size="25" tabindex="2" /></td>
									</tr>
									<tr>
										<td colspan="2">
											<div id="finalPasswordReminderButtons">
											<input type="submit" name="_finish" value="SUBMIT" />
											</div>
										</td>
									</tr>
									</table>
								</form>
							</div>
						</c:if>
					<div class="errorMsgNoBg">
						<!-- Support for Spring errors object -->
						<spring:bind path="passwordReminderParameters.*">
						  <c:forEach var="error" items="${status.errorMessages}">
						    <b>
						      <p><c:out value="${error}"/></p>
						    </b>
						  </c:forEach>
						</spring:bind>
					</div>
					<c:if test="${displayForgotPasswordSelectAccountTypeLink == true}">
						<a id="forgotPasswordSelectAccountTypeLink" href="./selectaccounttype" title=""><spring:message code="forgotaccount.resetpassword.forgotUsernameOrPassword" /></a>
						<br>
						<br>
						<br>
						<br>
					</c:if>
					<c:if test="${displayLoginLink == true}">
						<div><spring:message code="forgotaccount.resetpassword.clickButtonToSignIn" /></div>
						<br>
						<a href="${contextPath}/login" class="wisebutton" style="margin-top:.25em;"><spring:message code="forgotaccount.resetpassword.signIn"/></a>
						<br>
						<br>
						<br>
						<br>
					</c:if>
				<a href="${contextPath}" title="<spring:message code="wiseHome" />"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>
</body>
</html>
