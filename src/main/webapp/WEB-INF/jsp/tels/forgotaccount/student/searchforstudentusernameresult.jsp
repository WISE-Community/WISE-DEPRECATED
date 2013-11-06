<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />    
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<title><spring:message code="forgotaccount.student.searchforstudentusernameresult.searchForUsernameViaProjectCode"/></title>

</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage" />"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.student.searchforstudentusernameresult.studentLostUsernamePassword"/></div>
				<div class="infoContentBox">
					<div><spring:message code="forgotaccount.student.searchforstudentusernameresult.searchResultsFor"/>:</div>
	  				<div>
	  					<table width="100%" style="border-collapse:separate;border-spacing:10px">
							<tr>
								<td align="right" width="50%"><spring:message code="forgotaccount.student.searchforstudentusernameresult.firstName"/>:</td>
								<td align="left" width="50%"><input type="text" size=25 value="${firstName}" disabled /></td>
							</tr>
							<tr>
								<td align="right" width="50%"><spring:message code="forgotaccount.student.searchforstudentusernameresult.lastName"/>:</td>
								<td align="left" width="50%"><input type="text" size=25 value="${lastName}" disabled /></td>
							</tr>
							<tr>
								<td align="right" width="50%"><spring:message code="forgotaccount.student.searchforstudentusernameresult.birthMonth"/>:</td>
								<td align="left" width="50%"><input type="text" size=5 value="${birthMonth}" disabled /></td>
							</tr>
							<tr>
								<td align="right" width="50%"><spring:message code="forgotaccount.student.searchforstudentusernameresult.birthDay"/>:</td>
								<td align="left" width="50%"><input type="text" size=5 value="${birthDay}" disabled /></td>
							</tr>
						</table>
	  				</div>
	  				<div>
	  					<c:choose>
							<c:when test="${fn:length(users) == 0}">
								<div class="errorMsgNoBg"><p><spring:message code="forgotaccount.student.searchforstudentusernameresult.noMatchesFound"/></p></div>
								<div><a href="searchforstudentusername.html" title="<spring:message code="wiseHome" />"><spring:message code="forgotaccount.student.searchforstudentusernameresult.tryAgain"/></a></div>
							</c:when>
							<c:when test="${fn:length(users) == 1}">
								<div class="errorMsgNoBg"><p><spring:message code="forgotaccount.student.searchforstudentusernameresult.foundMatch"/></p></div>
							</c:when>
							<c:when test="${fn:length(users) > 1}">
								<div class="errorMsgNoBg"><p><spring:message code="forgotaccount.student.searchforstudentusernameresult.foundMatches"/></p></div>
							</c:when>
						</c:choose>
	  				</div>
					<div>
						<c:forEach var="user" items="${users}">
				    		<p><a href="/webapp/login.html?userName=${user.userDetails.username}">${user.userDetails.username}</a></p>
				  		</c:forEach>
					</div>
				</div>
				<a href="/webapp/index.html" title="<spring:message code="wiseHome" />"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>

</body>
</html>
