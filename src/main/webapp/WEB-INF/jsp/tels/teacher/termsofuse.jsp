<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" /> 
 
<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<title><spring:message code="teacher.termsofuse.termsOfUse"/></title>
</head>

<body style="background:#FFF;">

<div class="dialogContent">		

	<div class="sectionHead"><spring:message code="teacher.termsofuse.wiseUsageAgreement"/></div>
	
	<div class="sectionContent"><p class="info"><spring:message code="teacher.termsofuse.theFollowingInformation"/></p></div>

	<div class="sectionContent">
		<p><spring:message code="teacher.termsofuse.beforeProceeding"/></p>
		<p><spring:message code="teacher.termsofuse.byJoining"/></p> 
		<p><spring:message code="teacher.termsofuse.byChecking"/></p>
		<p><spring:message code="teacher.termsofuse.weDoNotAnticipate"/></p>
		<p><spring:message code="teacher.termsofuse.weWillNotReleaseYourIdentity"/></p>
		<p><spring:message code="teacher.termsofuse.inTheInterest"/>&nbsp;(<a href="/webapp/contact/contactwisegeneral.html" target="_blank"><spring:message code="teacher.termsofuse.contactWise"/></a>)&nbsp;<spring:message code="teacher.termsofuse.andWeWillInvestigate"/></p>
		<p><spring:message code="teacher.termsofuse.finallyYourParticipation"/></p>      
		<p><spring:message code="teacher.termsofuse.weValueYourEnthusiastic"/></p>
		<p><spring:message code="teacher.termsofuse.sincerely"/></p>
		<p><spring:message code="teacher.termsofuse.marciaLinnProjectDirector"/> &nbsp;<a href="mailto:mclinn@berkeley.edu">email</a></p>
	</div>
</div>

</body>
</html>




