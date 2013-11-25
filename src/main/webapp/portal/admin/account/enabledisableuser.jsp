<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<script src="../../javascript/tels/general.js" type="text/javascript"></script>


<title><spring:message code="wiseAdmin" /></title>

<script type='text/javascript'>
	function enableAccount(username) {
		$.ajax({
			url:"enabledisableuser.html",
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
			url:"enabledisableuser.html",
			type:"POST",
			data:{"doEnable":false,"username":username},
			success:function(data,textStatus,jqHXR) {
				if (jqHXR.responseText == "success") {
					var disabledAccountHtml = "<div id='"+username+"'>"+username+"&nbsp;&nbsp;&nbsp;&nbsp;| "+
						"<a href='#' onclick=\"javascript:popup640('../../teacherinfo.html?userName="+username+"');\"><spring:message code="info" /></a> | "+
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
		<a href="../index.html"><spring:message code="returnToMainAdminPage" /></a>
	</h5>
	<br/>
	<h3><spring:message code="admin.account.enabledisableuser.disableAccout" /></h3>
	<div id='msg'><spring:message code="admin.account.enabledisableuser.typeUsername" /></div><br/>
	
	<form id='disableAccountForm'>
		<input type="text" id="usernameToDisable"></input>
		<input type="button" value="Disable Account" onclick="disableAccount();"></input>
	</form>
	<br/><br/>
	<h3><spring:message code="admin.account.enabledisableuser.disabledAccouts" /></h3>
	<div id='disabledAccounts'>
	<c:forEach var="disabledUser" items="${disabledUsers}">
		<c:set var="disabledUsername"
			value="${disabledUser.userDetails.username}" />
		<div id='${disabledUsername}'>
		<c:out value="${disabledUsername}" />&nbsp;&nbsp;&nbsp;&nbsp;| 
		<a href="#" onclick="javascript:popup640('../../teacherinfo.html?userName=${disabledUsername}');"><spring:message code="info" /></a> | 
		<a href="#" onclick="javascript:enableAccount('${disabledUsername}')"><spring:message code="admin.account.enabledisableuser.reEnableAccout" /></a>
		</div>				
	</c:forEach>
	</div>
</div>
</div>

</body>
</html>