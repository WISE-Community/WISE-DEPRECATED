<link href="${contextPath}/<spring:theme code="teacherrunstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

	<c:choose>
		<c:when test="${fn:length(current_run_list) > 0}">
			<div class="runBox">
				
				<table id="currentRunTable" class="runTable" border="1" cellpadding="0" cellspacing="0">
					<thead>
					    <tr>
					       <th style="width:215px;" class="tableHeaderMain runHeader"><spring:message code="teacher.run.recentactivity.activeRuns"/></th>
					       <th style="width:155px;" class="tableHeaderMain studentHeader"><spring:message code="teacher.run.recentactivity.students" /></th>      
					       <th style="width:285px;" class="tableHeaderMain toolsHeader"><spring:message code="teacher.run.recentactivity.gradingAndTools" /></th>
					       <th class="tableHeaderMain hidden"><spring:message code="teacher.run.recentactivity.runCreated" /></th>
					       <th class="tableHeaderMain hidden"><spring:message code="teacher.run.recentactivity.runEnded" /></th>
					       <th class="tableHeaderMain hidden"><spring:message code="teacher.run.recentactivity.source" /></th>
					       <th class="tableHeaderMain hidden"><spring:message code="teacher.run.recentactivity.ownership" /></th>
					       <th class="tableHeaderMain hidden"><spring:message code="teacher.run.recentactivity.periods" /></th>
					    </tr>
					</thead>
					<tbody>
					  <c:if test="${fn:length(current_run_list) > 0}">
						  <c:forEach var="run" items="${current_run_list}">
						  <sec:accesscontrollist domainObject="${run}" hasPermission="16" var="isRunOwner"></sec:accesscontrollist>
						  <tr id="runTitleRow_${run.id}" class="runRow">
						    <td>
						    	<div class="runTitle">${run.name}</div>
						    		<c:set var="ownership" value="owned" />
									<c:forEach var="sharedowner" items="${run.sharedowners}">
							    	    <c:if test="${sharedowner == user}">
								    	    	<!-- the project run is shared with the logged-in user. -->
							    	    	<c:set var="ownership" value="shared" />
							    	    	<div class="sharedIcon">
								    	    	<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" /> <spring:message code="teacher.run.recentactivity.ownedBy"/>
								    	    	<c:forEach var="owner" items="${run.owners}">
								    	    		${owner.userDetails.firstname} ${owner.userDetails.lastname}
								    	    	</c:forEach>
							    	    	</div>
							    	    	<!-- let the user unshare themself from the run. -->
							    	    	<a class="unshare" onClick="unshareFromRun('${run.id}','<spring:escapeBody javaScriptEscape="true">${run.name}</spring:escapeBody>');"><spring:message code="teacher.run.recentactivity.removeSelf"/></a>
							    	    </c:if>
							    	</c:forEach>
						     
								<table class="runTitleTable">
						      			<tr>
											<th><spring:message code="teacher.run.recentactivity.studentAccessCode" /></th>
											<td class="accesscode">${run.runcode}</td>
										</tr>
										
						      			<tr>
						      				<th><spring:message code="teacher.run.recentactivity.runId" /></th>
						      				<td>${run.id}</td>
						      			</tr>
						      			<tr>
						      				<th><spring:message code="teacher.run.recentactivity.runCreated2"/></th>
						      				<td><fmt:formatDate value="${run.starttime}" type="date" dateStyle="medium" /></td>
						      			</tr>
						      				<c:set var="source" value="custom" />
						      				<c:if test="${run.project.familytag == 'TELS'}"> <!-- TODO: modify this to include ALL library projects (not just TELS) -->
							      				<c:set var="source" value="library" />
						      				</c:if>
										<tr>
						      				<th><spring:message code="teacher.run.recentactivity.projectId"/></th>
						      				<td><a id="projectDetail_${run.project.id}" class="projectDetail" title="<spring:message code="teacher.run.recentactivity.projectDetails"/>">${run.project.id}</a></td>
						      			</tr>
						      			<tr>
						      				<c:if test="${run.project.parentProjectId != null}">
						      				<th><spring:message code="teacher.run.recentactivity.copyOfProject"/></th>
											<td><a id="projectDetail_${run.project.parentProjectId}" class="projectDetail" title="<spring:message code="teacher.run.recentactivity.projectDetails"/>">${run.project.parentProjectId}</a></td>
											</c:if>
						      			</tr>
						      			<c:if test="${isRunOwner==true}">
											<tr>
						      					<td colspan="2" style="padding-top:.5em;">
						      						<a id="editRun_${run.id}" class="editRun" title="<spring:message code="teacher.run.recentactivity.editRunSettings"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})"><img class="icon" alt="settings" src="${contextPath}/<spring:theme code="processing"/>" /><span><spring:message code="teacher.run.recentactivity.editRunSettings"/></span></a>
						      					</td>
						      				</tr>
						      			</c:if>
								</table>
						      	
							</td>
														
						    <td style="padding:.5em 0;">
						    	<table class="currentRunInfoTable">
						          <tr>
						            <th class="tableInnerHeader"><spring:message code="teacher.run.recentactivity.period"/></th>
						            <th class="tableInnerHeader"><spring:message code="teacher.run.recentactivity.students"/></th>
						          </tr>
						          <c:forEach var="period" items="${run.periods}">
						            <tr>
						              <td style="width:35%;" class="tableInnerData">${period.name}</td>
						              <td style="width:65%;" class="tableInnerDataRight">
						              <c:choose>
				 	                  	<c:when test="${isRunOwner==true}">
				 	                  		<a class="manageStudents" title="<spring:message code="teacher.run.recentactivity.manageStudents"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" id="runId=${run.id}&periodName=${period.name}">${fn:length(period.members)}&nbsp;<spring:message code="teacher.run.recentactivity.registered"/></a>
				 	                  	</c:when>
				 	                    <c:otherwise>
				 	                    	${fn:length(period.members)}&nbsp;<spring:message code="teacher.run.recentactivity.registered"/>
				 	                    </c:otherwise>
				 	                  </c:choose>
						              </td>
						            </tr>
						          </c:forEach>
						          <c:if test="${isRunOwner==true}">
				 	                <tr><td colspan="2" class="manageStudentGroups"><a class="manageStudents" title="<spring:message code="teacher.run.recentactivity.manageStudents"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" id="runId=${run.id}"><img class="icon" alt="groups" src="${contextPath}/<spring:theme code="connected"/>" /><span><spring:message code="teacher.run.recentactivity.manageStudents"/></span></a></td></tr>
				 	              </c:if>
						        </table>
						    </td> 
						    <td>
							    <c:set var="isExternalProject" value="0"/>
							    
							        <c:forEach var="external_run" items="${externalprojectruns}">
							           <c:if test="${run.id == external_run.id}">
							                   <c:set var="isExternalProject" value="1"/>
							           </c:if>
							        </c:forEach>
							           <c:choose>
							               <c:when test="${isExternalProject == 1}">
							               	  <ul class="actionList">
							                  	<li><spring:message code="teacher.run.recentactivity.periodReports"/> <c:forEach var="periodInRun" items="${run.periods}"><a href="report.html?runId=${run.id}&groupId=${periodInRun.id}">${periodInRun.name}</a>&nbsp;</c:forEach></li>
							               	  </ul>
							               </c:when>
							               <c:otherwise>
										    <ul class="actionList">
										    	<spring:message code="teacher.run.recentactivity.gradingAndFeedback" var="gradingAndFeedback"/>
												<li><span style="font-weight:bold;"><spring:message code="teacher.run.recentactivity.gradeByStep"/>:</span> <a class="grading" title="${gradingAndFeedback}: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" id="runId=${run.id}&gradingType=step&getRevisions=false&minified=true"><spring:message code="teacher.run.recentactivity.latestWork"/></a>&nbsp;|&nbsp;<a class="grading" title="${gradingAndFeedback}: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/>: ${run.id})" id="runId=${run.id}&gradingType=step&getRevisions=true&minified=true"><spring:message code="teacher.run.recentactivity.allRevisions"/></a></li>
						  	                    <li><span style="font-weight:bold;"><spring:message code="teacher.run.recentactivity.gradeByTeam"/>:</span> <a class="grading" title="${gradingAndFeedback}: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" id="runId=${run.id}&gradingType=team&getRevisions=false&minified=true"><spring:message code="teacher.run.recentactivity.latestWork"/></a>&nbsp;|&nbsp;<a class="grading" title="${gradingAndFeedback}: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/>: ${run.id})" id="runId=${run.id}&gradingType=team&getRevisions=true&minified=true"><spring:message code="teacher.run.recentactivity.allRevisions"/></a></li>
                    							<c:if test="${isRunOwner==true}">
                    								<c:choose>
	                    								<c:when test="${isXMPPEnabled && run.XMPPEnabled}">
	                    									<li><a class="classroomMonitor" title="<spring:message code="teacher.run.recentactivity.classroomMonitor"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" id="runId=${run.id}&gradingType=monitor"><img class="icon" alt="monitor" src="${contextPath}/<spring:theme code="bar_chart"/>" /><span><spring:message code="teacher.run.recentactivity.classroomMonitor"/></span></a></li>
	                    								</c:when>
	                    								<c:otherwise>
	                    									<li><a class="classroomMonitor" title="<spring:message code="teacher.run.recentactivity.classroomMonitor"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" id="runId=${run.id}&gradingType=monitor" style="display:none"><img class="icon" alt="monitor" src="${contextPath}/<spring:theme code="bar_chart"/>" /><span><spring:message code="teacher.run.recentactivity.classroomMonitor"/></span></a></li>
	                    								</c:otherwise>
	                    							</c:choose>
                    							</c:if>
							               </ul>
							               <ul class="actionList">
										        <li>
										        	<spring:message code="teacher.run.recentactivity.projectDetails" var="projectDetails"/>
										        	<spring:message code="teacher.run.recentactivity.project"/>&nbsp;<a href="${contextPath}/previewproject.html?projectId=${run.project.id}" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" /><span><spring:message code="teacher.run.recentactivity.preview"/></span></a>
									    			|&nbsp;<a id="projectInfo_${run.project.id}" class="projectInfo" title="<spring:message code="teacher.run.recentactivity.projectDetails"/>"><img class="icon" alt="info" src="${contextPath}/<spring:theme code="id"/>" /><span><spring:message code="teacher.run.recentactivity.info"/></span></a>
										        	<sec:accesscontrollist domainObject="${run.project}" hasPermission="16">
										        		|&nbsp;<a onclick="if(confirm('<spring:message code="teacher.run.recentactivity.warningWillBeEditingProjectForRun"/>')){window.top.location='${contextPath}/author/authorproject.html?projectId=${run.project.id}';} return true;"><img class="icon" alt="edit" src="${contextPath}/<spring:theme code="edit"/>" /><span><spring:message code="teacher.run.recentactivity.editContent"/></span></a>
										        	</sec:accesscontrollist>
										        </li>
										    </ul>
							               </c:otherwise>
							           </c:choose>
								
								<ul class="actionList">
										    	
							    	<c:set var="isExternalProject" value="0"/>
							    	<sec:accesscontrollist domainObject="${run}" hasPermission="16">
							      		<li><a id="myNotes_${run.id}" class="myNotes" title="<spring:message code="teacher.run.notes.myNotes"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" ><img class="icon" alt="notes" src="${contextPath}/<spring:theme code="edit"/>" /><spring:message code="teacher.run.notes.myNotes"/></a></li>
							      		<li><a id="editAnnouncements_${run.id}" class="editAnnouncements" title="<spring:message code="teacher.run.recentactivity.manageAnnouncements"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" ><img class="icon" alt="announcements" src="${contextPath}/<spring:theme code="chat"/>" /><spring:message code="teacher.run.recentactivity.manageAnnouncements"/></a></li>
  			   					        <li><a id="shareRun_${run.id}" class="shareRun" title="<spring:message code="teacher.run.recentactivity.sharingPermissions"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})"><img class="icon" alt="share" src="${contextPath}/<spring:theme code="agent"/>" /><span><spring:message code="teacher.run.recentactivity.shareWithAnotherTeacher"/></span></a></li> 
			 	                    </sec:accesscontrollist>
							        <li><a class="researchTools" title="<spring:message code="teacher.run.recentactivity.researcherTools"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" id="runId=${run.id}&gradingType=export"><img class="icon" alt="export" src="${contextPath}/<spring:theme code="save"/>" /><span><spring:message code="teacher.run.recentactivity.researcherTools"/> <spring:message code="teacher.run.recentactivity.exportStudentData"/></span></a></li>			    	
									<li><a href="${contextPath}/contact/contactwiseproject.html?projectId=${run.project.id}&runId=${run.id}"><img class="icon" alt="contact" src="${contextPath}/<spring:theme code="email"/>" /><span><spring:message code="teacher.run.recentactivity.reportAProblem"/></span></a></li>
				                    <sec:accesscontrollist domainObject="${run}" hasPermission="16">					    	
							    	  <li><a class="archiveRun" id="archiveRun_runId=${run.id}&runName=<c:out value="${fn:escapeXml(run.name)}" />" title="<spring:message code="teacher.run.recentactivity.archive"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})"><img class="icon" alt="archive" src="${contextPath}/<spring:theme code="lock"/>" /><span><spring:message code="teacher.run.recentactivity.archiveEndRun"/></span></a></li>
							    	</sec:accesscontrollist>
							    </ul>
			
							</td>
							<td style="display:none;">${run.starttime}</td>
							<td style="display:none;"></td>
							<td style="display:none;">${source}</td>
							<td style="display:none;">${ownership}</td>
							<td style="display:none;">
								<c:forEach var="period" items="${run.periods}">${period.name},</c:forEach>
						   </td>
						   </tr>
						  </c:forEach>
						</c:if>
					</tbody>
				</table>
			</div>
		</c:when>
		<c:otherwise>
			<spring:htmlEscape defaultHtmlEscape="false">
			<spring:escapeBody htmlEscape="false">
				<p class="info"><spring:message code="teacher.run.recentactivity.noActiveProjectRuns"/> <a href="${contextPath}/teacher/management/library.html"><spring:message code="teacher.run.recentactivity.wiseProjectLibrary"/></a> <spring:message code="teacher.run.recentactivity.andClickStartNewRun"/> <a href="${contextPath}/author/authorproject.html"><spring:message code="teacher.run.recentactivity.wiseAuthoringTool"/></a></p>
			</spring:escapeBody>
			</spring:htmlEscape>
		</c:otherwise>
	</c:choose>

