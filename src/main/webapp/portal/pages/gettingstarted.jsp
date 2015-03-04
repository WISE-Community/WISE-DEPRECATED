<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="pages.gettingstarted.title" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
</head>
<body>
<spring:htmlEscape defaultHtmlEscape="false">
<spring:escapeBody htmlEscape="false">
<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>
	
	<div id="page">
			
		<div id="pageContent">
			
			<div class="contentPanel">
				<div class="panelHeader"><spring:message code="pages.gettingstarted.title" /> <span style="float:right;"><a class="printLesson" onClick="window.print();return false"><spring:message code="print" /></a></span></div>
				<div class="panelContent">

					<div class="sectionHead"><spring:message code="pages.gettingstarted.technical" /></div>
					<div class="sectionContent"> 
						<ol>
							<li><spring:message code="pages.gettingstarted.technical_internet" /></li>
							<li><spring:message code="pages.gettingstarted.technical_browser" /></li>
							<li><spring:message code="pages.gettingstarted.technical_flash" /> <a href="http://get.adobe.com/flashplayer/" target="_blank">http://get.adobe.com/flashplayer/</a></li>
							<li><spring:message code="pages.gettingstarted.technical_java" /> <a href="http://java.sun.com/getjava/download.html" target="_blank">http://java.sun.com/getjava/download.html</a></li>
							<li><spring:message code="pages.gettingstarted.technical_compatibility" /> <a href="${contextPath}/pages/check.html" target="_blank"><spring:message code="pages.gettingstarted.technical_compatibility_link" /> </a></li>
						</ol>
					</div>
					
					<div class="sectionHead"><spring:message code="pages.gettingstarted.registration" /></div>
					<div class="sectionContent">
						<ol>
							
							<li><spring:message code="pages.gettingstarted.registration_createAccount" /> <a href="${contextPath}/signup.html"><spring:message code="signUp" /></a></li>
							
							<li><spring:message code="pages.gettingstarted.registration_selectTeacher" /></li>
							
							<li><spring:message code="pages.gettingstarted.registration_fillForm" /></li>
							
							<li><spring:message code="pages.gettingstarted.registration_username" /></li>
						
						</ol>
					</div>
					
					<div class="sectionHead"><spring:message code="pages.gettingstarted.run" /></div>
					<div class="sectionContent">
						<ol>
							<li><spring:message code="pages.gettingstarted.run_signIn" arguments="${empty contextPath ? ' ' : contextPath}" /></li>
							
							<li><spring:message code="pages.gettingstarted.run_browseLibrary" arguments="${empty contextPath ? ' ' : contextPath}" /></li>
							
							<li><spring:message code="pages.gettingstarted.run_select" /></li>
							
							<li><spring:message code="pages.gettingstarted.run_confirm" /></li>
							
							<li><spring:message code="pages.gettingstarted.run_archive" /></li>
							
							<li><spring:message code="pages.gettingstarted.run_periods" /></li>
							
							<li><spring:message code="pages.gettingstarted.run_configure" /></li>
							
							<li><spring:message code="pages.gettingstarted.run_preview" /></li>
							
							<li><spring:message code="pages.gettingstarted.run_created" arguments="${empty contextPath ? ' ' : contextPath}" /></li>
							
							<li><spring:message code="pages.gettingstarted.run_accessCode" /></li>
						
						</ol>
					</div>

					<div class="sectionHead"><spring:message code="pages.gettingstarted.student" /></div>
					<div class="sectionContent">
						<ol>
							<li><spring:message code="pages.gettingstarted.student_recommended" /></li>
							
							<li><spring:message code="pages.gettingstarted.student_goHome" arguments="${empty contextPath ? ' ' : contextPath}" /></li>
							
							<li><spring:message code="pages.gettingstarted.student_createAccount" /></li>
							
							<li><spring:message code="pages.gettingstarted.student_fillForm" /></li>
							
							<li><spring:message code="pages.gettingstarted.student_username" /></li>
							
							<li><spring:message code="pages.gettingstarted.student_accessCodes" /></li>
							
							<li><spring:message code="pages.gettingstarted.student_signIn" /></li>
							
							<li><spring:message code="pages.gettingstarted.student_explore" /></li>
							</ol>
					</div>

					<div class="sectionHead"><spring:message code="pages.gettingstarted.faq" /></div>
					<div class="sectionContent">
						<h5><spring:message code="pages.gettingstarted.faq_visit" /> <a href="teacherfaq.html"><spring:message code="pages.gettingstarted.faq_link" /></a></h5>
					</div>
					
					<div class="sectionHead"><spring:message code="pages.gettingstarted.help" /></div>
					<div class="sectionContent">
						<h5><spring:message code="pages.gettingstarted.help_info" arguments="${empty contextPath ? ' ' : contextPath}" /></h5>
					</div>
				</div>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->
	
	<%@ include file="../footer.jsp"%>
</div>
</spring:escapeBody>
</spring:htmlEscape>
</body>
</html>