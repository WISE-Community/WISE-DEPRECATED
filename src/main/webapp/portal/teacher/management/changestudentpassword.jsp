<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>
    
<title><spring:message code="changePassword" /></title>

</head>
<body style="background:#FFFFFF;">

<div class="dialogContent">		

	<div class="sectionHead"><spring:message code="changePassword" /></div>

	<form:form method="post" action="changestudentpassword" modelAttribute="changeStudentPasswordParameters" id="changestudentpassword" autocomplete='off'>
    <c:if test="${!changeStudentPasswordParameters.teacherUser.getUserDetails().isGoogleUser()}">
      <div class="sectionContent">
        <label><spring:message code="teacher.management.changestudentpassword.typeTeacherPassword" /></label>
        <form:password path="passwd0" />
      </div>
    </c:if>

		<div class="sectionContent">
			<label><spring:message code="teacher.management.changestudentpassword.typeStudentPassword" /></label>
			<form:password path="passwd1"/>
		</div>
		<div class="sectionContent">
			<label><spring:message code="teacher.management.changestudentpassword.typeStudentPasswordAgain" /></label>
			<form:password path="passwd2"/>
		</div>
		
		<div class="errorMsgNoBg">
			<!-- Support for Spring errors object -->
			<spring:bind path="changeStudentPasswordParameters.*">
		  		<c:forEach var="error" items="${status.errorMessages}">
		   			 <p><c:out value="${error}"/></p>
		   		</c:forEach>
			</spring:bind>
		</div>

	    <div class="sectionContent"><input type="submit" value="<spring:message code="saveChanges"/>"/></div>
	</form:form>
</div>
	
</body>
</html>
