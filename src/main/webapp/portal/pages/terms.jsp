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
				<div class="panelHeader"><spring:message code="teacher.termsofuse.wiseUsageAgreement" /></div>
				<div class="panelContent">
	
                    <div class="sectionContent"><p class="info"><spring:message code="teacher.termsofuse.theFollowingInformation"/></p></div>

                    <div class="sectionContent">
                        <p><spring:message code="teacher.termsofuse.beforeProceeding"/></p>
                        <p><spring:message code="teacher.termsofuse.byJoining"/></p> 
                        <p><spring:message code="teacher.termsofuse.byChecking"/></p>
                        <p><spring:message code="teacher.termsofuse.weDoNotAnticipate"/></p>
                        <p><spring:message code="teacher.termsofuse.weWillNotReleaseYourIdentity"/></p>
                        <p><spring:message code="teacher.termsofuse.inTheInterest"/>&nbsp;(<a href="${contextPath}/contact/contactwise.html" target="_blank"><spring:message code="teacher.termsofuse.contactWise"/></a>)&nbsp;<spring:message code="teacher.termsofuse.andWeWillInvestigate"/></p>
                        <p><spring:message code="teacher.termsofuse.finallyYourParticipation"/></p>      
                        <p><spring:message code="teacher.termsofuse.weValueYourEnthusiastic"/></p>
                        <p><spring:message code="teacher.termsofuse.sincerely"/></p>
                        <p><spring:message code="teacher.termsofuse.marciaLinnProjectDirector"/> &nbsp;<a href="mailto:mclinn@berkeley.edu">email</a></p>
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
