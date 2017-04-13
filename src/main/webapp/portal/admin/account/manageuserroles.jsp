<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<%@ include file="../../favicon.jsp"%>

<script src="${contextPath}/<spring:theme code="generalsource" />" type="text/javascript"></script>


<title><spring:message code="wiseAdmin" /></title>

<script type='text/javascript'>

	function checkboxClicked(authorityName) {
		var grantOrRevoke = "";
		if ($("#"+authorityName + ":checked").length > 0) {
			grantOrRevoke = "grant";
		} else {
			grantOrRevoke = "revoke";
		}
		$.ajax({
			url:"manageuserroles.html",
			type:"POST",
			data:{
				action:grantOrRevoke,
				authorityName:authorityName,
				userName:"${user.userDetails.username}"
				},
			success:function(data,textStatus,jqHXR) {
			}
		});

	};

</script>
</head>

<body>
<div id="page">
<div id="pageContent">
	<h5 style="color: #0000CC;">
		<a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a>
	</h5>
	<br/>
	Select roles for ${user.userDetails.username}:<br/><br/>
	<c:forEach var="authority" items="${allAuthorities}">
		<c:set var="checked" value="" />
		<c:if test="${user.userDetails.hasGrantedAuthority(authority.authority)}">
			<c:set var="checked" value="checked" />
		</c:if>
		<input id="${authority.authority}" type="checkbox" value="${authority.authority}" ${checked} onclick="checkboxClicked('${authority.authority}')">${authority.authority}</input><br/>
	</c:forEach>
	<br/>
</div>
</div>

</body>
</html>
