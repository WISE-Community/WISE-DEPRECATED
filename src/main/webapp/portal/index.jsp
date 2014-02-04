<%@ include file="include.jsp"%>

<!-- $Id$ -->

<!DOCTYPE html>
<html>
<head>

<META http-equiv="Content-Type" content="text/html; charset=UTF-8">

<!-- Always force latest IE rendering engine (even in intranet) & Chrome Frame
	Remove this if you use the .htaccess -->
<meta http-equiv="X-UA-Compatible" content="chrome=1"/>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="homepagestylesheet"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="jqueryjscrollpane.css"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="nivoslider.css"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="nivoslider-wise.css"/>" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="tinycarousel.css"/>" rel="stylesheet" type="text/css" />

<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />

<title><spring:message code="wiseTitle" /></title>

<!--NOTE: the following scripts has CONDITIONAL items that only apply to IE (MattFish)-->
<!--[if lt IE 7]>
<script defer type="text/javascript" src="./javascript/iefixes.js"></script>
<![endif]-->

<!--[if lt IE 8]>
<link href="<spring:theme code="ie7homestyles"/>" rel="stylesheet" type="text/css" />
<![endif]-->

</head>

<body>

<div id="pageWrapper">
	<%@ include file="headermain.jsp"%>
	<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
	<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c-rt" %>
	
	<div id="page">
		
		<div id="pageContent">
		
			<div class="showcase">
				<div id="about">
					<div class="panelHead"><span><spring:message code="index.whatIsWise" /></span></div>
					<div class="slider-wrapper theme-wise">
   				 		<div class="ribbon"></div>
						<div id="showcaseSlider">
						    <img src="${contextPath}/<spring:theme code="what_is_wise"/>" alt="<spring:message code="index.whatIsWise" />" />
						    <img src="${contextPath}/<spring:theme code="curriculum_based"/>" alt="<spring:message code="index.curriculumBased" />" />
						    <img src="${contextPath}/<spring:theme code="inquiry"/>" alt="<spring:message code="index.inquiryProjects" />" />
						    <img src="${contextPath}/<spring:theme code="engagement"/>" alt="<spring:message code="index.studentEngagement" />" />
						    <img src="${contextPath}/<spring:theme code="interactive"/>" alt="<spring:message code="index.interactiveModels" />" />
						    <img src="${contextPath}/<spring:theme code="teacher_tools_home"/>" alt="<spring:message code="index.teacherTools" />" />
						    <img src="${contextPath}/<spring:theme code="open_source"/>" alt="<spring:message code="index.openSource" />" />
						</div>
					</div>
				</div>
				<div id="news">
					<div class="panelHead"><spring:message code="index.newsTitle" /><!-- <a class="panelLink" title="News Archive"><spring:message code="index.newsMore" /></a> --></div>
					<div id="newsContent">
						<c:forEach var="newsItem" items="${newsItems}">
							<p class="newsTitle">${newsItem.title}<span class="newsDate"><fmt:formatDate value="${newsItem.date}" type="date" dateStyle="medium" /></span></p>
							<p class="newsSnippet">${newsItem.news}</p>
						</c:forEach>
					</div>
					<div id="socialLinks">
						<a href="http://www.facebook.com/pages/WISE-4/150541171679054" title="<spring:message code="index.facebookTitle" />"><img src="${contextPath}/<spring:theme code="facebook"/>" alt="facebook" /></a>
						<a href="https://twitter.com/#!/WISETELS" title="<spring:message code="index.twitterTitle" />" ><img src="${contextPath}/<spring:theme code="twitter"/>" alt="twitter" /></a>
					</div>
				</div>
			</div>
			
			<div class="showcase">
				<div id="projectHeader" class="feature"><span class="featureContent"><spring:message code="index.projects" /></span><a class="projectsLink" href="previewprojectlist.html" title="<spring:message code="index.projects" />"><spring:message code="index.browseCurricula" /></a></div>
				<div id="features">
					<div id="featureHeader" class="feature"><span class="featureContent"><spring:message code="index.features" /></span></div>
					<div id="featuresContent">
						<p><a href="pages/features.html"><spring:message code="index.features_learningEnvironment" /></a></p>
						<p><a href="pages/teacher-tools.html"><spring:message code="index.features_teacherTools" /></a></p>
						<p><a href="pages/gettingstarted.html"><spring:message code="index.features_gettingStarted" /></a></p>
						<p id="checkCompatibility"><a href="pages/check.html"><spring:message code="index.features_checkCompatibility" /></a></p>
					</div>
				</div>
				<div id="projectShowcase">
					<div id="project-showcase"> <!-- TODO: populate this section using auto-generated list of library subjects (remove hard-coded section labels and list items) -->
						<dl>
							<dt><spring:message code="index.projects_earthScience" /></dt>
						    <dd>
						    	<div class="tinycarousel">
							    	<a href="#" class="buttons prev">&#9650;</a>
								    <div class="viewport">
								        <ul class="overview">
									    	<c:forEach var="project" items="${esProjects}">
									    		<li class="libraryProject">
									    			<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
										    		<div class="projectDetails">
										    			<p class="name">${project.name}</p>
								      					<p class="metadata">Grades ${project.metadata.gradeRange} | ${project.metadata.totalTime} | ${project.metadata.language}</p>
								      					<p class="summary">${project.metadata.summary}</p>
								      				</div>
								      				<div class="projectLink"><a id="projectDetail_${project.id}" class="projectDetail" title="Project Details"><spring:message code="index.projects_moreDetails" /></a><a href="previewproject.html?projectId=${project.id}" target="_blank"><spring:message code="preview" /></a></div>
									    		</li>
									    	</c:forEach>
									    </ul>
									</div>
									<a href="#" class="buttons next">&#9660;</a>
								    <ul class="pager">
								    	<c:forEach var="project" items="${esProjects}" varStatus="status">
								        	<li><a rel="${status.count-1}" class="pagenum" href="#">${status.count}</a></li>
										</c:forEach>
								    </ul>
							    </div>
						    </dd>
						    <dt><spring:message code="index.projects_lifeScience" /></dt>
						    <dd>
						    	<div class="tinycarousel">
							    	<a href="#" class="buttons prev">&#9650;</a>
								    <div class="viewport">
								        <ul class="overview">
									    	<c:forEach var="project" items="${lsProjects}">
									    		<li class="libraryProject">
									    			<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
										    		<div class="projectDetails">
										    			<p class="name">${project.name}</p>
								      					<p class="metadata">Grades ${project.metadata.gradeRange} | ${project.metadata.totalTime} | ${project.metadata.language}</p>
								      					<p class="summary">${project.metadata.summary}</p>
								      				</div>
								      				<div class="projectLink"><a id="projectDetail_${project.id}" class="projectDetail" title="Project Details"><spring:message code="index.projects_moreDetails" /></a><a href="previewproject.html?projectId=${project.id}" target="_blank"><spring:message code="preview" /></a></div>
									    		</li>
									    	</c:forEach>
									    </ul>
									</div>
									<a href="#" class="buttons next">&#9660;</a>
								    <ul class="pager">
								    	<c:forEach var="project" items="${lsProjects}" varStatus="status">
								        	<li><a rel="${status.count-1}" class="pagenum" href="#">${status.count}</a></li>
										</c:forEach>
								    </ul>
							    </div>
						    </dd>
						    <dt><spring:message code="index.projects_physicalScience" /></dt>
						    <dd>
						    	<div class="tinycarousel">
							    	<a href="#" class="buttons prev">&#9650;</a>
								    <div class="viewport">
								        <ul class="overview">
									    	<c:forEach var="project" items="${psProjects}">
									    		<li class="libraryProject">
									    			<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
										    		<div class="projectDetails">
										    			<p class="name">${project.name}</p>
								      					<p class="metadata">Grades ${project.metadata.gradeRange} | ${project.metadata.totalTime} | ${project.metadata.language}</p>
								      					<p class="summary">${project.metadata.summary}</p>
								      				</div>
								      				<div class="projectLink"><a id="projectDetail_${project.id}" class="projectDetail" title="Project Details"><spring:message code="index.projects_moreDetails" /></a><a href="previewproject.html?projectId=${project.id}" target="_blank"><spring:message code="preview" /></a></div>
									    		</li>
									    	</c:forEach>
									    </ul>
									</div>
									<a href="#" class="buttons next">&#9660;</a>
								    <ul class="pager">
								    	<c:forEach var="project" items="${psProjects}" varStatus="status">
								        	<li><a rel="${status.count-1}" class="pagenum" href="#">${status.count}</a></li>
										</c:forEach>
								    </ul>
							    </div>
						    </dd>
						    <dt><spring:message code="index.projects_biology" /></dt>
						    <dd>
						    	<div class="tinycarousel">
							    	<a href="#" class="buttons prev">&#9650;</a>
								    <div class="viewport">
								        <ul class="overview">
									    	<c:forEach var="project" items="${bioProjects}">
									    		<li class="libraryProject">
									    			<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
										    		<div class="projectDetails">
										    			<p class="name">${project.name}</p>
								      					<p class="metadata">Grades ${project.metadata.gradeRange} | ${project.metadata.totalTime} | ${project.metadata.language}</p>
								      					<p class="summary">${project.metadata.summary}</p>
								      				</div>
								      				<div class="projectLink"><a id="projectDetail_${project.id}" class="projectDetail" title="Project Details"><spring:message code="index.projects_moreDetails" /></a><a href="previewproject.html?projectId=${project.id}" target="_blank"><spring:message code="preview" /></a></div>
									    		</li>
									    	</c:forEach>
									    </ul>
									</div>
									<a href="#" class="buttons next">&#9660;</a>
								    <ul class="pager">
								    	<c:forEach var="project" items="${bioProjects}" varStatus="status">
								        	<li><a rel="${status.count-1}" class="pagenum" href="#">${status.count}</a></li>
										</c:forEach>
								    </ul>
							    </div>
						    </dd>
						    <dt><spring:message code="index.projects_chemistry" /></dt>
						    <dd>
						    	<div class="tinycarousel">
							    	<a href="#" class="buttons prev">&#9650;</a>
								    <div class="viewport">
								        <ul class="overview">
									    	<c:forEach var="project" items="${chemProjects}">
									    		<li class="libraryProject">
									    			<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
										    		<div class="projectDetails">
										    			<p class="name">${project.name}</p>
								      					<p class="metadata">Grades ${project.metadata.gradeRange} | ${project.metadata.totalTime} | ${project.metadata.language}</p>
								      					<p class="summary">${project.metadata.summary}</p>
								      				</div>
								      				<div class="projectLink"><a id="projectDetail_${project.id}" class="projectDetail" title="Project Details"><spring:message code="index.projects_moreDetails" /></a><a href="previewproject.html?projectId=${project.id}" target="_blank"><spring:message code="preview" /></a></div>
									    		</li>
									    	</c:forEach>
									    </ul>
									</div>
									<a href="#" class="buttons next">&#9660;</a>
								    <ul class="pager">
								    	<c:forEach var="project" items="${chemProjects}" varStatus="status">
								        	<li><a rel="${status.count-1}" class="pagenum" href="#">${status.count}</a></li>
										</c:forEach>
								    </ul>
							    </div>
						    </dd>
						    <dt><spring:message code="index.projects_physics" /></dt>
						    <dd>
						    	<div class="tinycarousel">
							    	<a href="#" class="buttons prev">&#9650;</a>
								    <div class="viewport">
								        <ul class="overview">
									    	<c:forEach var="project" items="${physProjects}">
									    		<li class="libraryProject">
									    			<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
										    		<div class="projectDetails">
										    			<p class="name">${project.name}</p>
								      					<p class="metadata">Grades ${project.metadata.gradeRange} | ${project.metadata.totalTime} | ${project.metadata.language}</p>
								      					<p class="summary">${project.metadata.summary}</p>
								      				</div>
								      				<div class="projectLink"><a id="projectDetail_${project.id}" class="projectDetail" title="Project Details"><spring:message code="index.projects_moreDetails" /></a><a href="previewproject.html?projectId=${project.id}" target="_blank"><spring:message code="preview" /></a></div>
									    		</li>
									    	</c:forEach>
									    </ul>
									</div>
									<a href="#" class="buttons next">&#9660;</a>
								    <ul class="pager">
								    	<c:forEach var="project" items="${physProjects}" varStatus="status">
								        	<li><a rel="${status.count-1}" class="pagenum" href="#">${status.count}</a></li>
										</c:forEach>
								    </ul>
							    </div>
						    </dd>
					   </dl>
					  </div>
				</div>
				<div style="clear:both;"></div>
			</div>
			
			<div class="showcase">
				<a id="wiseAdvantage" href="pages/wise-advantage.html" class="panelSection">
					<div class="panelHead"><span><spring:message code="index.wiseAdvantage" /></span><span class="panelLink">+</span></div>
					<div class="panelContent"><img src="${contextPath}/<spring:theme code="wise_in_classroom"/>" alt="<spring:message code="index.wiseAdvantageTitle" />" /></div>
				</a>
				<a id="wiseInAction" href="pages/wise-in-action.html" class="panelSection">
					<div class="panelHead"><span><spring:message code="index.wiseInAction" /></span><span class="panelLink">+</span></div>
					<div class="panelContent"><img src="${contextPath}/<spring:theme code="wise_teaching"/>" alt="<spring:message code="index.wiseInActionTitle" />" /></div>
				</a>
				<a id="researchTech" href="pages/research-tech.html" class="panelSection">
					<div class="panelHead"><span><spring:message code="index.wiseResearchAndTech" /></span><span class="panelLink">+</span></div>
					<div class="panelContent"><img src="${contextPath}/<spring:theme code="wise_research"/>" alt="<spring:message code="index.wiseResearchAndTechTitle" />" /></div>
				</a>
				<div style="clear:both;"></div>
			</div>
			
			<div id="bottomLinks" class="showcase">
				<div id="telsLink"><a href="http://telscenter.org" target="_blank"><img src="${contextPath}/<spring:theme code="tels"/>"/></a></div>
				<div id="telsLinkLabel"><spring:message code="index.telsCommunity" /></div>
				<div id="openSourceHeader" class="feature">
					<span class="featureContent"><spring:message code="index.openSourcePartnerships" /></span>
				</div>
				<div id="openSourceContent"><spring:message code="index.openSourceInfo" /></div>
			</div>
		</div>
	</div>
	<%@ include file="footer.jsp"%>
