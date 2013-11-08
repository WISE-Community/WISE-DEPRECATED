<%@ include file="../../include.jsp"%>

<!DOCTYPE html>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" /> 
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<title><spring:message code="forgotaccount.student.passwordreminder2.passwordReminderStep2"/></title>
</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage" />"><spring:message code="wiseHome" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.student.passwordreminder2.studentLostUsernamePassword"/></div>
				<div class="infoContentBox">
					<div><spring:message code="forgotaccount.student.passwordreminder2.step2"/></div>
					<div><spring:message code="forgotaccount.student.passwordreminder2.hello"/>, ${username}. <spring:message code="forgotaccount.student.passwordreminder2.answerPasswordReminderQuestion"/></div>
					<form id="submittedAccountAnswer" method="post" commandName="reminderParameters" autocomplete='off'>
						<div><spring:message code="forgotaccount.student.passwordreminder2.question"/>: <spring:message code="forgotaccount.student.passwordreminder2.${accountQuestion}"/></div>
						<div class="forgotPasswordInstructionText3">
							<label for="send_accountanswer"><spring:message code="forgotaccount.student.passwordreminder2.answer"/>:</label>
							<input type="text" name="submittedAccountAnswer" id="submittedAnswer"  class="dataBoxStyle"
						  			style="width: 250px;" tabindex="1" />
						  	
				 			<script type="text/javascript">document.getElementById('submittedAnswer').focus();
				 			</script>
						  	
						  	<input style="margin-left:20px; text-align:center;width:55px;" type="submit" name="_target2" value="<spring:message code="forgotaccount.student.passwordreminder2.next" />">
						</div>
					</form>

					<div class="errorMsgNoBg">
							<!-- Support for Spring errors object -->
							<spring:bind path="reminderParameters.*">
							  <c:forEach var="error" items="${status.errorMessages}">
							    <p><c:out value="${error}"/></p>
							  </c:forEach>
							</spring:bind>
					</div>
				</div>
				<a href="/webapp/index.html" title="<spring:message code="wiseHome" />"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>

</body>
</html>
