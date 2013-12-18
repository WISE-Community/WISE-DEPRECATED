<%@ include file="include.jsp"%>

<!-- $Id: signup.jsp 323 2007-04-21 18:08:49Z hiroki $ -->

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="registerstylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
  
<title><spring:message code="signup.title" /></title>

<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" /> 

</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="${contextPath}/index.html" title="<spring:message code="wiseHomepage"/>"><spring:message code="wise"/></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="signup.header"/></div>
				<div class="infoContentBox">
					<h4><spring:message code="signup.accountType"/></h4>
					<div><a href="${contextPath}/student/registerstudent.html" class="wisebutton" title="<spring:message code="signup.student"/>"><spring:message code="signup.student"/></a></div>
					<div><a href="${contextPath}/teacher/registerteacher.html" class="wisebutton" title="<spring:message code="signup.teacher"/>"><spring:message code="signup.teacher"/></a></div>
					<div style="margin-top:1em;"><spring:message code="signup.whichAccount" /></div>
					<div class="instructions"><spring:message code="signup.studentDescription" /></div>
					<div class="instructions"><spring:message code="signup.teacherDescription" /></div>
				</div>
				<a href="${contextPath}/index.html" title="<spring:message code="wiseHomepage"/>"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>
   
</body>
</html>


