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
	
					<div>
						<form:form method="post" action="changepassword.html" commandName="changeStudentPasswordParameters" id="changestudentpassword" autocomplete='off'>
						<table style="margin:0 auto;">
							<sec:authorize ifNotGranted="ROLE_ADMINISTRATOR">
								<tr>
									<td><label for="changestudentpassword"><spring:message code="changePassword_current" /></label></td>
					      			<td><form:password path="passwd0" /></td>
								</tr>
							</sec:authorize>
							<tr>
							<td><label for="changestudentpassword"><spring:message code="changePassword_new" /></label></td>
					      	<td><form:password path="passwd1" /></td>
							</tr>
							<tr>
							<td><label for="changestudentpassword"><spring:message code="changePassword_confirm" /></label></td>
							<td><form:password path="passwd2" /></td>
							</tr>
						</table>

								<div class="errorMsgNoBg">
									<!-- Support for Spring errors object -->
									<spring:bind path="changeStudentPasswordParameters.*">
										<c:forEach var="error" items="${status.errorMessages}">
											<p>
												<c:out value="${error}" />
											</p>
										</c:forEach>
									</spring:bind>
								</div>

						<div><input type="submit" value="<spring:message code="saveChanges"/>"/></div>
						<div><a href="updatemyaccount.html"><spring:message code="cancel"/></a></div>
					
						</form:form>
					 	
				 	</div>
 				</div>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->
	
	<%@ include file="../../footer.jsp"%>
</div>
	
</body>
</html>