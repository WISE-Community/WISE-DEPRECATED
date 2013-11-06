<%@ include file="../../include.jsp"%>

<!DOCTYPE html>

<html lang="en">
<head>

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<title><spring:message code="teacher.management.updatemyaccount.title"/></title>
</head>

<body>

<div id="pageWrapper">

	<%@ include file="../headerteacher.jsp"%>
	
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
				<!-- <div class="panelContent">
					<div class="sectionHead">Preferences</div>
					<div class="sectionContent">
						<h5><a href="#"><spring:message code="teacher.management.updatemyaccount.editPrefernces"/></a> - <spring:message code="teacher.management.updatemyaccount.editPreferncesInfo"/></h5>
						<h5><a href="#"><spring:message code="teacher.management.updatemyaccount.editLanguage"/></a> - <spring:message code="teacher.management.updatemyaccount.editLanguageInfo"/></h5>
 					</div> -->
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->
	
	<%@ include file="../../footer.jsp"%>
</div>
	
</body>
</html>