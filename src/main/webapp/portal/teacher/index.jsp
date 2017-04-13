<%@ include file="../include.jsp"%>
<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<%@ include file="../favicon.jsp"%>
<title><spring:message code="teacher.index.wiseTeacherDashboard" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" media="screen" rel="stylesheet" type="text/css" >

<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jqueryuisource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="superfishsource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerymigrate.js"/>"></script>

<script type='text/javascript'>
var isTeacherIndex = true; //global var used by spawned pages (i.e. archive run)

$(document).ready(function() {
    var goodMorningMsg = '<spring:message code="teacher.index.hopeHavingGoodMorning" />';
    var goodAfternoonMsg = '<spring:message code="teacher.index.goodAfternoon" />';
    var goodEveningMsg = '<spring:message code="teacher.index.goodEvening" />';

    var currentDate = new Date();
    var currentHour = currentDate.getHours();
    var welcomeMsg = "";
    if (currentHour >= 0 && currentHour < 12) {
        welcomeMsg = goodMorningMsg;
    } else if (currentHour >= 12 && currentHour < 18) {
        welcomeMsg = goodAfternoonMsg;
    } else if (currentHour >= 18 && currentHour < 23) {
        welcomeMsg = goodEveningMsg;
    }

    $("#welcomeMsg").html(welcomeMsg);
});
</script>
</head>
<body>
<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>

    <c:set var="current_date" value="<%=new java.util.Date()%>" />
	<div id="page">

		<div id="pageContent">
			<div class="sidebar sidebarLeft">
				<div class="sidePanel">
					<div class="panelHeader"><spring:message code="teacher.index.quickLinks" /></div>

					<div class="panelContent">

						<table id="teacherQuickLinks">
							<tr>
								<td><a href="${contextPath}/pages/gettingstarted.html" target="_blank"><spring:message code="teacher.index.quickstartGuide"/></a></td>
							</tr>
							<tr>
								<td><a id="projectLibraryLink" href="${contextPath}/teacher/management/library.html"><spring:message code="teacher.index.browseWISEProjects"/></a></td>
							</tr>
							<tr>
								<td><a href="${contextPath}/teacher/management/classroomruns.html"><spring:message code="teacher.index.gradeAndManageClassroomRuns"/></a></td>
							</tr>
							<!--  TODO: uncomment me to re-enable premade comments when it's added to ClassroomMonitor tool
							<tr>
								<td><a onclick="editPremadeComments()"><spring:message code="accountmenu.editpremadecomments" /></a></td>
							</tr>
							-->
							<c:if test="${discourseSSOLoginURL != null}">
							   <tr>
							   	  <td><a target=_blank href="${discourseSSOLoginURL}"><spring:message code="wiseTeacherCommunity"/></a></td>
							   </tr>
                 			</c:if>

							<sec:authorize access="hasAnyRole('ROLE_TRANSLATOR,ROLE_ADMINISTRATOR')">
								<td><a href="${contextPath}/translate">Translate WISE</a></td>
							</sec:authorize>
						</table>
					</div>
				</div>

				<div class='sidePanel'>
					<div class="panelHeader"><spring:message code="teacher.index.messages" /></div>

					<div class="panelContent">

						<table id="teacherMessageTable">
							<tr>
								<td>
								<div id="welcomeMsg" class="highlight welcomeMsg"></div>
								<div id="newsContent" class="highlight welcomeMsg">
									<c:forEach var="newsItem" items="${teacherOnlyNewsItems}">
										<div class="newsItem">
											<p class="newsTitle"><span class="newsDate"><fmt:formatDate value="${newsItem.date}" type="date" dateStyle="short" /></span>${newsItem.title}</p>
											<p class="newsSnippet">${newsItem.news}</p>
										</div>
									</c:forEach>
								</div>
								<ul class="reminders">
									<c:forEach var="run" items="${current_run_list1}">
										<sec:accesscontrollist domainObject="${run}" hasPermission="16">
											<c:if test='${(run.archiveReminderTime.time - current_date.time) < 0}'>
												<li><spring:message code="teacher.index.yourProjectRun" /> <span style="font-weight:bold;">${run.name} (${run.id})</span> <spring:message code="teacher.index.hasBeenOpenSince" />
													<fmt:formatDate value="${run.starttime}" type="date" dateStyle="medium" timeStyle="short" />.
													 <spring:message code="teacher.index.doYouWantToArchive" />  [<a class="runArchiveLink"
													 	id="archiveRun_runId=${run.id}&runName=<c:out value="${fn:escapeXml(run.name)}" />" title="<spring:message code="teacher.management.projectruntabs.archive_title"/> ${run.name} (<spring:message code="run_id"/> ${run.id})"
														><spring:message code="teacher.index.yes" /></a> / <a class="extendReminderLink" id='extendReminder_${run.id}'><spring:message code="teacher.index.remindMeLater" /></a>]</li>
											</c:if>
										</sec:accesscontrollist>
									</c:forEach>
								</ul>
								</td>
							</tr>
						</table>
					</div>
				</div>
			</div>

			<div class="contentPanel contentRight">
				<div class="panelHeader">
					<spring:message code="teacher.index.recentActivity" />
					<span class="pageTitle"><spring:message code="teacher.index.teacherHome"/></span>
				</div>

				<div class="panelContent">
					<%@ include file="run/recentactivity.jsp"%>
				</div>

				<c:if test="${discourseSSOLoginURL != null}">
				 <div id="discourseDiv" class="panelFooter" style="text-align:center; padding:10px; color:#745A33">
                    <span><spring:message code="wiseTeacherCommunity.questionsUsingWISE"/> <a target=_blank href="${discourseSSOLoginURL}"><spring:message code="wiseTeacherCommunity.askWISECommunity"/></a></span>
                 </div>
                 </c:if>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page -->

	<%@ include file="../footer.jsp" %>
