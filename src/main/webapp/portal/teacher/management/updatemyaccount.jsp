<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.management.updatemyaccount.title"/></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" >
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
</head>
<body>
<div id="pageWrapper">

	<%@ include file="../../headermain.jsp"%>
	
	<div id="page">
			
		<div id="pageContent">
			
			<div class="contentPanel">
			
				<div class="panelHeader"><spring:message code="teacher.management.updatemyaccount.header" /></div>
				
				<div class="panelContent">
					<div class="sectionHead"><spring:message code="teacher.management.updatemyaccount.accountInfo" /></div>
					<div class="sectionContent"> 
						<h5><a href="changepassword.html"><spring:message code="teacher.management.updatemyaccount.changePassword"/></a> - <spring:message code="teacher.management.updatemyaccount.changePasswordInfo"/></h5>
						<h5><a href="updatemyaccountinfo.html"><spring:message code="teacher.management.updatemyaccount.editRegistration"/></a> - <spring:message code="teacher.management.updatemyaccount.editRegistrationInfo"/></h5>
					</div>
				</div>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->
	
	<%@ include file="../../footer.jsp"%>
</div>
</body>
</html>