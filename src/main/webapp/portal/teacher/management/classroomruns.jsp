<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<%@ include file="../../favicon.jsp"%>
<title><spring:message code="teacher.management.classroomruns.title" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="generalsource"/>" type="text/javascript"></script>

<script type='text/javascript'>
var isTeacherIndex = true; //global var used by spawned pages (i.e. archive run)
</script>
</head>
<body>
<div id="pageWrapper">

	<%@ include file="../../headermain.jsp"%>

	<div id="page">

		<div id="pageContent">

			<div class="contentPanel">

				<div class="panelHeader">
					<spring:message code="teacher.management.classroomruns.title" />
					<span class="pageTitle"><spring:message code="header_location_teacherManagement"/></span>
				</div>

				<div class="panelContent">
					<%@ include file="projectruntabs.jsp"%>
				</div>

			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page -->

	<%@ include file="../../footer.jsp"%>
</div>
</body>
</html>
