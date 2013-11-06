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

<title><spring:message code="pages.wise-advantage.theWISEAdvantage" /></title>

</head>

<body>

<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>
	
	<div id="page">
		
		<div id="pageContent">
			<div class="contentPanel">
			
				<div class="panelHeader"><spring:message code="pages.wise-advantage.top10ReasonsForUsingWISE" /></div>
				
				<div class="panelContent">
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/inquiry-learning.png" alt="<spring:message code="pages.wise-advantage.inquiryLearningAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.1inquiryBasedLearning" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.inquiryLearningParagraphPart1" /> <a href="/webapp/pages/features.html"><spring:message code="pages.wise-advantage.activitiesAndScaffoldingTools" /></a><spring:message code="pages.wise-advantage.inquiryLearningParagraphPart2" /> <a href="/webapp/previewprojectlist.html"><spring:message code="pages.wise-advantage.inquiryBasedProjects" /></a><spring:message code="pages.wise-advantage.inquiryLearningParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="/webapp/themes/tels/default/images/features/library.png" alt="<spring:message code="pages.wise-advantage.wiseLibraryAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.2growingLibrary" /></div>
							<p><spring:message code="pages.wise-advantage.growingLibraryParagraphPart1" /> <a href="/webapp/previewprojectlist.html"><spring:message code="pages.wise-advantage.wiseProjectLibrary" /></a> <spring:message code="pages.wise-advantage.growingLibraryParagraphPart2" /> <a href="/webapp/pages/research-tech.html"><spring:message code="pages.wise-advantage.classroomBasedResearch" /></a><spring:message code="pages.wise-advantage.growingLibraryParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/standards-science.png" alt="<spring:message code="pages.wise-advantage.standardsBasedScienceAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.3standardsBasedScience" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.standardsBasedScienceParagraph" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="/webapp/themes/tels/default/images/features/teacher-tools.png" alt="<spring:message code="pages.wise-advantage.teacherToolsAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.4comprehensiveInstructionalSupport" /></div>
							<p><spring:message code="pages.wise-advantage.comprehensiveInstructionalSupportParagraphPart1" /> <a href="/webapp/pages/teacher-tools.html"><spring:message code="pages.wise-advantage.suiteOfIntegratedTools" /></a> <spring:message code="pages.wise-advantage.comprehensiveInstructionalSupportParagraphPart2" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/research-practice.png" alt="<spring:message code="pages.wise-advantage.researchAndPracticeAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.5basedOnResearch" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.basedOnResearchParagraphPart1" /> <a href="/webapp/pages/research-tech.html"><spring:message code="pages.wise-advantage.20yearsOfResearch" /></a> <spring:message code="pages.wise-advantage.basedOnResearchParagraphPart2" /> <a href="/webapp/pages/research-tech.html#ki"><spring:message code="pages.wise-advantage.setOfPrinciples" /></a><spring:message code="pages.wise-advantage.basedOnResearchParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="/webapp/themes/tels/default/images/features/learning-technologies.png" alt="<spring:message code="pages.wise-advantage.learningTechnologiesAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.6powerfulLearningTechnologies" /></div>
							<p><spring:message code="pages.wise-advantage.powerfulLearningTechnologiesParagraphPart1" /> <a href="/webapp/pages/features.html"><spring:message code="pages.wise-advantage.innovativeCurriculumIntegratedTechnologies" /></a><spring:message code="pages.wise-advantage.powerfulLearningTechnologiesParagraphPart2" /> <a href="/webapp/previewprojectlist.html"><spring:message code="pages.wise-advantage.wiseLibraryProjects" /></a><spring:message code="pages.wise-advantage.powerfulLearningTechnologiesParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/meaningful-science.png" alt="<spring:message code="pages.wise-advantage.makeScienceMeaningfulAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.7makesScienceMeaningful" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.makesScienceMeaningfulParagraph" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="/webapp/themes/tels/default/images/features/diverse-learners.png" alt="<spring:message code="pages.wise-advantage.diverseLearnersAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.8supportsDiverseLearners" /></div>
							<p><spring:message code="pages.wise-advantage.supportsDiverseLearnersParagraphPart1" /> <a href="/webapp/pages/features.html"><spring:message code="pages.wise-advantage.varietyOfTools" /></a> <spring:message code="pages.wise-advantage.supportsDiverseLearnersParagraphPart2" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="/webapp/themes/tels/default/images/features/participation.png" alt="<spring:message code="pages.wise-advantage.participationAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.9increasesParticipationInScience" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.increasesParticipationInScienceParagraphPart1" /> <a href="/webapp/previewprojectlist.html"><spring:message code="pages.wise-advantage.wiseProjects" /></a> <spring:message code="pages.wise-advantage.increasesParticipationInScienceParagraphPart2" /> <a href="/webapp/pages/features.html"><spring:message code="pages.wise-advantage.toolsAndActivities" /></a><spring:message code="pages.wise-advantage.increasesParticipationInScienceParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="/webapp/themes/tels/default/images/features/free-open.png" alt="<spring:message code="pages.wise-advantage.freeAndOpenSourceAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.10freeAndOpenSource" /></div>
							<p><spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart1" /> <a href="http://nsf.gov"><spring:message code="pages.wise-advantage.nationalScienceFoundation" /></a><spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart2" /> <a href="/webapp/pages/research-tech.html#technology"><spring:message code="pages.wise-advantage.activeCommunityOfTechnologyDevelopers" /></a><spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart3" /> <a href="/webapp/previewprojectlist.html"><spring:message code="pages.wise-advantage.wiseProjectLibrary" /></a><spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart4" /> <a href="/webapp/pages/teacher-tools.html"><spring:message code="pages.wise-advantage.teachingTools" /></a> <spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart5" /> <a href="/webapp/signup.html"><spring:message code="pages.wise-advantage.signUp" /></a> <spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart6" /></p>
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