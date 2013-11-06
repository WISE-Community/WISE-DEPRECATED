<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>

<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
  
<title><spring:message code="teacher.management.batchstudentchangepassword.header"/></title>
</head>

<body style="background:#FFFFFF;">

<div class="dialogContent">		

	<div class="sectionHead"><spring:message code="teacher.management.batchstudentchangepassword.header"/></div>
	
	<div class="sectionContent"><span style="color:red;"><spring:message code="teacher.management.batchstudentchangepassword.warning"/></span></div>

	<form:form method="post" action="batchstudentchangepassword.html" commandName="batchStudentChangePasswordParameters" id="batchstudentchangepassword" autocomplete='off'>
		<div class="sectionContent">
			<label><spring:message code="teacher.management.batchstudentchangepassword.typeTeacherPassword"/></label>
			<form:password path="passwd0"/>
		</div>
		<div class="sectionContent">
			<label><spring:message code="teacher.management.batchstudentchangepassword.typeStudentPassword"/></label>
			<form:password path="passwd1"/>
		</div>
		<div class="sectionContent">
			<label><spring:message code="teacher.management.batchstudentchangepassword.typeStudentPasswordAgain"/></label>
			<form:password path="passwd2"/>
		</div>
		
		<div class="errorMsgNoBg">
			<!-- Support for Spring errors object -->
			<spring:bind path="batchStudentChangePasswordParameters.*">
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