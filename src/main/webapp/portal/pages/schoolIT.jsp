<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="pages.schoolIT.title" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" >
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jquerycookiesource"/>" type="text/javascript"></script>

</head>
<body>
<spring:htmlEscape defaultHtmlEscape="false">
<spring:escapeBody htmlEscape="false">
<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>
	
	<div id="page">
			
		<div id="pageContent">
			
			<div class="contentPanel">
				<div class="panelHeader"><spring:message code="pages.schoolIT.header" /></div>
				<div class="panelContent">
				
					<div class="sectionHead"><spring:message code="pages.schoolIT.intro" /></div>
					<div class="sectionContent">
						<div><spring:message code="pages.schoolIT.intro_content" /></div>
					</div>
					
					<div class="sectionHead"><spring:message code="pages.schoolIT.requirements" /></div>
					<div class="sectionContent">
						<div><spring:message code="pages.schoolIT.requirements_content" arguments="${contextPath}" /></div>
					</div>
					
					<div class="sectionHead"><spring:message code="pages.schoolIT.aboutWISE" /></div>
					<div class="sectionContent">
						<div><spring:message code="pages.schoolIT.aboutWISE_content" /></div>
					</div>
					
					<div class="sectionHead"><spring:message code="pages.schoolIT.tech" /></div>
					<div class="sectionContent">
						<div><spring:message code="pages.schoolIT.tech_content" /></div>
					</div>
					
					<div class="sectionHead"><spring:message code="pages.schoolIT.browserCache" /></div>
					<div class="sectionContent">
						<div><spring:message code="pages.schoolIT.browserCache_content" /></div>
					</div>
					
					<div class="sectionHead"><spring:message code="pages.schoolIT.contact" /></div>
					<div class="sectionContent">
						<div><spring:message code="pages.schoolIT.contact_devGroup" /></div>
						<div><spring:message code="pages.schoolIT.contact_info" arguments="${contextPath}" /></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</spring:escapeBody>
</spring:htmlEscape>
</body>
</html>