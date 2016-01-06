<%@ include file="include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.management.library.title" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherrunstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerydatatables.css"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="facetedfilter.css"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="tiptip.css"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="generalsource"/>" type="text/javascript"></script>

</head>
<body>
<div id="pageWrapper">

	<%@ include file="headermain.jsp"%>

	<div id="page">

		<div id="pageContent">

			<div class="contentPanel">

				<div class="panelHeader">
					<spring:message code="teacher.management.library.title" />
				</div>

				<div class="panelContent">

					<%@ include file="/portal/teacher/management/projectlibrarydisplay.jsp"%>

				</div>

			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page -->

	<%@ include file="footer.jsp"%>

</div>
</body>
</html>
