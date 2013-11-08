<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>

<META http-equiv="Content-Type" content="text/html; charset=UTF-8">

<!-- Always force latest IE rendering engine (even in intranet) & Chrome Frame
	Remove this if you use the .htaccess -->
<meta http-equiv="X-UA-Compatible" content="chrome=1"/>

<link href="<spring:theme code="globalstyles"/>" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="homepagestylesheet"/>" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="jquerystylesheet"/>" rel="stylesheet" type="text/css" />

<script src="<spring:theme code="jquerysource"/>" type="text/javascript"></script>

<link rel="shortcut icon" href="<spring:theme code="favicon"/>" />

<title><spring:message code="pages.features.title" /></title>

</head>

<body>

<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>
	
	<div id="page">
		
		<div id="pageContent">
			<div class="contentPanel">
			
				<div class="panelHeader"><spring:message code="pages.features.title" /></div>
				
				<div class="panelContent">
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/wise-vle.png" alt="<spring:message code="pages.features.vle" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.features.vle" /></div>
							<p><spring:message code="pages.features.vle_content_p1" /></p>
							<p><spring:message code="pages.features.vle_content_p2" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featureContentHeader"><spring:message code="pages.features.projectsAndTools" /></div>
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/vle-prompts.png" alt="<spring:message code="pages.features.readWrite" />" />
						<div class="featureContent">
							<p class="featureHeader"><spring:message code="pages.features.readWrite" /></p>
							<ul>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.readWrite_POEF" /></span> <spring:message code="pages.features.readWrite_POEF_content" /></li>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.readWrite_critique" /></span> <spring:message code="pages.features.readWrite_critique_content" /></li>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.readWrite_narratives" /></span> <spring:message code="pages.features.readWrite_narratives_content" /></li>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.readWrite_CQ" /></span> <spring:message code="pages.features.readWrite_CQ_content" /></li>
							</ul>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="/webapp/themes/tels/default/images/features/vle-argumentation.png" alt="<spring:message code="pages.features.argumentation" />" />
						<div class="featureContent">
							<p class="featureHeader"><spring:message code="pages.features.argumentation" /></p>
							<ul>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.argumentation_IM" /></span> <spring:message code="pages.features.argumentation_IM_content" /></li>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.argumentation_draw" /></span> <spring:message code="pages.features.argumentation_draw_content" /></li>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.argumentation_mySystem" /></span> <spring:message code="pages.features.argumentation_mySystem_content" /></li>
							</ul>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/vle-activities.png" alt="<spring:message code="pages.features.activityTemplates" />" />
						<div class="featureContent">
							<p class="featureHeader"><spring:message code="pages.features.activityTemplates" /></p>
							<ul>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.activityTemplates_inquiry" /></span> <spring:message code="pages.features.activityTemplates_inquiry_content" /></li>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.activityTemplates_peerCritique" /></span> <spring:message code="pages.features.activityTemplates_peerCritique_content" /></li>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.activityTemplates_debate" /></span> <spring:message code="pages.features.activityTemplates_debate_content" /></li>
							</ul>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="/webapp/themes/tels/default/images/features/vle-simulations.png" alt="<spring:message code="pages.features.simulations" />" />
						<div class="featureContent">
							<p class="featureHeader"><spring:message code="pages.features.simulations" /></p>
							<ul>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.simulations_experiments" /></span> <spring:message code="pages.features.simulations_experiments_content" /></li>
								<li><span style="font-weight:bold;"><spring:message code="pages.features.simulations_multimedia" /></span> <spring:message code="pages.features.simulations_multimedia_content" /></li>
							</ul>
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