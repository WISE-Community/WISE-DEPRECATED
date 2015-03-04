<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<META http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="chrome=1"/>
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="pages.wise-advantage.theWISEAdvantage" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="homepagestylesheet"/>" rel="stylesheet" type="text/css" />
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
			
				<div class="panelHeader"><spring:message code="pages.wise-advantage.top10ReasonsForUsingWISE" /></div>
				
				<div class="panelContent">
					<div class="featuresShowcase right">
						<img src="${contextPath}/<spring:theme code="inquiry_learning"/>" alt="<spring:message code="pages.wise-advantage.inquiryLearningAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.1inquiryBasedLearning" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.inquiryLearningParagraphPart1" /> <a href="${contextPath}/pages/features.html"><spring:message code="pages.wise-advantage.activitiesAndScaffoldingTools" /></a><spring:message code="pages.wise-advantage.inquiryLearningParagraphPart2" /> <a href="${contextPath}/previewprojectlist.html"><spring:message code="pages.wise-advantage.inquiryBasedProjects" /></a><spring:message code="pages.wise-advantage.inquiryLearningParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="${contextPath}/<spring:theme code="library"/>" alt="<spring:message code="pages.wise-advantage.wiseLibraryAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.2growingLibrary" /></div>
							<p><spring:message code="pages.wise-advantage.growingLibraryParagraphPart1" /> <a href="${contextPath}/previewprojectlist.html"><spring:message code="pages.wise-advantage.wiseProjectLibrary" /></a> <spring:message code="pages.wise-advantage.growingLibraryParagraphPart2" /> <a href="${contextPath}/pages/research-tech.html"><spring:message code="pages.wise-advantage.classroomBasedResearch" /></a><spring:message code="pages.wise-advantage.growingLibraryParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="${contextPath}/<spring:theme code="standards_science"/>" alt="<spring:message code="pages.wise-advantage.standardsBasedScienceAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.3standardsBasedScience" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.standardsBasedScienceParagraph" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="${contextPath}/<spring:theme code="teacher_tools"/>" alt="<spring:message code="pages.wise-advantage.teacherToolsAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.4comprehensiveInstructionalSupport" /></div>
							<p><spring:message code="pages.wise-advantage.comprehensiveInstructionalSupportParagraphPart1" /> <a href="${contextPath}/pages/teacher-tools.html"><spring:message code="pages.wise-advantage.suiteOfIntegratedTools" /></a> <spring:message code="pages.wise-advantage.comprehensiveInstructionalSupportParagraphPart2" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="${contextPath}/<spring:theme code="research_practice"/>" alt="<spring:message code="pages.wise-advantage.researchAndPracticeAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.5basedOnResearch" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.basedOnResearchParagraphPart1" /> <a href="${contextPath}/pages/research-tech.html"><spring:message code="pages.wise-advantage.20yearsOfResearch" /></a> <spring:message code="pages.wise-advantage.basedOnResearchParagraphPart2" /> <a href="${contextPath}/pages/research-tech.html#ki"><spring:message code="pages.wise-advantage.setOfPrinciples" /></a><spring:message code="pages.wise-advantage.basedOnResearchParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="${contextPath}/<spring:theme code="learning_technologies"/>" alt="<spring:message code="pages.wise-advantage.learningTechnologiesAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.6powerfulLearningTechnologies" /></div>
							<p><spring:message code="pages.wise-advantage.powerfulLearningTechnologiesParagraphPart1" /> <a href="${contextPath}/pages/features.html"><spring:message code="pages.wise-advantage.innovativeCurriculumIntegratedTechnologies" /></a><spring:message code="pages.wise-advantage.powerfulLearningTechnologiesParagraphPart2" /> <a href="${contextPath}/previewprojectlist.html"><spring:message code="pages.wise-advantage.wiseLibraryProjects" /></a><spring:message code="pages.wise-advantage.powerfulLearningTechnologiesParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="${contextPath}/<spring:theme code="meaningful_science"/>" alt="<spring:message code="pages.wise-advantage.makeScienceMeaningfulAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.7makesScienceMeaningful" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.makesScienceMeaningfulParagraph" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="${contextPath}/<spring:theme code="diverse_learners"/>" alt="<spring:message code="pages.wise-advantage.diverseLearnersAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.8supportsDiverseLearners" /></div>
							<p><spring:message code="pages.wise-advantage.supportsDiverseLearnersParagraphPart1" /> <a href="${contextPath}/pages/features.html"><spring:message code="pages.wise-advantage.varietyOfTools" /></a> <spring:message code="pages.wise-advantage.supportsDiverseLearnersParagraphPart2" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase right">
						<img src="${contextPath}/<spring:theme code="participation"/>" alt="<spring:message code="pages.wise-advantage.participationAlt" />" />
						<div class="featureContentHeader"><spring:message code="pages.wise-advantage.9increasesParticipationInScience" /></div>
						<div class="featureContent">
							<p><spring:message code="pages.wise-advantage.increasesParticipationInScienceParagraphPart1" /> <a href="${contextPath}/previewprojectlist.html"><spring:message code="pages.wise-advantage.wiseProjects" /></a> <spring:message code="pages.wise-advantage.increasesParticipationInScienceParagraphPart2" /> <a href="${contextPath}/pages/features.html"><spring:message code="pages.wise-advantage.toolsAndActivities" /></a><spring:message code="pages.wise-advantage.increasesParticipationInScienceParagraphPart3" /></p>
						</div>
						<div style="clear:both;"></div>
					</div>
					<div class="featuresShowcase left">
						<img src="${contextPath}/<spring:theme code="free_open"/>" alt="<spring:message code="pages.wise-advantage.freeAndOpenSourceAlt" />" />
						<div class="featureContent">
							<div class="featureContentHeader"><spring:message code="pages.wise-advantage.10freeAndOpenSource" /></div>
							<p><spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart1" /> <a href="http://nsf.gov"><spring:message code="pages.wise-advantage.nationalScienceFoundation" /></a><spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart2" /> <a href="${contextPath}/pages/research-tech.html#technology"><spring:message code="pages.wise-advantage.activeCommunityOfTechnologyDevelopers" /></a><spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart3" /> <a href="${contextPath}/previewprojectlist.html"><spring:message code="pages.wise-advantage.wiseProjectLibrary" /></a><spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart4" /> <a href="${contextPath}/pages/teacher-tools.html"><spring:message code="pages.wise-advantage.teachingTools" /></a> <spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart5" /> <a href="${contextPath}/signup.html"><spring:message code="pages.wise-advantage.signUp" /></a> <spring:message code="pages.wise-advantage.freeAndOpenSourceParagraphPart6" /></p>
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