<link href="${contextPath}/<spring:theme code="teacherrunstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerydatatables.css"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="facetedfilter.css"/>" media="screen" rel="stylesheet"  type="text/css" />


<div id="runTabs" class="panelTabs">
	<ul>
		<li><a href="#currentRuns"><spring:message code="current"/>  (${fn:length(current_run_list)})</a></li>
		<li><a href="#archivedRuns"><spring:message code="archived"/>  (${fn:length(ended_run_list)})</a></li>
	</ul>
	<div id="currentRuns">
		<c:choose>
			<c:when test="${fn:length(current_run_list) > 0}">
				<p class="info"><spring:message code="teacher.management.projectruntabs.active_intro" /></p>
				<div class="runBox">
					<table id="currentRunTable" class="runTable" border="1" cellpadding="0" cellspacing="0">
						<thead>
						<tr>
							<th style="width:220px;" class="tableHeaderMain runHeader"><spring:message code="teacher.management.projectruntabs.active_header" /></th>
							<th style="width:155px;" class="tableHeaderMain studentHeader"><spring:message code="teacher.management.projectruntabs.studentManagement" /></th>
							<th style="width:285px;" class="tableHeaderMain toolsHeader"><spring:message code="teacher.management.projectruntabs.tools" /></th>
							<th style="display:none;" class="tableHeaderMain">run created</th>
							<th style="display:none;" class="tableHeaderMain">run ended</th>
							<th style="display:none;" class="tableHeaderMain">source</th>
							<th style="display:none;" class="tableHeaderMain">ownership</th>
							<th style="display:none;" class="tableHeaderMain">periods</th>
							<th style="display:none;" class="tableHeaderMain">run title</th>
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
													<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" /> <spring:message code="teacher.management.projectruntabs.ownedBy"/>
														${run.owner.userDetails.firstname} ${run.owner.userDetails.lastname}
												</div>
												<!-- let the user unshare self from the run. -->
												<a class="unshare" onClick="unshareFromRun('${run.id}','<spring:escapeBody javaScriptEscape="true">${run.name}</spring:escapeBody>');"><spring:message code="teacher.management.projectruntabs.unshare"/></a>
											</c:if>
										</c:forEach>

										<table class="runTitleTable">
											<tr>
												<th><spring:message code="run_accessCode" /></th>
												<td class="accesscode">${run.runcode}</td>
											</tr>

											<tr>
												<th><spring:message code="run_id_label" /></th>
												<td>${run.id}</td>
											</tr>
											<tr>
												<th><spring:message code="teacher.management.projectruntabs.created"/></th>
												<td><fmt:formatDate value="${run.starttime}" type="date" dateStyle="medium" /></td>
											</tr>
											<c:set var="source" value="custom" />
											<c:if test="${run.project.familytag == 'TELS'}"> <!-- TODO: modify this to show when a run was generated from a library project -->
												<c:set var="source" value="library" />
											</c:if>
											<tr>
												<th><spring:message code="project_id"/></th>
												<td><a id="projectDetail_${run.project.id}" class="projectDetail" title="<spring:message code="project_details"/>">${run.project.id}</a></td>
											</tr>
											<tr>
												<c:if test="${run.project.parentProjectId != null}">
													<th><spring:message code="teacher.management.projectruntabs.copyLabel"/></th>
													<td><a id="projectDetail_${run.project.parentProjectId}" class="projectDetail" title="<spring:message code="project_details"/>">${run.project.parentProjectId}</a></td>
												</c:if>
											</tr>
											<c:if test="${isRunOwner==true}">
												<tr>
													<td colspan="2" style="padding-top:.5em;">
														<a id="editRun_${run.id}" class="editRun" title="<spring:message code="teacher.management.projectruntabs.editSettings"/>: ${run.name} (<spring:message code="run_id"/> ${run.id})"><img class="icon" alt="settings" src="${contextPath}/<spring:theme code="processing"/>" /><span><spring:message code="teacher.management.projectruntabs.editSettings"/></span></a>
													</td>
												</tr>
											</c:if>
										</table>

									</td>

									<td style="padding:.5em 0;" >
										<table class="currentRunInfoTable" border="0" cellpadding="0" cellspacing="0">
											<tr>
												<th class="tableInnerHeader"><spring:message code="run_period"/></th>
												<th class="tableInnerHeader"><spring:message code="student_cap_plural"/></th>
											</tr>
											<c:forEach var="period" items="${run.periods}">
												<tr>
													<td style="width:35%;" class="tableInnerData">${period.name}</td>
													<td style="width:65%;" class="tableInnerDataRight">
														<c:choose>
															<c:when test="${isRunOwner==true}">
																<a class="manageStudents" title="<spring:message code="teacher.management.projectruntabs.manageStudents"/>: ${run.name} (<spring:message code="run_id"/> ${run.id})" id="runId=${run.id}&periodName=${period.name}">${fn:length(period.members)}&nbsp;<spring:message code="teacher.management.projectruntabs.registered"/></a>
															</c:when>
															<c:otherwise>
																${fn:length(period.members)}&nbsp;<spring:message code="teacher.management.projectruntabs.registered"/>
															</c:otherwise>
														</c:choose>
													</td>
												</tr>
											</c:forEach>
											<c:if test="${isRunOwner==true}">
												<tr><td colspan="2" class="manageStudentGroups"><a class="manageStudents" title="<spring:message code="teacher.management.projectruntabs.manageStudents"/>: ${run.name} (<spring:message code="run_id"/> ${run.id})" id="runId=${run.id}"><img class="icon" alt="groups" src="${contextPath}/<spring:theme code="connected"/>" /><span><spring:message code="teacher.management.projectruntabs.manageStudents"/></span></a></td></tr>
											</c:if>
										</table>
									</td>
									<td>
										<ul class="actionList">
                                            <li style="font-size:1.1em; padding-bottom:3px;"><a class="classroomMonitor" wiseVersion="${run.project.wiseVersion == null ? 4 : run.project.wiseVersion}" title="<spring:message code="teacher.management.projectruntabs.monitorTitle"/> ${run.name} (<spring:message code="run_id"/> ${run.id})" id="runId=${run.id}&gradingType=monitor"><img class="icon" alt="monitor" src="${contextPath}/<spring:theme code="bar_chart"/>" /><span><spring:message code="teacher.management.projectruntabs.gradingTool"/></span></a></li>
											<a id='linkToSeeOldGradingTools_${run.id}' onclick="$('#oldGradingTools_${run.id}').show();$('#linkToSeeOldGradingTools_${run.id}').hide();">(click here to access old grading tools)</a>
	                  					<span id="oldGradingTools_${run.id}" style="display:none">
										<li><span style="font-weight:bold;"><spring:message code="teacher.management.projectruntabs.gradeByStep"/>:</span> <a class="grading" title="<spring:message code="teacher.management.projectruntabs.gradingFeedback"/> ${run.name} (<spring:message code="run_id"/> ${run.id})" id="runId=${run.id}&gradingType=step&getRevisions=false&minified=true"><spring:message code="teacher.management.projectruntabs.latestWork"/></a>&nbsp;|&nbsp;<a class="grading" title="<spring:message code="teacher.management.projectruntabs.gradingFeedback"/> ${run.name} (<spring:message code="run_id"/>: ${run.id})" id="runId=${run.id}&gradingType=step&getRevisions=true&minified=true"><spring:message code="teacher.management.projectruntabs.allRevisions"/></a></li>
				  	                    <li><span style="font-weight:bold;"><spring:message code="teacher.management.projectruntabs.gradeByTeam"/>:</span> <a class="grading" title="<spring:message code="teacher.management.projectruntabs.gradingFeedback"/> ${run.name} (<spring:message code="run_id"/> ${run.id})" id="runId=${run.id}&gradingType=team&getRevisions=false&minified=true"><spring:message code="teacher.management.projectruntabs.latestWork"/></a>&nbsp;|&nbsp;<a class="grading" title="<spring:message code="teacher.management.projectruntabs.gradingFeedback"/> ${run.name} (<spring:message code="run_id"/>: ${run.id})" id="runId=${run.id}&gradingType=team&getRevisions=true&minified=true"><spring:message code="teacher.management.projectruntabs.allRevisions"/></a></li>
				  	                    <li><span>Please note that these old grading tools will be removed in the near future!</span></li>
				  	                    </span>
										</ul>
										<ul class="actionList">
											<li>
												<spring:message code="teacher.management.projectruntabs.projectLabel"/>&nbsp;<a href="${contextPath}/previewproject.html?projectId=${run.project.id}" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" /><span><spring:message code="preview"/></span></a>
												|&nbsp;<a id="projectInfo_${run.project.id}" class="projectInfo" title="<spring:message code="project_details"/>"><img class="icon" alt="info" src="${contextPath}/<spring:theme code="id"/>" /><span><spring:message code="teacher.management.projectruntabs.projectInfo"/></span></a>
												<sec:accesscontrollist domainObject="${run.project}" hasPermission="16">
													|&nbsp;<a onclick="if(confirm('<spring:message code="teacher.management.projectruntabs.editWarning"/>')){window.top.location='${contextPath}/author/authorproject.html?projectId=${run.project.id}';} return true;"><img class="icon" alt="edit" src="${contextPath}/<spring:theme code="edit"/>" /><span><spring:message code="teacher.management.projectruntabs.edit"/></span></a>
												</sec:accesscontrollist>
											</li>
										</ul>
										<ul class="actionList">
											<sec:accesscontrollist domainObject="${run}" hasPermission="16">
												<li><a id="myNotes_${run.id}" class="myNotes" title="<spring:message code="teacher.run.notes.myNotes"/>: ${run.name} (<spring:message code="teacher.run.recentactivity.runId2"/> ${run.id})" ><img class="icon" alt="notes" src="${contextPath}/<spring:theme code="edit"/>" /><spring:message code="teacher.run.notes.myNotes"/></a></li>
												<li><a id="editAnnouncements_${run.id}" class="editAnnouncements" title="<spring:message code="teacher.management.projectruntabs.announcementsTitle"/> ${run.name} (<spring:message code="run_id"/> ${run.id})" ><img class="icon" alt="announcements" src="${contextPath}/<spring:theme code="chat"/>" /><spring:message code="teacher.management.projectruntabs.announcements"/></a></li>
											</sec:accesscontrollist>
											<sec:accesscontrollist domainObject="${run}" hasPermission="16">
												<li><a id="shareRun_${run.id}" class="shareRun" title="<spring:message code="teacher.management.projectruntabs.sharingPermissionsTitle"/> ${run.name} (<spring:message code="run_id"/> ${run.id})"><img class="icon" alt="share" src="${contextPath}/<spring:theme code="agent"/>" /><span><spring:message code="teacher.management.projectruntabs.sharingPermissions"/></span></a></li>
											</sec:accesscontrollist>
											<li><a class="researchTools" title="<spring:message code="teacher.management.projectruntabs.researcherTools"/>: ${run.name} (<spring:message code="run_id"/> ${run.id})" id="runId=${run.id}&gradingType=export"><img class="icon" alt="export" src="${contextPath}/<spring:theme code="save"/>" /><span><spring:message code="teacher.management.projectruntabs.researcherTools"/> <spring:message code="teacher.management.projectruntabs.exportStudentData"/></span></a></li>
											<li><a href="${contextPath}/contact/contactwise.html?projectId=${run.project.id}&runId=${run.id}"><img class="icon" alt="contact" src="${contextPath}/<spring:theme code="email"/>" /><span><spring:message code="teacher.management.projectruntabs.reportProblem"/></span></a></li>
											<sec:accesscontrollist domainObject="${run}" hasPermission="16">
												<li><a class="archiveRun" id="archiveRun_runId=${run.id}&runName=<c:out value="${fn:escapeXml(run.name)}" />" title="<spring:message code="teacher.management.projectruntabs.archive_title"/> ${run.name} (<spring:message code="run_id"/> ${run.id})"><img class="icon" alt="archive" src="${contextPath}/<spring:theme code="lock"/>" /><span><spring:message code="teacher.management.projectruntabs.archive"/></span></a></li>
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
									<td style="display:none;">${run.name}</td>
								</tr>
							</c:forEach>
						</c:if>
						</tbody>
					</table>
				</div>
			</c:when>
			<c:otherwise>
				<p class="info">
					<spring:message code="teacher.management.projectruntabs.active_introEmpty" arguments="${contextPath}" htmlEscape="false"/>
				</p>
			</c:otherwise>
		</c:choose>
	</div><!-- end current runs tab -->

	<div id="archivedRuns">

		<c:choose>
			<c:when test="${fn:length(ended_run_list) > 0}">
				<p class="info"><spring:message code="teacher.management.projectruntabs.archive_intro"/></p>
				<div class="runBox">

					<table id="archivedRunTable" class="runTable" border="1" cellpadding="0" cellspacing="0" >
						<thead>
						<tr>
							<th style="width:220px;"class="tableHeaderMain archive runHeader"><spring:message code="teacher.management.projectruntabs.archive_header"/></th>
							<th style="width:155px;" class="tableHeaderMain archive studentHeader"><spring:message code="teacher.management.projectruntabs.studentManagement"/></th>
							<th style="width:285px;" class="tableHeaderMain archive toolsHeader"><spring:message code="teacher.management.projectruntabs.toolsArchived"/></th>
							<th style="display:none;" class="tableHeaderMain">run created</th>
							<th style="display:none;" class="tableHeaderMain">run ended</th>
							<th style="display:none;" class="tableHeaderMain">source</th>
							<th style="display:none;" class="tableHeaderMain">ownership</th>
							<th style="display:none;" class="tableHeaderMain">periods</th>
							<th style="display:none;" class="tableHeaderMain">run title</th>
						</tr>
						</thead>
						<tbody>
						<c:if test="${fn:length(ended_run_list) > 0}">
							<c:forEach var="run" items="${ended_run_list}">

								<tr id="runTitleRow_${run.id}" class="runRow">
									<td>
										<div class="runTitle">${run.name}</div>
										<c:set var="ownership" value="owned" />
										<c:forEach var="sharedowner" items="${run.sharedowners}">
											<c:if test="${sharedowner == user}">
												<c:set var="ownership" value="shared" />
												<div class="sharedIcon">
													<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" /> <spring:message code="teacher.management.projectruntabs.ownedBy"/>
													${run.owner.userDetails.firstname} ${run.owner.userDetails.lastname}
												</div>
												<!-- let the user unshare themself from the run. -->
												<a class="unshare" onClick="unshareFromRun('${run.id}','<spring:escapeBody javaScriptEscape="true">${run.name}</spring:escapeBody>');"><spring:message code="teacher.management.projectruntabs.unshare"/></a>
											</c:if>
										</c:forEach>

										<table class="runTitleTable">
											<tr>
												<th><spring:message code="run_accessCode"/></th>
												<td>${run.runcode}</td>
											</tr>

											<tr>
												<th><spring:message code="run_id"/></hd>
												<td>${run.id}</td>
											</tr>
											<tr>
												<th><spring:message code="teacher.management.projectruntabs.created"/></th>
												<td class="archivedDate"><fmt:formatDate value="${run.starttime}" type="date" dateStyle="short" /></td>
											</tr>
											<tr>
												<th><spring:message code="teacher.management.projectruntabs.archive_label"/></th>
												<td class="archivedDate"><fmt:formatDate value="${run.endtime}" type="date" dateStyle="short" /></td>
											</tr>
											<c:set var="source" value="custom" />
											<c:if test="${run.project.familytag == 'TELS'}">
												<c:set var="source" value="library" />
											</c:if>
											<tr>
												<th><spring:message code="project_id_label"/></th>
												<td><a id="projectDetail_${run.project.id}" class="projectDetail" title="<spring:message code="project_details"/>">${run.project.id}</a></td>
											</tr>
											<tr>
												<c:if test="${run.project.parentProjectId != null}">
													<th><spring:message code="teacher.management.projectruntabs.copyLabel"/></th>
													<td><a id="projectDetail_${run.project.parentProjectId}" class="projectDetail" title="<spring:message code="project_details"/>">${run.project.parentProjectId}</a></td>
												</c:if>
											</tr>
										</table>
									</td>

									<td style="padding:.5em;" >
										<table class="currentRunInfoTable" border="0" cellpadding="0" cellspacing="0">
											<tr>
												<th class="tableInnerHeader"><spring:message code="run_period"/></th>
												<th class="tableInnerHeader"><spring:message code="student_cap_plural"/></th>
											</tr>
											<c:forEach var="period" items="${run.periods}">
												<tr>
													<td style="width:20%;" class="tableInnerData">${period.name}</td>
													<td style="width:35%;" class="tableInnerDataRight archivedNumberStudents">
															${fn:length(period.members)}&nbsp;<spring:message code="teacher.management.projectruntabs.registered"/></td>
												</tr>
											</c:forEach>
										</table>
									</td>
									<td>
										<ul class="actionList">
											<li><span style="font-weight:bold;"><spring:message code="teacher.management.projectruntabs.workByStep"/>:</span> <a class="grading" title="<spring:message code="teacher.management.projectruntabs.studentWork"/> ${run.name} (<spring:message code="run_id_label"/> ${run.id})" id="runId=${run.id}&gradingType=step&getRevisions=false&minified=true"><spring:message code="teacher.management.projectruntabs.latestWork"/></a>&nbsp;|&nbsp;<a class="grading" title="<spring:message code="teacher.management.projectruntabs.studentWork"/> ${run.name} (<spring:message code="run_id_label"/> ${run.id})" id="runId=${run.id}&gradingType=step&getRevisions=true&minified=true"><spring:message code="teacher.management.projectruntabs.allRevisions"/></a></li>
											<li><span style="font-weight:bold;"><spring:message code="teacher.management.projectruntabs.workByTeam"/>:</span> <a class="grading" title="<spring:message code="teacher.management.projectruntabs.studentWork"/> ${run.name} (<spring:message code="run_id_label"/> ${run.id})" id="runId=${run.id}&gradingType=team&getRevisions=false&minified=true"><spring:message code="teacher.management.projectruntabs.latestWork"/></a>&nbsp;|&nbsp;<a class="grading" title="<spring:message code="teacher.management.projectruntabs.studentWork"/> ${run.name} (<spring:message code="run_id_label"/> ${run.id})" id="runId=${run.id}&gradingType=team&getRevisions=true&minified=true"><spring:message code="teacher.management.projectruntabs.allRevisions"/></a></li>
										</ul>
										<ul class="actionList">
											<li><a href="${contextPath}/previewproject.html?projectId=${run.project.id}" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" /><span><spring:message code="preview_tip"/></span></a></li>
										</ul>
										<ul class="actionList">
											<sec:accesscontrollist domainObject="${run}" hasPermission="16">
												<li><a class="activateRun" id="activateRun_runId=${run.id}&runName=<c:out value="${fn:escapeXml(run.name)}" />" title="<spring:message code="teacher.management.projectruntabs.restore_title"/> ${run.name} (<spring:message code="run_id_label"/> ${run.id})"><img class="icon" alt="archive" src="${contextPath}/<spring:theme code="unlock"/>" /><span><spring:message code="teacher.management.projectruntabs.restore"/></span></a></li>
											</sec:accesscontrollist>
											<li><a class="researchTools" title="<spring:message code="teacher.management.projectruntabs.researcherTools"/>: ${run.name} (<spring:message code="run_id_label"/> ${run.id})" id="runId=${run.id}&gradingType=export"><img class="icon" alt="export" src="${contextPath}/<spring:theme code="save"/>" /><span><spring:message code="teacher.management.projectruntabs.researcherTools"/> <spring:message code="teacher.management.projectruntabs.exportStudentData"/></span></a></li>
										</ul>
									</td>
									<td style="display:none;">${run.starttime}</td>
									<td style="display:none;">${run.endtime}</td>
									<td style="display:none;">${source}</td>
									<td style="display:none;">${ownership}</td>
									<td style="display:none;">
										<c:forEach var="period" items="${run.periods}">${period.name},</c:forEach>
									</td>
									<td style="display:none;">${run.name}</td>
								</tr>
							</c:forEach>
						</c:if>
						</tbody>
					</table>
				</div>
			</c:when>
			<c:otherwise>
				<p class="info"><spring:message code="teacher.management.projectruntabs.archive_introEmpty"/></p>
			</c:otherwise>
		</c:choose>
	</div> <!-- End of archived runs tab -->

