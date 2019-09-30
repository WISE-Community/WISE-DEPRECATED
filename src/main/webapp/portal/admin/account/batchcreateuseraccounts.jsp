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
	<%@ include file="../../favicon.jsp"%>

	<script src="${contextPath}/<spring:theme code="generalsource" />" type="text/javascript"></script>


	<title><spring:message code="wiseAdmin" /></title>

	<script type='text/javascript'>
		function validateForm() {
			if ($("#csvFile").val() === "") {
				alert("Please specify a csv file to upload.");
				return false;
			}
			return true;
		}
	</script>
</head>

<body>

<div id="page">
	<div id="pageContent">
		<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>
		<br/>
		<c:if test="${msg != null}">
			<div style="width:500px;font-size:1.2em;font-weight:bold;border:2px dotted black">
					${msg}<br/><br/>
				<b>New Usernames:</b>
				<ul>
					<c:forEach var="newUsername" items="${newUsernames}">
						<li>${newUsername}</li>
					</c:forEach>
				</ul>
			</div>
			<br/>
		</c:if>

		<br>
		<div>Please choose a CSV file with student account information. <a href="${contextPath}/pages/resources/WISE_BatchCreateUserAccounts_Sample.csv"><spring:message code="admin.account.batchcreateuseraccounts.sampleFile" /></a></div>
		<br/>
		<form:form method="post" action="batchcreateuseraccounts.html"
				   modelAttribute="csvFile" id="csvFileForm" enctype="multipart/form-data" autocomplete='off' onsubmit="return validateForm();">
			<input type="file" name="file" id="csvFile"/>
			<br/><br/>
			<input type="submit" value="Submit" />
		</form:form>


	</div>
</div>

</body>
</html>
