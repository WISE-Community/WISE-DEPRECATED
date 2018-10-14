 <%@ include file="include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherrunstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="generalsource"/>"></script>


<title><spring:message code="teacher.projects.projectinfo.title"/></title>

<script type="text/javascript">
	$(document).ready(function(){
		// load project thumbnails
		loadProjectThumbnails();

		$('#viewLesson_' + ${project.id}).click(function(){
			$('#lessonPlan_' + ${project.id}).slideToggle();
		});
	});

	// load thumbnails for each project by looking for curriculum_folder/assets/project_thumb.png (makes a ajax GET request)
	// If found (returns 200 status), it will replace the default image with the fetched image.
	// If not found (returns 400 status), it will do nothing, and the default image will be used.
	function loadProjectThumbnails() {
		$(".projectThumb").each(
			function() {
				var thumbUrl = $(this).attr("thumbUrl");
				// check if thumbUrl exists
				$.ajax({
					url:thumbUrl,
					context:this,
					statusCode: {
						200:function() {
				  		    // found, use it
							$(this).html("<img src='"+$(this).attr("thumbUrl")+"' alt='thumb'></img>");
						},
						404:function() {
						    // not found, leave alone
							//$(this).html("<img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></img>");
						}
					}
				});
			});
	};
</script>
<style media="screen">
  .basicCreated {
    float:right;
  }
  [dir=rtl] .basicCreated {
    float:left;
  }
  .basicPreview {
    float:right;
  }
  [dir=rtl] .basicPreview {
    float:left;
  }
</style>

</head>

<body style="background:#FFFFFF;">
<div class="projectSummary">
	<div class="projectInfoDisplay">
		<div class="panelHeader">${project.name} (<spring:message code="id_label" /> ${project.id})
			<span class="basicPreview"><a href="<c:url value="/previewproject.html"><c:param name="projectId" value="${project.id}"/></c:url>" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" /><span><spring:message code="preview"/></span></a></span>
		</div>
		<div class="projectThumb" thumbUrl="${projectThumbPath}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
		<div class="summaryInfo">
			<div class="basicInfo">
				<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
				<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
				<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}"><spring:message code="teacher.projects.projectinfo.meta_duration" /> ${project.metadata.totalTime} | </c:if>
				<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
				<div class="basicCreated"><spring:message code="teacher.management.projectlibrarydisplay.created" />: <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" /></div>
			</div>
			<div id="summaryText_${project.id}" class="summaryText">
				<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary"/></span> ${project.metadata.summary}
			</div>
			<div class="details" id="details_${project.id}">
				<c:if test="${project.metadata.keywords != null && project.metadata.keywords != ''}"><p><span style="font-weight:bold;">Tags:</span> ${project.metadata.keywords}</p></c:if>
				<!--<p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString} (<a href="${contextPath}/pages/check.html?projectId=${project.id}" target="_blank"><spring:message code="teacher.projects.projectinfo.checkCompatibility" /></a>)</p>
				<c:if test="${project.metadata.compTime != null && project.metadata.compTime != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_compTime" /></span> ${project.metadata.compTime}</p></c:if>-->
				<p><span style="font-weight:bold;"><spring:message code="teacher.management.projectlibrarydisplay.projectContact" /></span> <a href="${contextPath}/contact/contactwise.html?projectId=${project.id}" target="_blank"><spring:message code="contact_wise" /></a></p>
				<!-- <c:if test="${project.metadata.author != null && project.metadata.author != ''}"><p><span style="font-weight:bold;">Original Owner:</span> ${project.metadata.author}</p></c:if> -->
				<!--<c:set var="lastEdited" value="${project.metadata.lastEdited}" />
				<c:if test="${lastEdited == null || lastEdited == ''}">
					<c:set var="lastEdited" value="${project.dateCreated}" />
				</c:if>
				<p><span style="font-weight:bold;">Last Updated:</span> <fmt:formatDate value="${lastEdited}" type="both" dateStyle="medium" timeStyle="short" /></p>
				<c:if test="${project.parentProjectId != null}">
					<p><span style="font-weight:bold"><spring:message code="teacher.projects.projectinfo.copyLabel"/></span> ${project.parentProjectId}</p>
				</c:if>-->
				<c:if test="${(project.metadata.lessonPlan != null && project.metadata.lessonPlan != '') ||
					(project.metadata.standards != null && project.metadata.standards != '')}">
					<div class="viewLesson"><a class="viewLesson" id="viewLesson_${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards_tip"/>"><spring:message code="teacher.projects.projectinfo.tipsAndStandards"/></a></div>
					<div class="lessonPlan" style="display:none;" id="lessonPlan_${project.id}">
						<c:if test="${project.metadata.lessonPlan != null && project.metadata.lessonPlan != ''}">
							<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_tips"/></div>
							<div class="sectionContent">${project.metadata.lessonPlan}</div>
						</c:if>
						<c:if test="${project.metadata.standards != null && project.metadata.standards != ''}">
							<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_standards"/></div>
							<div class="sectionContent">${project.metadata.standards}</div>
						</c:if>
					</div>
				</c:if>
			</div>
		</div>
	</div>
</div>

</body>
</html>
