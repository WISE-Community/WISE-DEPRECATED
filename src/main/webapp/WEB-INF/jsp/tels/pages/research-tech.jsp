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

<title><spring:message code="pages.research-tech.title" /></title>

</head>

<body>
<spring:htmlEscape defaultHtmlEscape="false">
<spring:escapeBody htmlEscape="false">
<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>
	
	<div id="page">
		
		<div id="pageContent">
			<div class="contentPanel">
			
				<div class="panelHeader"><spring:message code="pages.research-tech.title" /></div>
				
				<div class="panelContent">
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/wise-research.png" alt="<spring:message code="pages.research-tech.research" />" />
						<div class="featureContentHeader"><spring:message code="pages.research-tech.research" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.research-tech.research_content" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="/webapp/themes/tels/default/images/features/ki.png" alt="<spring:message code="pages.research-tech.ki" />" />
						<div class="featureContent">
							<div class="featureContentHeader" id="ki"><spring:message code="pages.research-tech.ki" /></div>
							<p><spring:message code="pages.research-tech.ki_content" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/wise-group.png" alt="<spring:message code="pages.research-tech.goals" />" />
						<div class="featureContentHeader"><spring:message code="pages.research-tech.goals" /></div>
						<div class="featureContent">
							<ol><li><span style="font-weight:bold;"><spring:message code="pages.research-tech.goals_curriculum" /></span> <spring:message code="pages.research-tech.goals_curriculum_content" /></li>
							<li><span style="font-weight:bold;"><spring:message code="pages.research-tech.goals_pd" /></span> <spring:message code="pages.research-tech.goals_pd_content" /></li>
							<li><span style="font-weight:bold;"><spring:message code="pages.research-tech.goals_gradEd" /></span> <spring:message code="pages.research-tech.goals_gradEd_content" /></li>
							<li><span style="font-weight:bold;"><spring:message code="pages.research-tech.goals_science" /></span> <spring:message code="pages.research-tech.goals_science_content" /></li>
							<li><span style="font-weight:bold;"><spring:message code="pages.research-tech.goals_tech" /></span> <spring:message code="pages.research-tech.goals_tech_content" /></li></ol>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<div class="featureContent">
							<img src="/webapp/themes/tels/default/images/features/tels-projects.png" alt="<spring:message code="pages.research-tech.grants" />" />
							<div class="featureContentHeader"><spring:message code="pages.research-tech.grants" /></div>
							<p><spring:message code="pages.research-tech.grants_intro" /></p>
							<ol>
								<li><a style="font-weight:bold;" href="http://telscenter.org/projects/clear" target="_blank"><spring:message code="pages.research-tech.grants_clear" /></a> <spring:message code="pages.research-tech.grants_clear_content" /></li>
								<li><a style="font-weight:bold;" href="http://telscenter.org/projects/visual" target="_blank"><spring:message code="pages.research-tech.grants_visual" /></a> <spring:message code="pages.research-tech.grants_visual_content" /></li>
								<li><a style="font-weight:bold;" href="http://telscenter.org/projects/loops" target="_blank"><spring:message code="pages.research-tech.grants_loops" /></a> <spring:message code="pages.research-tech.grants_loops_content" /></li>
								<li><a style="font-weight:bold;" href="http://telscenter.org/projects/models" target="_blank"><spring:message code="pages.research-tech.grants_models" /></a> <spring:message code="pages.research-tech.grants_models_content" /></li>
								<li><a style="font-weight:bold;" href="http://telscenter.org/projects/surge" target="_blank"><spring:message code="pages.research-tech.grants_surge" /></a> <spring:message code="pages.research-tech.grants_surge_content" /></li>
							</ol>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/wise-results.png" alt="<spring:message code="pages.research-tech.results" />" />
						<div class="featureContentHeader"><spring:message code="pages.research-tech.results" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.research-tech.results_content" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="/webapp/themes/tels/default/images/features/collaborators.png" alt="<spring:message code="pages.research-tech.openSource" />" />
						<div class="featureContent">
							<div class="featureContentHeader" id="technology"><spring:message code="pages.research-tech.openSource" /></div>
							<p><spring:message code="pages.research-tech.openSource_content" />
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/wise4-org.png" alt="<spring:message code="pages.research-tech.development" />" />
						<div class="featureContentHeader"><spring:message code="pages.research-tech.development" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.research-tech.development_content" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase">
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.research-tech.collaboration" /></div>
							<p><spring:message code="pages.research-tech.collaboration_content" /></p>
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

</spring:escapeBody>
</spring:htmlEscape>
</body>

</html>