<div id="gradingDialog" class="dialog"></div>
<div id="shareDialog" class="dialog"></div>
<div id="unshareDialog" class="dialog"></div>
<div id="editRunDialog" class="dialog"></div>
<div id="myNotesDialog" class="dialog"></div>
<div id="editAnnouncementsDialog" class="dialog"></div>
<div id="manageStudentsDialog" style="overflow:hidden;" class="dialog"></div>
<div id="projectDetailDialog" style="overflow:hidden;" class="dialog"></div>
<div id="archiveRunDialog" style="overflow:hidden;" class="dialog"></div>

<script type="text/javascript">
	$(document).ready(function(){
		
		// setup grading dialogs
		$('.grading, .researchTools').on('click',function(){
			var settings = $(this).attr('id');
			var title = $(this).attr('title');
			var path = "${contextPath}/teacher/grading/gradework.html?" + settings;
			var div = $('#gradingDialog').html('<iframe id="gradingIfrm" width="100%" height="100%" style="overflow-y:hidden;"></iframe>');
			div.dialog({
				modal: true,
				width: $(window).width() - 32,
				height: $(window).height() - 32,
				title: title,
				close: function (e, ui) { $(this).html(''); },
				buttons: {
					Exit: function(){
						$(this).dialog('close');
					}
				}
			});
			$("#gradingDialog > #gradingIfrm").attr('src',path);
		});
		
		// setup grading dialogs
		$('.classroomMonitor').on('click',function(){
			var settings = $(this).attr('id');
			var title = $(this).attr('title');
			var path = "${contextPath}/teacher/classroomMonitor/classroomMonitor.html?" + settings;
			window.open(path);
		});
		
		// setup share project run dialog
		$('.shareRun').on('click',function(){
			var title = $(this).attr('title');
			var runId = $(this).attr('id').replace('shareRun_','');
			var path = "${contextPath}/teacher/run/shareprojectrun.html?runId=" + runId;
			var div = $('#shareDialog').html('<iframe id="shareIfrm" width="100%" height="100%"></iframe>');
			div.dialog({
				modal: true,
				width: '650',
				height: '450',
				title: title,
				close: function(){
					$(this).html('');
				},
				buttons: {
					Close: function(){$(this).dialog('close');}
				}
			});
			$("#shareDialog > #shareIfrm").attr('src',path);
		});
		
		// setup edit run settings dialog
		$('.editRun').on('click',function(){
			var title = $(this).attr('title');
			var runId = $(this).attr('id').replace('editRun_','');
			var path = "${contextPath}/teacher/run/editrun.html?runId=" + runId;
			var div = $('#editRunDialog').html('<iframe id="editIfrm" width="100%" height="100%"></iframe>');
			div.dialog({
				modal: true,
				width: '600',
				height: '400',
				title: title,
				close: function(){
					if(document.getElementById('editIfrm').contentWindow['runUpdated']){
						window.location.reload();
					}
					$(this).html('');
				},
				buttons: {
					Close: function(){
						$(this).dialog('close');
					}
				}
			});
			$("#editRunDialog > #editIfrm").attr('src',path);
		});
		
		// setup my notes dialog
		$('.myNotes').on('click',function(){
			var title = $(this).attr('title');
			var runId = $(this).attr('id').replace('myNotes_','');
			var path = "${contextPath}/teacher/run/notes.html?runId=" + runId;
			var div = $('#myNotesDialog').html('<iframe id="myNotesIfrm" width="100%" height="95%"></iframe>');
			div.dialog({
				modal: true,
				width: '700',
				height: '600',
				title: title,
				close: function(){ $(this).html(''); },
				buttons: {
					Close: function(){
						$(this).dialog('close');
					}
				}
			});
			$("#myNotesDialog > #myNotesIfrm").attr('src',path);
		});
		
		// setup edit manage announcements dialog
		$('.editAnnouncements').on('click',function(){
			var title = $(this).attr('title');
			var runId = $(this).attr('id').replace('editAnnouncements_','');
			var path = "${contextPath}/teacher/run/announcement/manageannouncement.html?runId=" + runId;
			var div = $('#editAnnouncementsDialog').html('<iframe id="announceIfrm" width="100%" height="100%"></iframe>');
			div.dialog({
				modal: true,
				width: '600',
				height: '400',
				title: title,
				close: function(){ $(this).html(''); },
				buttons: {
					Close: function(){
						$(this).dialog('close');
					}
				}
			});
			$("#editAnnouncementsDialog > #announceIfrm").attr('src',path);
		});
		
		// setup manage students dialog
		$('.manageStudents').on('click',function(){
			var title = $(this).attr('title');
			var params = $(this).attr('id').replace('manageStudents_','');
			var path = "${contextPath}/teacher/management/viewmystudents.html?" + params;
			var div = $('#manageStudentsDialog').html('<iframe id="manageStudentsIfrm" width="100%" height="100%"></iframe>');
			div.dialog({
				modal: true,
				width: $(window).width() - 32,
				height: $(window).height() - 32,
				title: title,
				beforeClose: function() {
					// check for unsaved changes and alert user if necessary
					if(document.getElementById('manageStudentsIfrm').contentWindow['unsavedChanges']){
						var answer = confirm("<spring:message code="teacher.run.recentactivity.warningUnsavedChangesToStudentTeams"/>\n\n<spring:message code="teacher.run.recentactivity.areYouSureYouWantToExit"/>")
						if(answer){
							return true;
						} else {
							return false;
						};
					} else {
						return true;
					}
				},
				close: function(){
					// refresh page if required (run title or student periods have been modified)
					if(document.getElementById('manageStudentsIfrm').contentWindow['refreshRequired']){
						window.location.reload();
					}
					$(this).html('');
				},
				buttons: {
					Exit: function(){
						$(this).dialog('close');
					}
				}
			});
			$("#manageStudentsDialog > #manageStudentsIfrm").attr('src',path);
		});
		
		// setup archive and restore run dialogs
		$('.archiveRun, .activateRun').on('click',function(){
			var title = $(this).attr('title');
			if($(this).hasClass('archiveRun')){
				var params = $(this).attr('id').replace('archiveRun_','');
				var path = "${contextPath}/teacher/run/manage/archiveRun.html?" + params;
			} else if($(this).hasClass('activateRun')){
				var params = $(this).attr('id').replace('activateRun_','');
				var path = "${contextPath}/teacher/run/manage/startRun.html?" + params;
			}
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
					}
				}
			});
			$("#archiveRunDialog > #archiveIfrm").attr('src',path);
		});
		
		// Set up view project details click action for each project id link
		$('a.projectDetail, a.projectInfo').on('click',function(){
			var title = $(this).attr('title');
			if($(this).hasClass('projectDetail')){
				var projectId = $(this).attr('id').replace('projectDetail_','');
			} else if($(this).hasClass('projectInfo')){
				var projectId = $(this).attr('id').replace('projectInfo_','');
			}
			var path = "${contextPath}/teacher/projects/projectinfo.html?projectId=" + projectId;
			var div = $('#projectDetailDialog').html('<iframe id="projectIfrm" width="100%" height="100%"></iframe>');
			div.dialog({
				modal: true,
				width: '800',
				height: '400',
				title: title,
				close: function(){ $(this).html(''); },
				buttons: {
					Close: function(){
						$(this).dialog('close');
					}
				}
			});
			$("#projectDetailDialog > #projectIfrm").attr('src',path);
		});
	
		function unshareFromRun(runId,runName) {
			var agreed = false,
				dialogContent = '<spring:message code="teacher.run.recentactivity.warningRemoveYourselfFromSharedTeachers" htmlEscape="false" />',
				title = '<spring:message code="teacher.run.recentactivity.unshare" /> ' + runName + ' (<spring:message code="teacher.run.recentactivity.id" />: ' + runId + ')',
				processing = '<spring:message code="teacher.run.recentactivity.updatingRunPermissions" />';
			$('#unshareDialog').html(dialogContent).dialog({
				modal: true,
				title: title,
				width: '500',
				closeOnEscape: false,
				beforeclose : function() { return agreed; },
				buttons: {
					'<spring:message code="cancel" />': function(){
						agreed = true;
						$(this).dialog('close');
					},
					'<spring:message code="ok" />': function(){
						var processingHtml = '<p>' + processing + '</p>' + 
							'<p><img src="${contextPath}/themes/default/images/rel_interstitial_loading.gif" /></p>';
						$('#unshareDialog').css('text-align','center');
						$('#unshareDialog').html(processingHtml);
						$('ui-dialog-titlebar-close',$(this).parent()).hide();
						$('button',$(this).parent()).hide().unbind();
						//make the request to unshare the project
						$.ajax({
							url:"${contextPath}/teacher/run/unshareprojectrun.html",
							type:"POST",
							data:{"runId":runId},
							success: function(data, text, xml){
								$('#unshareDialog').html("<p><spring:message code='teacher.run.recentactivity.successfullyRemovedFromSharedTeachers' /></p>");
								$('button:eq(1)',$('#unshareDialog').parent()).show().click(function(){
									agreed = true;
									$('#unshareDialog').dialog('close');
									// reload page
									window.location.reload();
								});
							},
							error: function(data, text, xml){
								// an error occured, so we will display an error message to the user
								$('#unshareDialog').html('<p><spring:message code="teacher.run.recentactivity.errorFailedToEditSharedSettings" /></p>');
								$('button:eq(1)',$('#unshareDialog').parent()).show().click(function(){
									agreed = true;
									$('#unshareDialog').dialog('close');
								});
							}
						});
					}
				}
			});
		};
	});
</script>