</div>

<div id="gradingDialog" class="dialog"></div>
<div id="shareDialog" class="dialog"></div>
<div id="editRunDialog" class="dialog"></div>
<div id="myNotesDialog" class="dialog"></div>
<div id="editAnnouncementsDialog" class="dialog"></div>
<div id="manageStudentsDialog" style="overflow:hidden;" class="dialog"></div>
<div id="projectDetailDialog" style="overflow:hidden;" class="dialog"></div>
<div id="archiveRunDialog" style="overflow:hidden;" class="dialog"></div>
<div id="unshareDialog" class="dialog"></div>

<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerydatatables.js"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="facetedfilter.js"/>"></script>

<!-- TODO: move to separate js setup file (will require js i18n implementation for portal) -->
<script type="text/javascript">
	$(document).ready(function() {
		var oTable = $('.runTable').dataTable({
			"sPaginationType": "full_numbers",
			"iDisplayLength": 5,
			"aLengthMenu": [[5, 10, 25, -1], [5, 10, 25, "All"]],
			"bSort": false,
			"oLanguage": {
				"sInfo": "<spring:message code="datatable_info_showing"/> _START_-_END_ <spring:message code="of"/> _TOTAL_",
				"sInfoEmpty": "<spring:message code="datatable_info_empty"/>",
				"sInfoFiltered": "<spring:message code="datatable_info_filtered_post_matches"/>", // (from _MAX_ total)
				"sLengthMenu": "<spring:message code="datatable_lengthLabel"/> _MENU_ <spring:message code="datatable_perPage"/>",
				"sProcessing": "<spring:message code="processing"/>",
				"sZeroRecords": "<spring:message code="datatable_noMatch"/>",
				"sInfoPostFix":  "",
				"sSearch": "<spring:message code="datatable_search"/>",
				"sUrl": "",
				"oPaginate": {
					"sFirst":    "<spring:message code="datatable_paginate_first"/>",
					"sPrevious": "<spring:message code="datatable_paginate_previous"/>",
					"sNext":     "<spring:message code="datatable_paginate_next"/>",
					"sLast":     "<spring:message code="datatable_paginate_last"/>"
				}
			},
			"fnDrawCallback": function( oSettings ){
				// automatically scroll to top on page change
				var tableID = $(this).attr('id');
				var targetOffset = $('#' + tableID).offset().top - 14;
				if ($(window).scrollTop() > targetOffset){
					$('html,body').scrollTop(targetOffset);
				}
			},
			"fnInitComplete": function(){
				// setup tabs
				$( "#runTabs" ).tabs({ 
					active: 0,
					activate: function(event, ui){
						// Make top header scroll with page
						var $stickyEl = $('.dataTables_wrapper .top', ui.newPanel);
						var elTop = $stickyEl.offset().top,
						width = $stickyEl.width();
						$(window).on('scroll.sticky',function() {
					        var windowTop = $(window).scrollTop();
					        if (windowTop > elTop) {
					        	$stickyEl.addClass('sticky');
					        	$stickyEl.css('width',width);
					        } else {
					        	$stickyEl.removeClass('sticky');
					        	$stickyEl.css('width','auto');
					        }
					    });
					}
				});
			},
			"sDom":'<"top"lip>rt<"bottom"ip><"clear">'
		});
		
		// define sort options
		var sortParams = {
			"items": [
				{"label": "<spring:message code="teacher.management.projectruntabs.sort_NewOld"/>", "column": 3, "direction": "desc" },
				{"label": "<spring:message code="teacher.management.projectruntabs.sort_OldNew"/>", "column": 3, "direction": "asc" },
				{"label": "<spring:message code="teacher.management.projectruntabs.sort_AZ"/>", "column": 8, "direction": "asc" },
				{"label": "<spring:message code="teacher.management.projectruntabs.sort_ZA"/>", "column": 8, "direction": "desc" }
			]
		}
		
		var i;
		for(i=0; i<oTable.length; i++){
			oTable.dataTableExt.iApiIndex = i;
			var wrapper = oTable.fnSettings().nTableWrapper;
			var table = oTable.fnSettings();
			var id = $(table.oInstance).attr('id');
			
			// Define FacetedFilter options
			var facets = new FacetedFilter( table, {
				"bScroll": false,
				"sClearFilterLabel": "<spring:message code="datatable_ff_filter_clear"/>",
				"sClearSearchLabel": "<spring:message code="datatable_ff_search_clear"/>",
				"sFilterLabel": "<spring:message code="datatable_ff_filter_label"/>",
				"sSearchLabel": "<spring:message code="datatable_ff_search_label"/>",
				"aSearchOpts": [
					{
						"identifier": "keyword", "label": "<spring:message code="datatable_ff_keyword_label"/> ", "column": 0, "maxlength": 50
					},
					{
						"identifier": "period", "label": "<spring:message code="datatable_ff_period_label"/> ", "column": 7, "maxlength": 30,
						"regexreplace": {"match": "/,\s*/gi", "replacement": " "},
						"instructions": "<spring:message code="datatable_ff_period_instructions"/>"
					}
				 ],
				"aFilterOpts": [
					{
						"identifier": "source", "label": "<spring:message code="teacher.management.projectruntabs.filter_source"/>", "column": 6,
						"options": [
							{"query": "owned", "display": "<spring:message code="teacher.management.projectruntabs.filter_source_owned"/>"},
							{"query": "shared", "display": "<spring:message code="teacher.management.projectruntabs.filter_source_shared"/>"}
						]
					}
				]
			});
			
			// add sort logic
			setSort(i,sortParams,wrapper);
			
			// Make top header scroll with page
			var $stickyEl = $('.dataTables_wrapper .top');
			var elTop = $stickyEl.offset().top,
			width = $stickyEl.width();
			$(window).on('scroll.sticky',function() {
		        var windowTop = $(window).scrollTop();
		        if (windowTop > elTop) {
		        	$stickyEl.addClass('sticky');
		        	$stickyEl.css('width',width);
		        } else {
		        	$stickyEl.removeClass('sticky');
		        	$stickyEl.css('width','auto');
		        }
		    });
		}
		
		// setup sorting
		function setSort(index,sortParams,wrapper) {
			if(sortParams.items.length){
				// insert sort options into DOM
				var sortHtml = '<div class="dataTables_sort"><spring:message code="datatable_sort"/> <select id="' + 'sort_' + index + '"  size="1">';
				$.each(sortParams.items,function(){
					sortHtml += '<option>' + this.label + '</option>';
				});
				sortHtml +=	'</select></div>';
				$(wrapper).children('.top').prepend(sortHtml);
				
				$('#sort_' + index).change(function(){
					$.fn.dataTableExt.iApiIndex = index;
					var i = $('option:selected', '#sort_' + index).index();
					oTable.fnSort( [ [sortParams.items[i].column,sortParams.items[i].direction] ] );
				});
			}
		};
		
		// reset cloumn widths on run tables (datatables seems to change these)
		$('.runHeader').width(220);
		$('.studentHeader').width(155);
		$('.toolsHeader').width(285);
	});
	
	// setup grading and classroom monitor dialogs
	$('.grading, .researchTools').on('click',function(){
		var settings = $(this).attr('id');
		var title = $(this).attr('title');
		var path = "${contextPath}/teacher/grading/gradework.html?" + settings;
		var div = $('#gradingDialog').html('<iframe id="gradingIfrm" width="100%" height="100%" style="overflow-y:hidden;"></iframe>');
		$('body').css('overflow','hidden');
		div.dialog({
			modal: true,
			width: $(window).width() - 32,
			height: $(window).height() - 32,
			title: title,
			close: function (e, ui) { $(this).html(''); $('body').css('overflow','auto'); },
			buttons: {
				Exit: function(){
					$(this).dialog('close');
				}
			}
		});
		$("#gradingDialog > #gradingIfrm").attr('src',path);
	});
	
	// setup grading and classroom monitor dialogs
	$('.classroomMonitor').on('click',function(){
		var settings = $(this).attr('id');
		var title = $(this).attr('title');
		var wiseVersion = $(this).attr('wiseVersion');
        var path = "${contextPath}/teacher/classroomMonitor/classroomMonitor.html?" + settings;
		if (wiseVersion != null && wiseVersion == 5) {
	         path = "${contextPath}/classroomMonitor.html?" + settings;
		}
		window.open(path);
	});
	
	//setup classroom manager link
	$('.classroomManager').on('click',function(){
		var settings = $(this).attr('id');
		var title = $(this).attr('title');
		var path = "${contextPath}/teacher/classroomManager.html?" + settings;
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
			height: '450',
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
		$("#editAnnouncementsDialog > #announceIfrm").attr('src',path);
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
	
	// setup manage students dialog
	$('.manageStudents').on('click',function(){
		var title = $(this).attr('title');
		var params = $(this).attr('id').replace('manageStudents_','');
		var path = "${contextPath}/teacher/management/viewmystudents.html?" + params;
		var div = $('#manageStudentsDialog').html('<iframe id="manageStudentsIfrm" width="100%" height="100%"></iframe>');
		$('body').css('overflow','hidden');
		div.dialog({
			modal: true,
			width: $(window).width() - 32,
			height: $(window).height() - 32,
			title: title,
			beforeClose: function() {
				// check for unsaved changes and alert user if necessary
				if(document.getElementById('manageStudentsIfrm').contentWindow['unsavedChanges']){
					var confirmText = '<spring:escapeBody javaScriptEscape="true"><spring:message code="teacher.management.projectruntabs.manageStudentsUnsaved"/></spring:escapeBody>';
					var answer = confirm(confirmText);
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
				$('body').css('overflow','auto');
			},
			buttons: {
				Exit: function(){
					$(this).dialog('close');
				}
			}
		});
		$("#manageStudentsDialog > #manageStudentsIfrm").attr('src',path);
	});
	
	// Set up view project details click action for each project id link
	$('a.projectDetail, a.projectInfo').on('click',function(){
		var title = $(this).attr('title');
		if($(this).hasClass('projectDetail')){
			var projectId = $(this).attr('id').replace('projectDetail_','');
		} else if($(this).hasClass('projectInfo')){
			var projectId = $(this).attr('id').replace('projectInfo_','');
		}
		var path = "${contextPath}/projectInfo?projectId=" + projectId;
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
			dialogContent = '<spring:message code="teacher.management.projectruntabs.unshare.dialog.confirm" htmlEscape="false" />',
			title = '<spring:message code="teacher.management.projectruntabs.unshare.dialog.title" /> ' + runName + ' (<spring:message code="id" />: ' + runId + ')',
			processing = '<spring:message code="teacher.management.projectruntabs.unshare.dialog.processing" />';
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
							$('#unshareDialog').html("<p><spring:message code='teacher.management.projectruntabs.unshare.dialog.success'/></p>");
							$('button:eq(1)',$('#unshareDialog').parent()).show().click(function(){
								agreed = true;
								$('#unshareDialog').dialog('close');
								// reload page TODO: remove row dynamically without page reload
								window.location.reload();
							});
						},
						error: function(data, text, xml){
							// an error occured, so we will display an error message to the user
							$('#unshareDialog').html('<p><spring:message code="teacher.management.projectruntabs.unshare.dialog.failure"/></p>');
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
 </script>