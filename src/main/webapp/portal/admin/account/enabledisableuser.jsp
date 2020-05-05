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
	function enableAccount(username) {
		$.ajax({
			url:"enabledisableuser",
			type:"POST",
			data:{"doEnable":true,"username":username},
			success:function(data,textStatus,jqHXR) {
				if (jqHXR.responseText == "success") {
					$("#"+username).hide();
				}
			}
		});
	};

	function disableAccount() {
		var username = $("#usernameToDisable").val();
		$.ajax({
			url:"enabledisableuser",
			type:"POST",
			data:{"doEnable":false,"username":username},
			success:function(data,textStatus,jqHXR) {
				if (jqHXR.responseText == "success") {
					var disabledAccountHtml = "<div id='"+username+"'>"+username+"&nbsp;&nbsp;&nbsp;&nbsp;| "+
						"<a target='_blank' href='../../teacher/account/info?username="+username+"'><spring:message code="info" /></a> | "+
						"<a href='#' onclick=\"javascript:enableAccount('"+username+"')\"><spring:message code="admin.account.enabledisableuser.reEnableAccout" /></a>"+
						"</div>";

					$("#disabledAccounts").append(disabledAccountHtml)
				} else {
					alert(jqHXR.responseText);
				}
			}
		});
	};
</script>
</head>

<body onload="document.getElementById('usernameToDisable').focus();">
<div id="page">
<div id="pageContent">

	<h5 style="color: #0000CC;">
		<a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a>
	</h5>
	<br/>
	<h3><spring:message code="admin.account.enabledisableuser.disableAccout" /></h3>
	<div id='msg'><spring:message code="admin.account.enabledisableuser.typeUsername" /></div><br/>

	<form id='disableAccountForm'>
		<input type="text" id="usernameToDisable"/>
		<input type="button" value="Disable Account" onclick="disableAccount();"/>
	</form>
	<br/><br/>
	<h3><spring:message code="admin.account.enabledisableuser.disabledAccouts" /></h3>
	<div id='disabledAccounts'>
	<c:forEach var="disabledUser" items="${disabledUsers}">
		<c:set var="disabledUsername"
			value="${disabledUser.userDetails.username}" />
		<div id='${disabledUsername}'>
		<c:out value="${disabledUsername}" />&nbsp;&nbsp;&nbsp;&nbsp;|
		<a target='_blank' href='../../teacher/account/info?username=${disabledUsername}'><spring:message code="info" /></a> |
		<a href="#" onclick="javascript:enableAccount('${disabledUsername}')"><spring:message code="admin.account.enabledisableuser.reEnableAccout" /></a>
		</div>
	</c:forEach>
	</div>
</div>
</div>

</body>
</html>