</div>
<div id="archiveRunDialog" style="overflow:hidden;" class="dialog"></div>

<div id="editPremadeCommentsDiv" style="display: none;"></div>
<div id="editPremadeCommentsLoadingDiv" style="display: none;">
	<h5 style="text-align: center">
		<spring:message code="accountmenu.loadingPremadeComments" />
	</h5>
</div>

<script type="text/javascript">
    /**
     * Asynchronously updates the run with the given id on the server and
     * displays the appropriate reponse when completed.
     */
    $('.extendReminderLink').on('click',function(){
    	var link = $(this);
    	var id = $(this).attr('id').replace('extendReminder_','');
    	var updatingText = $('<span style="color: #DDCDB5;"> ' + '<spring:message code="teacher.index.updating"/>' + '</span>');
    	link.parent().append(updatingText);
    	$.ajax({
			type:"post",
			url: "${contextPath}/teacher/run/updateRun.html",
			data:{"command":"extendReminderTime","runId":id},
			success: function(request){
				updatingText.remove();
				link.css('text-decoration','strike-through');
				link.parent().append('<span style="color: #DDCDB5;"> ' + '<spring:message code="teacher.index.youWillBeReminded"/>' + ' ' + id + ' ' + '<spring:message code="teacher.index.in30Days"/>');
				setTimeout(function(){link.parent().fadeOut();},5000);
			},
			error: function(request,error){
				updatingText.remove();
				link.parent().append('<span style="color: #DD2424;"> ' + '<spring:message code="teacher.index.unableToUpdateRun"/> ' + id + ' ' + '<spring:message code="teacher.index.tryAgainLater"/>' + '</span>');
			}
       	});
       });

        /**
        * Asynchronously archives a run
        **/
        $('.runArchiveLink').on('click',function(){
    		var title = $(this).attr('title');
   			var params = $(this).attr('id').replace('archiveRun_','');
   			var path = "${contextPath}/teacher/run/manage/archiveRun.html?" + params;
    		var div = $('#archiveRunDialog').html('<iframe id="archiveIfrm" width="100%" height="100%"></iframe>');
    		div.dialog({
    			modal: true,
    			width: '600',
    			height: '450',
    			title: title,
    			close: function(){
    				if(document.getElementById('archiveIfrm').contentWindow['refreshRequired']){
    					window.location.reload();
    				}
    				$(this).html('');
    			},
    			buttons: {
    				Close: function(){
    					$(this).dialog('close');
                        window.location.reload();
                   }
    			}
    		});
    		$("#archiveRunDialog > #archiveIfrm").attr('src',path);
        });


        /**
		 * the user has clicked "Edit Premade Comments" from the drop down on
		 * the teacher home page.
		 * TODO: move to external js file
		 */
		function editPremadeComments() {

			//create a popup for the loading premade comments message
			$('#editPremadeCommentsLoadingDiv').dialog({
				autoOpen : false
			});

			//display the loading premade comments message
			$('#editPremadeCommentsLoadingDiv').dialog('open');

			//create a div with an iframe in it so we can load the vle in it
			var div = $('#editPremadeCommentsDiv')
					.html(
							'<iframe id="editPremadeCommentsIfrm" width="100%" height="100%" style="overflow-y:hidden;"></iframe>');

			/*
			 * the path to open the authoring tool that will automatically
			 * open the premade comments. this will not display the authoring
			 * tool. we are only loading the authoring tool so that the vle
			 * is loaded and can then open the premade comments editing view.
			 */
			var path = '${contextPath}/author/authorproject.html?editPremadeComments=true';

			//set the path to start loading the authoring tool
			$("#editPremadeCommentsIfrm").attr('src', path);
		}

		/**
		 * Close the loading premade comments message
		 */
		function closeLoadingPremadeCommentsDialog() {
			$('#editPremadeCommentsLoadingDiv').dialog('close');
		}
</script>
</body>
</html>
