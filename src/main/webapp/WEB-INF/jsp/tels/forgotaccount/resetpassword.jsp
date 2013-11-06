<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
			    
<title><spring:message code="forgotaccount.resetpassword.forgotUsernameOrPasswordTeacher"/></title>
</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage" />"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.resetpassword.resetYourPassword" /></div>
					<div class="infoContentBox">
						<c:if test="${displayForgotPasswordSelectAccountTypeLink == false && displayLoginLink == false}">
							<div>
								<form id="submittedAccountPasswords" method="post" commandName="reminderParameters" autocomplete='off'>
									<table id="submittedAccountPasswordTable" style="margin:0 auto;">
									<tr>
										<td><label id="passwordform" for="send_passwords"><spring:message code="forgotaccount.resetpassword.newPassword" /></label></td>
										<td><input type="password" name="newPassword" id="newPassword" size="25" tabindex="1" /></td>
											<!-- 			Special script pulls focus onto immediately preceding Input field-->
							 				<script type="text/javascript">document.getElementById('newPassword').focus();
											</script>
										</tr>
									<tr>
										<td><label id="passwordform2" for="answer"><spring:message code="forgotaccount.resetpassword.verifyPassword" /></label></td>
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
						<spring:bind path="reminderParameters.*">
						  <c:forEach var="error" items="${status.errorMessages}">
						    <b>
						      <p><c:out value="${error}"/></p>
						    </b>
						  </c:forEach>
						</spring:bind>
					</div>
					<c:if test="${displayForgotPasswordSelectAccountTypeLink == true}">
						<a id="forgotPasswordSelectAccountTypeLink" href="./selectaccounttype.html" title=""><spring:message code="forgotaccount.resetpassword.forgotUsernameOrPassword" /></a>
						<br>
						<br>
						<br>
						<br>
					</c:if>
					<c:if test="${displayLoginLink == true}">
						<div><spring:message code="forgotaccount.resetpassword.clickButtonToSignIn" /></div>
						<br>
						<a href="/webapp/login.html" class="wisebutton" style="margin-top:.25em;"><spring:message code="forgotaccount.resetpassword.signIn"/></a>
						<br>
						<br>
						<br>
						<br>
					</c:if>
				<a href="/webapp/index.html" title="<spring:message code="wiseHome" />"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>

</body>
</html>



