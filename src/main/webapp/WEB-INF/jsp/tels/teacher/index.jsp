<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html lang="en">
<head>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script> 
<script type="text/javascript" src="<spring:theme code="jqueryuisource"/>"></script>
<script type="text/javascript" src="<spring:theme code="jquerymigrate.js"/>"></script>
<script type="text/javascript" src="<spring:theme code="jquerycookiesource"/>"></script>
<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
<script type="text/javascript" src="<spring:theme code="browserdetectsource"/>"></script>
<script type="text/javascript" src="<spring:theme code="checkcompatibilitysource"/>"></script>
<!-- <script type="text/javascript" src="<spring:theme code="utilssource"/>"></script> -->

<title><spring:message code="teacher.index.wiseTeacherDashboard" /></title>

<!--NOTE: the following scripts has CONDITIONAL items that only apply to IE (MattFish)-->
<!--[if lt IE 7]>
<script defer type="text/javascript" src="../javascript/tels/iefixes.js"></script>
<![endif]-->

<script type='text/javascript'>
var isTeacherIndex = true; //global var used by spawned pages (i.e. archive run)
</script>

</head>
    
<body>

<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>
	
	<div id="page">
		
		<div id="pageContent">
			<div class="sidebar sidebarLeft">
				<div class="sidePanel">
					<div class="panelHeader"><spring:message code="teacher.index.quickLinks" /></div>
					
					<div class="panelContent">
				
						<table id="teacherQuickLinks">
							<tr>
								<td><a href="/webapp/pages/gettingstarted.html" target="_blank"><spring:message code="teacher.index.quickstartGuide"/></a></td>
							</tr>
							<tr>
								<td><a href="/webapp/teacher/management/library.html"><spring:message code="teacher.index.browseWISEProjects"/></a></td>
							</tr>
							<tr>
								<td><a href="/webapp/teacher/management/classroomruns.html"><spring:message code="teacher.index.gradeAndManageClassroomRuns"/></a></td>
							</tr>
						</table>
					</div>
				</div>
				
				<div class='sidePanel'>
					<div class="panelHeader"><spring:message code="teacher.index.messages" /></div>
					
					<div class="panelContent">
			
						<table id="teacherMessageTable">
							<tr>
								<td>
								<div class="highlight welcomeMsg">
									<c:set var="current_date" value="<%= new java.util.Date() %>" />
									<c:choose>
										<c:when test="${(current_date.hours>=4) && (current_date.hours<5)}">
												<spring:message code="teacher.index.benjaminFranklinQuote" />
										</c:when>
										<c:when test="${(current_date.hours>=5) && (current_date.hours<6)}">
												<spring:message code="teacher.index.topOfTheMorning" />
										</c:when>
										<c:when test="${(current_date.hours>=6) && (current_date.hours<6.5)}">
												<spring:message code="teacher.index.guatamaSiddhartaQuote" />
										</c:when>
										<c:when test="${(current_date.hours>=6.5) && (current_date.hours<7)}">
												<spring:message code="teacher.index.hopeHavingGoodMorning" />
										</c:when>
										<c:when test="${(current_date.hours>=7) && (current_date.hours<9)}">
												<spring:message code="teacher.index.goodMorning" />
										</c:when>
										<c:when test="${(current_date.hours>=9) && (current_date.hours<10)}">
												<spring:message code="teacher.index.robertFrostQuote" />
										</c:when>
										<c:when test="${(current_date.hours>=10) && (current_date.hours<11)}">
												<spring:message code="teacher.index.milesDavisQuote" />
										</c:when>
										<c:when test="${(current_date.hours>=11) && (current_date.hours<11.5)}">
												<spring:message code="teacher.index.aaMilneQuote" />
										</c:when>
										<c:when test="${(current_date.hours>=11.5) && (current_date.hours<12)}">
												<spring:message code="teacher.index.teacher.index.grouchoMarxQuote" />
										</c:when>
										<c:when test="${(current_date.hours>=12) && (current_date.hours<15)}">
												<spring:message code="teacher.index.goodAfternoon" />
										</c:when>
										<c:when test="${(current_date.hours>=15) && (current_date.hours<18)}">
												<spring:message code="teacher.index.productiveAfternoon" />
										</c:when>
										<c:when test="${(current_date.hours>=18) && (current_date.hours<22)}">
												<spring:message code="teacher.index.goodEvening" />
										</c:when>
										<c:when test="${(current_date.hours>=22) && (current_date.hours<23)}">
												<spring:message code="teacher.index.georgeCarlinQuote" />
										</c:when>
										<c:when test="${(current_date.hours>=23) && (current_date.hours<24)}">
												<spring:message code="teacher.index.marilynVosSavantQuote" />
										</c:when>
										<c:otherwise>
												<spring:message code="teacher.index.helloNightOwl" />
										</c:otherwise>
									</c:choose>
								</div>
								<ul class="reminders">
									<c:forEach var="run" items="${current_run_list1}">
										<sec:accesscontrollist domainObject="${run}" hasPermission="16">
											<c:if test='${(run.archiveReminderTime.time - current_date.time) < 0}'>
												<li><spring:message code="teacher.index.yourProjectRun" /> <span style="font-weight:bold;">${run.name} (${run.id})</span> <spring:message code="teacher.index.hasBeenOpenSince" />
													<fmt:formatDate value="${run.starttime}" type="date" dateStyle="medium" timeStyle="short" />.
													 <spring:message code="teacher.index.doYouWantToArchive" />  [<a class="runArchiveLink"
															id='archiveRun_${run.id}'><spring:message code="teacher.index.yes" /></a> / <a class="extendReminderLink" id='extendReminder_${run.id}'><spring:message code="teacher.index.remindMeLater" /></a>]</li>
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
					<!-- <iframe id="dynamicFrame" name="dynamicFrame" src="run/projectruntabs.html"	style="overflow: auto; width: 100%; 
					display: none; margin-top: 5px;"></iframe> -->
					<%@ include file="run/recentactivity.jsp"%>
				</div>
					
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page -->
	
	<%@ include file="../footer.jsp"%>
