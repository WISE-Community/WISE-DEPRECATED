<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>

<META http-equiv="Content-Type" content="text/html; charset=UTF-8">

<!-- Always force latest IE rendering engine (even in intranet) & Chrome Frame
	Remove this if you use the .htaccess -->
<meta http-equiv="X-UA-Compatible" content="chrome=1"/>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="homepagestylesheet"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" rel="stylesheet" type="text/css" />

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>

<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />

<title><spring:message code="pages.features.title" /></title>

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