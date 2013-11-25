<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
    
    
<title><spring:message code="wiseAdmin" /></title>


</head>

<body>
<%@ include file="../adminheader.jsp"%>
<div id="page">
<div id="pageContent" class="contentPanel">

<h5 style="color:#0000CC;"><a href="../index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<!-- Support for Spring errors object -->
<div id="regErrorMessages" style="color:#FF8822">
	<spring:bind path="findProjectParameters.*">
 		<c:forEach var="error" items="${status.errorMessages}">
    		<b><br/><c:out value="${error}"/></b>
		</c:forEach>
	</spring:bind>
</div>



<form:form method="post" commandName="findProjectParameters" id="search" autocomplete='off'>
	<form:label path="runId"><spring:message code="admin.run.findprojectrunsbyprojectid.enterRunId" />: </form:label>
	<form:input path="runId" id="runId"/>
	
	<input type="image" id="save" src="<spring:theme code="register_save" />" 
    	onmouseover="swapSaveImage('save',1)"onmouseout="swapSaveImage('save',0)"   />
</form:form>

</div></div>
</body>
</html>