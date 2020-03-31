<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html x-dir="${textDirection}"> <%-- The page always ltr --%>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>

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
				username:"${user.userDetails.username}"
				},
			success:function(data,textStatus,jqHXR) {
			}
		});

	};

</script>
</head>

<body style="padding:20px;">
<div X-id="page">
<div X-id="pageContent">
	<!-- h5 style="color: #0000CC;">
		<a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a>
	</h5 -->
	<br/>
	Select roles for ${user.userDetails.username}:<br/><br/>
	<c:forEach var="authority" items="${allAuthorities}">
		<c:set var="checked" value="" />
		<c:set var="disabled" value="disabled" />
 		<c:if test="${user.userDetails.hasGrantedAuthority(authority.authority)}">
			<c:set var="checked" value="checked" />
		</c:if>
		<c:if test="${authority.authority == 'ROLE_ADMINISTRATOR'}">
			<sec:authorize access="hasRole('ROLE_ADMINISTRATOR')">
				<!-- administrators can set other administrators, except for the 'admin' user -->
				<c:choose>
					<c:when test="${user.userDetails.username == 'admin'}">
						<c:set var="disabled" value="disabled" />
					</c:when>
					<c:otherwise>
						<c:set var="disabled" value="" />
					</c:otherwise>
				</c:choose>
			</sec:authorize>
			<input id="${authority.authority}" type="checkbox" value="${authority.authority}" ${checked} ${disabled} onclick="checkboxClicked('${authority.authority}')">${authority.authority}</input><br/>
		</c:if>
		<c:if test="${authority.authority != 'ROLE_ADMINISTRATOR'}">
			<input id="${authority.authority}" type="checkbox" value="${authority.authority}" ${checked} onclick="checkboxClicked('${authority.authority}')">${authority.authority}</input><br/>
		</c:if>
	</c:forEach>
	<br/>
</div>
</div>

</body>
</html>
