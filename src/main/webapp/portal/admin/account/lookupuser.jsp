<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<c:if test="${textDirection == 'rtl' }">
		<link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>
<%@ include file="../../favicon.jsp"%>

<script src="${contextPath}/<spring:theme code="generalsource" />" type="text/javascript"></script>


<title><spring:message code="wiseAdmin" /></title>

<script type='text/javascript'>
// update lookup criteria options based on lookup field chosen
function lookupFieldChanged() {
	var selectedLookupField = $("#lookupField option:selected").val();
	if (selectedLookupField == "ID") {
		$("#equalsCriteria").attr("selected","selected");
		$("#likeCriteria").hide();
	} else {
		$("#likeCriteria").show();
	}
};
</script>
</head>

<body onload="document.getElementById('lookupData').focus();">

<div id="page">
<div id="pageContent">
<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>
<br>

<!-- Support for Spring errors object -->
<div id="regErrorMessages">
	<spring:bind path="lookupUserParameters.*">
		<c:forEach var="error" items="${status.errorMessages}">
			<b><br /><c:out value="${error}"/></b>
		</c:forEach>
	</spring:bind>
</div>

<form:form method="post" action="lookupuser" modelAttribute="lookupUserParameters" id="lookupUser" autocomplete='off'>
	<c:choose>
		<c:when test="${userType == 'student'}">
			<form:label path="lookupField"><spring:message code="admin.account.lookupteacher.searchForStudentsBy" /></form:label>
		</c:when>
		<c:otherwise>
			<form:label path="lookupField"><spring:message code="admin.account.lookupteacher.searchForTeachersBy" /></form:label>
		</c:otherwise>
	</c:choose>
	<form:select path="lookupField" id="lookupField" onchange="lookupFieldChanged()">
		<c:forEach var="field" items="${fields}">
			<form:option value="${field}">${field}</form:option>
		</c:forEach>
	</form:select>

	<form:label path="lookupCriteria">  <spring:message code="admin.account.lookupteacher.that" />  </form:label>
	<form:select path="lookupCriteria" id="lookupCriteria">
		<form:option id="likeCriteria" value="like"><spring:message code="admin.account.lookupteacher.contains" /></form:option>
		<form:option id="equalsCriteria" value="="><spring:message code="admin.account.lookupteacher.matches" /></form:option>
	</form:select>

	<form:input path="lookupData" id="lookupData"/>

	<input type="hidden" name="userType" value="${userType}" />
	<input type="submit" id="save" value="<spring:message code="submit" />" />
</form:form>
</div>
</div>

</body>
</html>