</div>

<!-- Page-specific script TODO: Make text translatable and move to external script-->

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
			type: 'post',
			url: '/webapp/teacher/run/manage/extendremindertime.html?runId=' + id,
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
        	var link = $(this);
        	var id = $(this).attr('id').replace('archiveRun_','');
        	var updatingText = $('<span style="color: #DDCDB5;"> ' + '<spring:message code="teacher.index.updating"/>' + '</span>');
        	link.parent().append(updatingText);
        	$.ajax({
				type: 'post',
				url: '/webapp/teacher/run/manage/extendremindertime.html?runId=' + id,
				success: function(request){
					updatingText.remove();
					link.css('text-decoration','strike-through');
					link.parent().append('<span style="color: #DDCDB5;"> ' + '<spring:message code="teacher.index.projectRun"/>' + ' ' + id + ' ' + '<spring:message code="teacher.index.hasBeenArchivedWillRefresh"/>' + '</span>');
					setTimeout(function(){window.location.reload();},2000);
				},
				error: function(request,error){
					updatingText.remove();
					link.parent().append('<span style="color: #DD2424;"> ' + '<spring:message code="teacher.index.unableToArchiveRun"/>' + ' ' + id + ' ' + '<spring:message code="teacher.index.tryAgainLater"/>' + '</span>');
				}
        	});
        });

	/**
	 * Asynchronously archives a message
	 **/
	function archiveMessage(messageId, sender) {
		var messageDiv = $('#message_' + messageId);
		messageDiv.html('<spring:message code="teacher.index.archivingMessage"/>');

		$.ajax({
			type: 'post',
			url: '/webapp/message.html?action=archive&messageId='+messageId,
			success: function(request){
				/* update message on teacher index page announcements section */
				messageDiv.remove();
				$("#message_confirm_div_" + messageId).html('<span style="color: #24DD24;">' + '<spring:message code="teacher.index.messageFrom"/>' + ' ' + sender + ' ' + '<spring:message code="teacher.index.hasBeenArchived"/>' + '</span>');
				/* update count of new message in message count div */
				var messageCountDiv = $("#newMessageCount");
				var messages = $("#messageDiv");
				if (messages.length == 1) {
					messageCountDiv.html('<spring:message code="teacher.index.youHave"/>' + " " + messages.length + " " + '<spring:message code="teacher.index.newMessage"/>');
				} else {
					messageCountDiv.html('<spring:message code="teacher.index.youHave"/>' + " " + messages.length + " " + '<spring:message code="teacher.index.newMessage"/>');
				}
			},
			error: function(request,error){
				/* set failure message */
				messageDiv.html('<span style="color: #992244;">' + '<spring:message code="teacher.index.unableToArchiveMessage"/>' + '</span>');
			}
		});
    }
</script>

</body>

</html>









