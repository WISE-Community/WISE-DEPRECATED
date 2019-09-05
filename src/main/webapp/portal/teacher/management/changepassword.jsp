<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<%@ include file="../../favicon.jsp"%>
<title><spring:message code="manageAccount"/></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
</head>
<body>
<div id="pageWrapper">

	<%@ include file="../../headermain.jsp"%>

	<div id="page">

		<div id="pageContent">

			<div class="infoContent">
				<div class="panelHeader"><spring:message code="changePassword"/></div>
				<div class="infoContentBox">

					<div>
						<form:form method="post" action="changepassword.html" modelAttribute="changeStudentPasswordParameters" id="changestudentpassword" autocomplete='off'>
						<table style="margin:0 auto;">
							<tr>
								<td><label for="changestudentpassword">
									<c:choose>
										<c:when test="${changeStudentPasswordParameters.teacherUser != null}">
											<!-- teacher is changing the password for another user -->
											(${changeStudentPasswordParameters.teacherUser.userDetails.username})
										</c:when>
										<c:otherwise>
											<!-- user is changing their own password, don't show who should be typing their password -->
										</c:otherwise>
									</c:choose>
									<spring:message code="changePassword_current" /></label></td>
				      			<td><form:password path="passwd0" /></td>
							</tr>
							<tr>
							<td><label for="changestudentpassword">
								<c:if test="${changeStudentPasswordParameters.teacherUser != null}">
									<!-- another user is trying to change this user's password, so show should be typing this password -->
									(${changeStudentPasswordParameters.user.userDetails.username})
								</c:if>
								<spring:message code="changePassword_new" /></label></td>
					      	<td><form:password path="passwd1" /></td>
							</tr>
							<tr>
							<td><label for="changestudentpassword">
								<c:if test="${changeStudentPasswordParameters.teacherUser != null}">
									<!-- another user is trying to change this user's password, so show should be typing this password -->
									(${changeStudentPasswordParameters.user.userDetails.username})
								</c:if>
								<spring:message code="changePassword_confirm" /></label></td>
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
						<div><a href="updatemyaccount"><spring:message code="cancel"/></a></div>

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
