<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta name=Title content="<spring:message code="pages.teacherfaq.wise4TeacherInformationSheet" />">
<meta name=Keywords content="">
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<%@ include file="../favicon.jsp"%>
<title><spring:message code="pages.teacherfaq.wise4TeacherInformationSheet" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>

<style type="text/css">
#tableOfContents {
  border:1px dotted;
  padding:10px;
  width:300px;
  margin-bottom:10px;
}

#tableOfContents > ul > li {
  padding: 5px 0px 0px 10px;
}

#tableOfContentsHeader {
  font-weight:bold;
}
</style>
</head>
<body>
<spring:htmlEscape defaultHtmlEscape="false">
<spring:escapeBody htmlEscape="false">
<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>

	<div id="page">

		<div id="pageContent">

			<div class="contentPanel">
			<div class="panelHeader"><spring:message code="pages.teacherfaq.wiseTeacherFrequentlyAskedQuestions" /> <span style="float:right;"><a class="printLesson" onClick="window.print();return false"><spring:message code="print" /></a></span></div>
			<div class="panelContent">
				<div id="tableOfContents">
					<span id="tableOfContentsHeader"><spring:message code="tableOfContents" /></span>
					<ul>
						<li><a href="#studentManagement"><spring:message code="pages.teacherfaq.studentManagement" /></a></li>
						<li><a href="#projectManagement"><spring:message code="pages.teacherfaq.projectManagement" /></a></li>
						<li><a href="#assessmentOfStudentWork"><spring:message code="pages.teacherfaq.assessmentOfStudentWork" /></a></li>
						<li><a href="#realtime"><spring:message code="pages.teacherfaq.realTimeClassroomMonitor" /></a></li>
						<li><a href="#technicalQuestions"><spring:message code="pages.teacherfaq.technicalQuestions" /></a></li>
					</ul>
				</div>

				<div class="sectionHead" id="studentManagement"><spring:message code="pages.teacherfaq.studentManagement" /></div>
				<div class="sectionContent">
					<div class="question"><spring:message code="pages.teacherfaq.shouldIRegisterStudentsQuestion" /></div>
					<div class="answer">
						<p><spring:message code="pages.teacherfaq.shouldIRegisterStudentsAnswerPart1" /></p>
						<ul>
						    <li><spring:message code="pages.teacherfaq.shouldIRegisterStudentsAnswerPart2" /></li>
    						<li><spring:message code="pages.teacherfaq.shouldIRegisterStudentsAnswerPart3" /></li>
						</ul>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.studentForgotUsernameOrPasswordQuestion" /></div>
					<div class="answer">
						<ul>
						    <li><spring:message code="pages.teacherfaq.studentForgotUsernameOrPasswordAnswerPart1" /></li>
						    <li><spring:message code="pages.teacherfaq.studentForgotUsernameOrPasswordAnswerPart2" /></li>
						    <li><spring:message code="pages.teacherfaq.studentForgotUsernameOrPasswordAnswerPart3" /></li>
						</ul>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.howChangeStudentTeamQuestion" /></div>
					<div class="answer">
						<ul>
						    <li><spring:message code="pages.teacherfaq.howChangeStudentTeamAnswerPart1" /></li>
						    <li><spring:message code="pages.teacherfaq.howChangeStudentTeamAnswerPart2" /></li>
						    <li><spring:message code="pages.teacherfaq.howChangeStudentTeamAnswerPart3" /></li>
						    <li><spring:message code="pages.teacherfaq.howChangeStudentTeamAnswerPart4" /></li>
						    <li><spring:message code="pages.teacherfaq.howChangeStudentTeamAnswerPart5" /></li>
						    <li><spring:message code="pages.teacherfaq.howChangeStudentTeamAnswerPart6" /></li>
						    <li><spring:message code="pages.teacherfaq.howChangeStudentTeamAnswerPart7" /></li>
						</ul>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.howChangeStudentPasswordQuestion" /></div>
					<div class="answer">
					<ul>
					    <li><spring:message code="pages.teacherfaq.howChangeStudentPasswordAnswerPart1" /></li>
					    <li><spring:message code="pages.teacherfaq.howChangeStudentPasswordAnswerPart2" />
					          <ul>
					            <li><spring:message code="pages.teacherfaq.howChangeStudentPasswordAnswerPart3" /></li>
					            <li><spring:message code="pages.teacherfaq.howChangeStudentPasswordAnswerPart4" /></li>
					            <li><spring:message code="pages.teacherfaq.howChangeStudentPasswordAnswerPart5" /></li>
					            <li><spring:message code="pages.teacherfaq.howChangeStudentPasswordAnswerPart6" /></li>
					          </ul>
					    </li>
					</ul>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.iDoNotRememberAccessCodeQuestion" /></div>
					<div class="answer">
					<ul>
					    <li><spring:message code="pages.teacherfaq.iDoNotRememberAccessCodeAnswerPart1" /></li>
					    <li><spring:message code="pages.teacherfaq.iDoNotRememberAccessCodeAnswerPart2" /></li>
					    <li><spring:message code="pages.teacherfaq.iDoNotRememberAccessCodeAnswerPart3" /></li>
					</ul>
					</div>
				</div>

				<div class="sectionHead" id="projectManagement"><spring:message code="pages.teacherfaq.projectManagement" /></div>
				<div class="sectionContent">
					<div class="question"><spring:message code="pages.teacherfaq.whenShouldISetUpRunQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.whenShouldISetUpRunAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.howLongRunTakeQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.howLongRunTakeAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.canIShortenProjectQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.canIShortenProjectAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.howReviewAndGradeWorkQuestion" /></div>
					<div class="answer">
						<ul>
						    <li><spring:message code="pages.teacherfaq.howReviewAndGradeWorkAnswerPart1" /></li>
						    <li><spring:message code="pages.teacherfaq.howReviewAndGradeWorkAnswerPart2" /></li>
						    <li><spring:message code="pages.teacherfaq.howReviewAndGradeWorkAnswerPart3" /></li>
						</ul>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.howStudentsSeeMyCommentsAndScoresQuestion" /></div>
					<div class="answer">
						<ul>
						    <li><spring:message code="pages.teacherfaq.howStudentsSeeMyCommentsAndScoresAnswerPart1" /></li>
						    <li><spring:message code="pages.teacherfaq.howStudentsSeeMyCommentsAndScoresAnswerPart2" /></li>
						    <li><spring:message code="pages.teacherfaq.howStudentsSeeMyCommentsAndScoresAnswerPart3" /></li>
						    <li><spring:message code="pages.teacherfaq.howStudentsSeeMyCommentsAndScoresAnswerPart4" /></li>
						</ul>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.whereFindLessonPlansAndStandardsQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.whereFindLessonPlansAndStandardsAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.howFitProjectIntoMyCurriculumQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.howFitProjectIntoMyCurriculumAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.whatIfRunOutOfLabTimeQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.whatIfRunOutOfLabTimeAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.iDoNotRememberTeacherAccessCodeQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.iDoNotRememberTeacherAccessCodeAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.whyIsNavigationBarDisappearingQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.whyIsNavigationBarDisappearingAnswer" />
					</div>

				</div>

				<div class="sectionHead" id="assessmentOfStudentWork"><spring:message code="pages.teacherfaq.assessmentOfStudentWork" /></div>
				<div class="sectionContent">
					<div class="question"><spring:message code="pages.teacherfaq.whereFindStudentWorkQuestion" /></div>
					<div class="answer">
						<ul>
						    <li><spring:message code="pages.teacherfaq.whereFindStudentWorkAnswerPart1" /></li>
						    <li><spring:message code="pages.teacherfaq.whereFindStudentWorkAnswerPart2" /></li>
						</ul>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.whatShouldILookForInStudentAnswersQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.whatShouldILookForInStudentAnswersAnswer" /><br/><br/>
						<a href="${contextPath}/<spring:theme code="sample_rubric"/>"><spring:message code="pages.teacherfaq.sampleRubric" /></a>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.howEncourageStudentsReviewNotesAndCommentsQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.howEncourageStudentsReviewNotesAndCommentsAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.howFindTimeToGradeAllStudentWorkQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.howFindTimeToGradeAllStudentWorkAnswer" />
					</div>

				</div>

				<div class="sectionHead" id="realtime"><spring:message code="pages.teacherfaq.realTimeClassroomMonitor" /></div>
				<div class="sectionContent">

					<div class="question"><spring:message code="pages.teacherfaq.whatIsRealTimeClassroomMonitorQuestion" /></div>
					<div class="answer"><spring:message code="pages.teacherfaq.whatIsRealTimeClassroomMonitorAnswer" /></div>

					<div class="question"><spring:message code="pages.teacherfaq.whatAreTechnicalRequirementsForRealTimeClassroomMonitorQuestion" /></div>
					<div class="answer"><spring:message code="pages.teacherfaq.whatAreTechnicalRequirementsForRealTimeClassroomMonitorAnswer" /></div>

					<div class="question"><spring:message code="pages.teacherfaq.howTurnOnOffRealTimeClassroomMonitorQuestion" /></div>
					<div class="answer"><spring:message code="pages.teacherfaq.howTurnOnOffRealTimeClassroomMonitorAnswer" /></div>

					<div class="question"><spring:message code="pages.teacherfaq.doesRealTimeClassroomMonitorWorkOnTabletQuestion" /></div>
					<div class="answer"><spring:message code="pages.teacherfaq.doesRealTimeClassroomMonitorWorkOnTabletAnswer" /></div>

					<div class="question"><spring:message code="pages.teacherfaq.canRealTimeClassroomMonitorPauseStudentScreensQuestion" /></div>
					<div class="answer"><spring:message code="pages.teacherfaq.canRealTimeClassroomMonitorPauseStudentScreensAnswer" /></div>
				</div>

				<div class="sectionHead" id="technicalQuestions"><spring:message code="pages.teacherfaq.technicalQuestions" /></div>
				<div class="sectionContent">
					<div class="question"><spring:message code="pages.teacherfaq.websiteWontLoadQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.websiteWontLoadAnswerPart1" />
						<a href="${contextPath}/pages/check.html"><spring:message code="pages.teacherfaq.wiseCompatibilityTest" /></a><br/><br/>

						<spring:message code="pages.teacherfaq.websiteWontLoadAnswerPart2" />
						<a target=_blank href="http://www.wikihow.com/Clear-Your-Browser's-Cache"><spring:message code="pages.teacherfaq.howToClearCache" /></a>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.howManyComputersDoINeedQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.howManyComputersDoINeedAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.whatIfTroubleLoggingInQuestion" /></div>
					<div class="answer">
						<ul>
						    <li><spring:message code="pages.teacherfaq.whatIfTroubleLoggingInAnswerPart1" /></li>
						    <li><spring:message code="pages.teacherfaq.whatIfTroubleLoggingInAnswerPart2" /></li>
						</ul>
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.wiseInAnotherLanguageQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.wiseInAnotherLanguageAnswer" />
					</div>

					<div class="question"><spring:message code="pages.teacherfaq.whoContactWhenHaveProblemQuestion" /></div>
					<div class="answer">
						<spring:message code="pages.teacherfaq.whoContactWhenHaveProblemAnswer" />
					</div>

				</div>

				</div>  <!--  end of panelContent -->
			</div>  <!--  end of contentPanel -->

		</div>

		<div style="clear: both;"></div>
	</div>   <!-- End of page-->

	<%@ include file="../footer.jsp"%>
</div>
</spring:escapeBody>
</spring:htmlEscape>
</body>
</html>
