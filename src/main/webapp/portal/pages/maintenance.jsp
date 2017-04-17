<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<META http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="chrome=1"/>
<%@ include file="../favicon.jsp"%>
<title><spring:message code="pages.features.title" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
</head>
<body>
<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>

	<div id="page">

		<div id="pageContent">
			<div class="contentPanel">

				<div class="panelHeader"><spring:message code="pages.maintenance.title" /></div>

				<div class="panelContent">
					<div class="featuresShowcase right">
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.maintenance.checkBackLater" /></div>
						</div>
						<div style="clear:both;"></div>
					</div>
				</div>
			</div>

		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page -->

	<%@ include file="../footer.jsp"%>
</div>
</body>
</html>
