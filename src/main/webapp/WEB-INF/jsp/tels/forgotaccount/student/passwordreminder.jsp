<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />  
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
   
<script type="text/javascript" src="../../javascript/tels/general.js"></script>	
<script type="text/javascript" src="../../javascript/tels/effects.js"></script>	

<title><spring:message code="forgotaccount.student.passwordreminder.forgotPasswordStudentReminder"/></title>
</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage" />"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.student.passwordreminder.studentLostUsernamePassword"/></div>
				<div class="infoContentBox">
					<div><spring:message code="forgotaccount.student.passwordreminder.step1"/>: <spring:message code="forgotaccount.student.passwordreminder.enterYourWISEUsername"/>:</div>
					<div>
						<form:form id="username" name="retrievepassword" method="post" commandName="reminderParameters" autocomplete='off'>
							<label style="font-weight:bold;" for="send_username"><spring:message code="forgotaccount.student.passwordreminder.username" />:</label>
				  			<input class="dataBoxStyle" type="text" name="username" id="userName" size="20" tabindex="1" />
				 			
							<!-- 			Special script pulls focus onto immediately preceding Input field-->
				 			<script type="text/javascript">document.getElementById('userName').focus();
							</script> 
				
							<input style="margin-left:20px; text-align:center;width:55px;" type="submit" id="next" name="_target1" value="<spring:message code="forgotaccount.student.passwordreminder.next" />" />
						</form:form>
					</div>
					<div class="instructions"><spring:message code="forgotaccount.student.passwordreminder.remember"/></div>
					<div class="errorMsgNoBg">
						<!-- Support for Spring errors object -->
						<spring:bind path="reminderParameters.*">
						  <c:forEach var="error" items="${status.errorMessages}">
						    <p><c:out value="${error}"/></p>
						  </c:forEach>
						</spring:bind>
					</div>
					<div><a id="forgotUsernameLink" href="searchforstudentusername.html"><spring:message code="forgotaccount.student.passwordreminder.iCantRememberUsername"/></a></div>
				</div>
				<a href="/webapp/index.html" title="<spring:message code="wiseHome" />"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>

</body>
</html>