</div>
<div id="projectDetailDialog" style="overflow:hidden;" class="dialog"></div>

<!-- <script src="<spring:theme code="jquerysource"/>" type="text/javascript"></script> -->
<script src="${contextPath}/<spring:theme code="jquerymigrate.js"/>" type="text/javascript"></script>
<!-- <script src="<spring:theme code="jqueryuisource"/>" type="text/javascript"></script> -->
<script src="${contextPath}/<spring:theme code="jquerymousewheel.js"/>" type="text/javascript"></script>
<!-- <script src="<spring:theme code="mwheelintent.js"/>" type="text/javascript"></script>  -->
<script src="${contextPath}/<spring:theme code="jqueryjscrollpane.js"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="nivoslider.js"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="easyaccordion.js"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="tinycarousel.js"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="generalsource"/>" type="text/javascript"></script>

<script type="text/javascript">
	$(document).ready(function(){
		
		//focus cursor into the First Name field on page ready 
		if($('#j_username').length){
			$('#j_username').focus();
		}
		
		$('#newsContent').jScrollPane();
		
		loadProjectThumbnails();
		
		// Set up view project details click action for each project id link
		$('#projectShowcase').on('click','a.projectDetail',function(){
			var title = $(this).attr('title');
			var projectId = $(this).attr('id').replace('projectDetail_','');
			var path = "teacher/projects/projectinfo.html?projectId=" + projectId;
			var div = $('#projectDetailDialog').html('<iframe id="projectIfrm" width="100%" height="100%"></iframe>');
			div.dialog({
				width: '800',
				height: '400',
				title: title,
				modal:true,
				close: function(){ $(this).html(''); },
				buttons: {
					Close: function(){
						$(this).dialog('close');
					}
				}
			});
			$("#projectDetailDialog > #projectIfrm").attr('src',path);
		});
	});
	
	$(window).load(function() {
		
		// initiate showcase slider
		$('#showcaseSlider').nivoSlider({
			effect:'sliceDownRight',
			animSpeed:500,
			pauseTime:10000,
			prevText: '>',
	        nextText: '<',
	        directionNav: false,
	        beforeChange: function(){
	        	$('#about .panelHead span').fadeOut('slow');
	        },
	        afterChange: function(){
	        	var active = $('#showcaseSlider').data('nivo:vars').currentSlide;
	        	$('#about .panelHead span').text($('#showcaseSlider > img').eq(active).attr('alt'));
	        	$('#about .panelHead span').fadeIn('fast');
	        }
		});
		
		// set random opening slide for project showcase
		var numSlides = $('#projectShowcase dt').length;
		var start = Math.floor(Math.random()*numSlides);
		
		// initiate project showcase accordion
		$('#project-showcase').easyAccordion({ 
		   autoStart: false,
		   slideNum: false,
		   startSlide: start
		});
		
		$('.tinycarousel').tinycarousel({ axis: 'y', pager: true, duration:500 });
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
							//$(this).html("<img src='${contextPath}/<spring:theme code="twitter"/>' alt='thumb'></img>");
						}
					}
				});
			});
	};
</script>

</body>

</html>

