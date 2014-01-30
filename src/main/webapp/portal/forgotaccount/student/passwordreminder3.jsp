<%@ include file="../../include.jsp"%>

<!DOCTYPE html>


<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />  
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<title><spring:message code="forgotaccount.student.passwordreminder3.passwordReminderStep3"/></title>
</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="${contextPath}/index.html" title="<spring:message code="wiseHomepage"/>"><spring:message code="wise"/></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.student.passwordreminder3.studentLostUsernamePassword"/></div>
				<div class="infoContentBox">
					<div class="errorMsgNoBg"><spring:message code="forgotaccount.student.passwordreminder3.thatAnswerIsCorrect"/></div>
					<div>
						<form id="submittedAccountPasswords" method="post" commandName="passwordReminderParameters" autocomplete='off'>
							<table id="submittedAccountPasswordTable" style="margin:0 auto;">
							<tr>
								<td><label id="passwordform" for="send_passwords"><spring:message code="forgotaccount.student.passwordreminder3.newPassword" />:</label></td>
								<td><input type="password" name="newPassword" id="newPassword" size="25" tabindex="1" /></td>
									<!-- 			Special script pulls focus onto immediately preceding Input field-->
					 				<script type="text/javascript">document.getElementById('newPassword').focus();
									</script>
								</tr>
							<tr>
								<td><label id="passwordform2" for="answer"><spring:message code="forgotaccount.student.passwordreminder3.verifyPassword" /></label></td>
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
				<div class="errorMsgNoBg">
					<!-- Support for Spring errors object -->
					<spring:bind path="passwordReminderParameters.*">
					  <c:forEach var="error" items="${status.errorMessages}">
					    <b>
					      <p><c:out value="${error}" escapeXml="false"/></p>
					    </b>
					  </c:forEach>
					</spring:bind>
				</div>
			</div>
			<a href="${contextPath}/index.html" title="<spring:message code="wiseHome"/>"><spring:message code="returnHome"/></a>
		</div>
	</div>
</div>
</body>
</html>
