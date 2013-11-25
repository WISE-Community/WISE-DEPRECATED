<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />

<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title><spring:message code="pages.schoolIT.title" /></title>
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
						<div><spring:message code="pages.schoolIT.requirements_content" /></div>
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
						<div><spring:message code="pages.schoolIT.contact_info" /></div>
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