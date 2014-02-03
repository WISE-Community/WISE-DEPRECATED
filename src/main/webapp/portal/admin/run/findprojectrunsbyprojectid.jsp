<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
    
<title><spring:message code="wiseAdmin" /></title>

</head>

<body>



<%@ include file="../../headermain.jsp"%>
<div id="page">
<div id="pageContent" class="contentPanel">
<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<!-- Support for Spring errors object -->
<div id="regErrorMessages" style="color:#FF8822">
<spring:bind path="findProjectParameters.*">
  <c:forEach var="error" items="${status.errorMessages}">
    <b>
      <br /><c:out value="${error}"/>
    </b>
  </c:forEach>
</spring:bind>
</div>

	<br><h5><spring:message code="admin.run.findprojectrunsbyprojectid.enterProjectId" /></h5>
	<form:form method="post" commandName="findProjectParameters" autocomplete='off'>
		<input type="text" name="projectId"/>
		 <input type="submit" id="save" value="<spring:message code="submit" />" />
	</form:form>
	<h5><spring:message code="forgotaccount.selectaccounttype.or" /></h5>
	<h5> <a href="${contextPath}/admin/project/manageallprojects.html"><spring:message code="admin.run.findprojectrunsbyprojectid.seeAllProjects" /></a></h5>
</div></div>

</body>
</html>