<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />

    
<title><spring:message code="wiseAdmin" /></title>

</head>

<body onload="document.getElementById('userName').focus()">
<div id="pageWrapper">

	<%@ include file="../../headermain.jsp"%>
	
	<div id="page">
		
		<div id="pageContent">
			<h5 style="color:#0000CC;"><a href="../index.html"><spring:message code="returnToMainAdminPage" /></a></h5>
		
			<div class="contentPanel">
			
				<div class="panelHeader"><spring:message code="admin.run.findprojectrunsbyteacher.findClassroomRunsByTeacher" />
					<span class="pageTitle"><spring:message code="header_location_admin"/></span>
				</div>
				
				<div class="panelContent">

					<!-- Support for Spring errors object -->
					<div id="regErrorMessages" style="color:#FF8822">
						<spring:bind path="findProjectParameters.*">
					 		<c:forEach var="error" items="${status.errorMessages}">
					    		<b><br/><c:out value="${error}"/></b>
							</c:forEach>
						</spring:bind>
					</div>



					<h5>
						<form:form method="post" commandName="findProjectParameters" id="search" autocomplete='off'>
							<form:label path="userName"><spring:message code="admin.run.findprojectrunsbyteacher.enterTeacherUsername" /></form:label>
							<form:input path="userName" id="userName" />
							
							<input type="submit" id="save" value="<spring:message code="submit" />" />
						</form:form>
						</h5>
				</div>
			</div>
		</div>
	</div>
	<%@ include file="../../footer.jsp"%>
</div>

</body>
</html>