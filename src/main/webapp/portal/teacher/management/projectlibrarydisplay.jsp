<link href="${contextPath}/<spring:theme code="teacherrunstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerydatatables.css"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="facetedfilter.css"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="tiptip.css"/>" media="screen" rel="stylesheet" type="text/css" />

<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ page buffer="100kb" %>

<div id="projectTabs" class="panelTabs">
    <ul>
    	<li><a href="#activeProjects"><spring:message code="current"/>  (${totalActiveProjects})</a></li>
    	<li><a href="#archivedProjects"><spring:message code="archived"/>  (${totalArchivedProjects})</a></li>
    </ul>
    <div id="activeProjects">
    	<div class="runBox">
			<table id="myProjects" class="projectTable">
				<thead class="tableHeaderMain">
					<tr>
						<th>total available projects: (${totalActiveProjects})</th>
						<th>root project</th>
						<th>source</th>
						<th>subject</th>
						<th>grade level</th>
						<th>duration</th>
						<th>comp duration</th>
						<th>language</th>
						<th>date created</th>
						<th>isBookmarked</th>
						<th>isRoot</th>
						<th>isLibraryFamily</th>
						<th>libraryFamilyName</th>
						<th>libraryFamilyId</th>
						<th>last updated</th>
					</tr>
				</thead>
				<tbody>
					<c:choose>
						<c:when test="${fn:length(ownedProjectsList) > 0}">
							<c:forEach var="project" items="${ownedProjectsList}">
								<c:if test="${project.deleted == 'false'}">
									<c:set var="projectName" value="${projectNameMap[project.id]}" />
									<c:set var="projectNameEscaped" value="${projectNameEscapedMap[project.id]}" />
									<c:set var="hasRun" value="false" />
									<c:forEach var="entry" items="${projectRunDateMap}">
										<c:if test="${entry.getKey() == project.id}">
											<c:set var="hasRun" value="true" />
										</c:if>
									</c:forEach>
									<tr class="projectRow" data-id="${project.id}">
										<td>
											<c:set var="projectClass" value="projectBox owned" />
											<c:set var="isChildNoRoot" value="false" />
											<c:set var="isChild" value="false" />
											<c:choose>
												<c:when test="${project.rootProjectId == project.id}">
													<c:set var="projectClass" value="projectBox owned rootProject" />
												</c:when>
												<c:otherwise>
													<c:forEach var="item" items="${projectIds}">
													  <c:if test="${item eq project.rootProjectId}">
													    <c:set var="rootId" value="${project.rootProjectId}" />
													    <c:set var="projectClass" value="projectBox owned childProject" />
													    <c:set var="isChild" value="true" />
													  </c:if>
													</c:forEach>
													<c:if test="${!isChild}">
														<c:forEach var="item" items="${projectIds}">
														  <c:if test="${item eq project.parentProjectId}">
														  	<c:set var="projectClass" value="projectBox owned childProject" />
														    <c:set var="rootId" value="${project.parentProjectId}" />
														    <c:set var="isChildNoRoot" value="true" />
														  </c:if>
														</c:forEach>
													</c:if>
												</c:otherwise>
											</c:choose>
											<c:choose>
												<c:when test="${isChild || isChildNoRoot}">
													<div class="${projectClass}" data-id="${project.id}" data-rootid="${rootId}">
												</c:when>
												<c:otherwise>
													<div class="${projectClass}" data-id="${project.id}">
												</c:otherwise>
											</c:choose>
												<div class="projectOverview">
													<div class="projectHeader">
														<div class="projectInfo">
															<c:set var="bookmarked" value="false" />
															<c:forEach var="bookmark" items="${bookmarkedProjectsList}">
																<c:if test="${bookmark.id == project.id}">
																	<c:set var="bookmarked" value="true" />
																</c:if>
															</c:forEach>
															<a data-id="${project.id}" class="bookmark ${bookmarked} tooltip" title="<spring:message code="toggleFavorite" />"></a>
															<a class="projectTitle" data-id="${project.id}">${projectName}</a>
															<span>(<spring:message code="id_label" /> ${project.id})</span>
														</div>
														<div class="projectTools">
															<c:if test="${isChild || isChildNoRoot}">
																<c:choose>
																	<c:when test="${hasRun}">
																		<span class="childDate runCopy"><spring:message code="teacher.management.projectlibrarydisplay.createdForRun" /> ${projectRunIdMap[project.id]}: <fmt:formatDate value="${projectRunDateMap[project.id]}" type="date" dateStyle="medium" /></span>
																	</c:when>
																	<c:otherwise>
																		<span class="childDate"><spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" /></span>
																	</c:otherwise>
																</c:choose>
															</c:if>
															<ul class="actions">
																<li><a class="tooltip" href="<c:url value="/previewproject.html"><c:param name="projectId" value="${project.id}"/></c:url>" title="<spring:message code="preview_tip" />" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" />
																	<span<c:if test="${!isChild && !isChildNoRoot}"> style="font-weight:bold;"</c:if>><spring:message code="preview" /></span></a>&nbsp;|
																</li>
																<sec:accesscontrollist domainObject="${project}" hasPermission="16">
																	<li><a title="<spring:message code="share_tip" />" data-id="${project.id}" class="shareProject tooltip" dialog-title="<spring:message code="share_permissionsTitle" /> ${project.name} (<spring:message code="id" /> ${project.id})"><img class="icon" alt="share" src="${contextPath}/<spring:theme code="agent"/>" /><span><spring:message code="share" /></span></a>&nbsp;|</li>
																</sec:accesscontrollist>
																<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.copy_tip" />" onclick="copy('${project.id}','${project.projectType}','${projectNameEscaped}','${filenameMap[project.id]}','${urlMap[project.id]}')" ><img class="icon" alt="copy" src="${contextPath}/<spring:theme code="copy"/>" /><span><spring:message code="copy" /></span></a>&nbsp;|</li>
																<sec:accesscontrollist domainObject="${project}" hasPermission="2">
																	<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.edit_tip" />" href="${contextPath}/author/authorproject.html?projectId=${project.id}"><img class="icon" alt="edit" src="${contextPath}/<spring:theme code="edit"/>" /><span><spring:message code="edit" /></span></a>&nbsp;|</li>
																</sec:accesscontrollist>
																<!-- <li><a style="color:#666;">Archive</a>
																<input type='checkbox' id='public_${project.id}' onclick='changePublic("${project.id}")'/> Is Public</li>-->
																<c:set var="isOwner" value="false" />
																<c:forEach var="owner" items="${project.owners}">
																	<c:if test="${owner.id == user.id}">
																		<c:set var="isOwner" value="true" />
																	</c:if>
																</c:forEach>
																<c:if test="${isOwner == 'true'}">
																	<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.archive_tip" />" onclick="archiveProject('<spring:escapeBody javaScriptEscape="true">${project.name}</spring:escapeBody>', ${project.id})"><img class="icon" alt="archive" src="${contextPath}/<spring:theme code="lock"/>" />
																	<span><spring:message code="teacher.management.projectlibrarydisplay.archive" /></span></a>&nbsp;|</li>												
																</c:if>
																<li><a class="setupRun tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.startRun_tip" />" href="<c:url value="../run/createRun.html"><c:param name="projectId" value="${project.id}"/></c:url>"><img class="icon" alt="new run" src="${contextPath}/<spring:theme code="computer"/>" />
																	<span<c:if test="${!isChild && !isChildNoRoot}"> style="font-weight:bold;"</c:if>><spring:message code="teacher.management.projectlibrarydisplay.startRun" /></span></a>
																</li>
															</ul>
														</div>
														<div style="clear:both;"></div>
													</div>
													<div class="projectSummary">
														<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
														<div class="summaryInfo">
															<div class="basicInfo">
																<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}">${project.metadata.totalTime} | </c:if>
																<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																<div style="float:right;">
																	<c:choose>
																		<c:when test="${hasRun && (isChild || isChildNoRoot)}">
																			<span class="runCopy"><spring:message code="teacher.management.projectlibrarydisplay.createdForRun" /> ${projectRunIdMap[project.id]}: <fmt:formatDate value="${projectRunDateMap[project.id]}" type="date" dateStyle="medium" /> </span><img class='tooltip' src="${contextPath}/<spring:theme code="helpicon"/>" title="<spring:message code="teacher.management.projectlibrarydisplay.help_runCopy" />" data-tooltip-anchor="left" data-tooltip-class="info" data-tooltip-event="click" data-tooltip-title="<spring:message code="teacher.management.projectlibrarydisplay.help_runCopy_title" />" alt="help" />
																		</c:when>
																		<c:otherwise>
																			<spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" />
																		</c:otherwise>
																	</c:choose>
																</div>
															</div>
															<div data-id="${project.id}" class="summaryText">
															<c:if test="${project.metadata.summary != null && project.metadata.summary != ''}">
																<c:choose>
																	<c:when test="${(fn:length(project.metadata.summary) > 170) && !isChild}">
																		<c:set var="length" value="${fn:length(project.metadata.summary)}" />
																		<c:set var="summary" value="${fn:substring(project.metadata.summary,0,170)}" />
																		<c:set var="truncated" value="${fn:substring(project.metadata.summary,170,length)}" />
																		<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${summary}<span class="ellipsis">...</span><span class="truncated">${truncated}</span>
																	</c:when>
																	<c:otherwise>
																		<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${project.metadata.summary}
																	</c:otherwise>
																</c:choose>
															</c:if>
															</div>
															<div class="details" data-id="${project.id}">
																<c:if test="${project.metadata.keywords != null && project.metadata.keywords != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tags" /></span> ${project.metadata.keywords}</p></c:if>
																<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString} (<a href="${contextPath}/pages/check.html" target="_blank"><spring:message code="teacher.projects.projectinfo.checkCompatibility" /></a>)</p></c:if>
																<c:if test="${project.metadata.compTime != null && project.metadata.compTime != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_compTime" /></span> ${project.metadata.compTime}</p></c:if>
																<p><span style="font-weight:bold;"><spring:message code="teacher.management.projectlibrarydisplay.projectContact" /></span> <a href="${contextPath}/contact/contactwiseproject.html?projectId=${project.id}"><spring:message code="contact_wise" /></a></p>
																<c:set var="lastEdited" value="${project.metadata.lastEdited}" />
																<c:if test="${lastEdited == null || lastEdited == ''}">
																	<c:set var="lastEdited" value="${project.dateCreated}" />
																</c:if>
																<p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_lastUpdated" /></span> <fmt:formatDate value="${lastEdited}" type="both" dateStyle="medium" timeStyle="short" /></p>
																<c:if test="${project.parentProjectId != null}">
																	<p><span style="font-weight:bold"><spring:message code="teacher.projects.projectinfo.copyLabel"/></span> <a data-id="${project.parentProjectId}" class="projectDetail" title="<spring:message code="project_details" />">${project.parentProjectId}</a></p>
																</c:if>
																<c:if test="${(project.metadata.lessonPlan != null && project.metadata.lessonPlan != '') ||
																	(project.metadata.standards != null && project.metadata.standards != '')}">
																	<div class="viewLesson"><a class="viewLesson" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards_tip" />"><spring:message code="teacher.projects.projectinfo.tipsAndStandards" /></a></div>
																	<div class="lessonPlan" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards" />">
																		<div class="panelHeader">${project.name} (<spring:message code="id_label" /> ${project.id})
																			<span style="float:right;"><a class="printLesson" data-id="${project.id}"><spring:message code="print" /></a></span>
																		</div>
																		<c:if test="${project.metadata.lessonPlan != null && project.metadata.lessonPlan != ''}">
																			<div class="basicInfo sectionContent">
																				<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																				<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																				<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}"><spring:message code="teacher.projects.projectinfo.meta_duration" /> ${project.metadata.totalTime} | </c:if>
																				<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																				<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString}</p></c:if>
																			</div>
																			<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_tips" /></div>
																			<div class="sectionContent">${project.metadata.lessonPlan}</div>
																		</c:if>
																		<c:if test="${project.metadata.standards != null && project.metadata.standards != ''}">
																			<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_standards" /></div>
																			<div class="sectionContent">${project.metadata.standards}</div>
																		</c:if>
																	</div>
																</c:if>
																<c:if test="${fn:length(project.sharedowners) > 0}">
																	<div class="sharedIcon">
																		<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" />
																		<spring:message code="teacher.management.projectlibrarydisplay.sharedWith" /> 
																		<span style="font-weight:normal"><c:forEach var="sharedowner" items="${project.sharedowners}" varStatus="status">
																		  <c:out value="${sharedowner.userDetails.firstname}"/>
																		  <c:out value="${sharedowner.userDetails.lastname}"/>${not status.last ? ', ' : ''}
																		</c:forEach></span>
																	</div>
																</c:if>
															</div>
														</div>
													</div>
													<div style="clear:both;"></div>
													<div class="detailsLinks">
														<div style="float:right; text-align:right">
															<a data-id="${project.id}" class="detailsToggle"><spring:message code="teacher.management.projectlibrarydisplay.detailsShow" /></a>
														</div>
														<div style="clear:both;"></div>
													</div>
												</div>
											</div>
										</td>
										<td style="display:none;">
											<c:choose>
												<c:when test="${isChildNoRoot}">
													${project.parentProjectId}
												</c:when>
												<c:otherwise>
													${project.rootProjectId}
												</c:otherwise>
											</c:choose>
										</td>
										<td style="display:none;">owned</td>
										<td style="display:none;">${project.metadata.subject}</td>
										<td style="display:none;">${project.metadata.gradeRange}</td>
										<td style="display:none;">${project.metadata.totalTime}</td>
										<td style="display:none;">${project.metadata.compTime}</td>
										<td style="display:none;">${project.metadata.language}</td>
										<td style="display:none;">${project.dateCreated}</td>
										<td style="display:none;">${bookmarked}</td>
										<c:set var="root" value="0" />
										<c:if test="${project.rootProjectId == project.id}">
											<c:set var="root" value="1" />
										</c:if>
										<td style="display:none;">${root}</td>
										<c:set var="isLibraryFamily" value="0" />
										<c:set var="libraryFamilyName" value="" />
										<c:set var="libraryFamilyId" value="" />
										<c:forEach var="libraryProject" items="${libraryProjectsList}">
											<c:if test="${project.rootProjectId == libraryProject.id}">
												<c:set var="isLibraryFamily" value="1" />
												<c:set var="libraryFamilyName" value="${libraryProject.name}" />
												<c:set var="libraryFamilyId" value="${libraryProject.id}" />
											</c:if>
										</c:forEach>
										<td style="display:none;">${isLibraryFamily}</td>
										<td style="display:none;">${libraryFamilyName}</td>
										<td style="display:none;">${libraryFamilyId}</td>
										<td style="display:none;">${lastEdited}</td>
									</tr>
								</c:if>
							</c:forEach>
						</c:when>
					</c:choose>
					<!-- shared projects -->
					<c:choose>
						<c:when test="${fn:length(sharedProjectsList) > 0}">
							<c:forEach var="project" items="${sharedProjectsList}">
								<c:if test="${project.deleted == 'false'}">
									<c:set var="projectName" value="${projectNameMap[project.id]}" />
									<c:set var="projectNameEscaped" value="${projectNameEscapedMap[project.id]}" />
									<c:set var="hasRun" value="false" />
									<c:forEach var="entry" items="${projectRunDateMap}">
										<c:if test="${entry.getKey() == project.id}">
											<c:set var="hasRun" value="true" />
										</c:if>
									</c:forEach>
									<tr class="projectRow"  data-id="${project.id}">
										<td>
											<c:set var="projectClass" value="projectBox shared" />
											<c:set var="isChildNoRoot" value="false" />
											<c:set var="isChild" value="false" />
											<c:choose>
												<c:when test="${project.rootProjectId == project.id}">
													<c:set var="projectClass" value="projectBox shared rootProject" />
												</c:when>
												<c:otherwise>
													<c:forEach var="item" items="${projectIds}">
													  <c:if test="${item eq project.rootProjectId}">
													    <c:set var="rootId" value="${project.rootProjectId}" />
													    <c:set var="projectClass" value="projectBox shared childProject" />
													    <c:set var="isChild" value="true" />
													  </c:if>
													</c:forEach>
													<c:if test="${!isChild}">
														<c:forEach var="item" items="${projectIds}">
														  <c:if test="${item eq project.parentProjectId}">
														  	<c:set var="projectClass" value="projectBox shared childProject" />
														    <c:set var="rootId" value="${project.parentProjectId}" />
														    <c:set var="isChildNoRoot" value="true" />
														  </c:if>
														</c:forEach>
													</c:if>
												</c:otherwise>
											</c:choose>
											<c:choose>
												<c:when test="${isChild || isChildNoRoot}">
													<div class="${projectClass}" data-id="${project.id}" data-rootid="${rootId}">
												</c:when>
												<c:otherwise>
													<div class="${projectClass}" data-id="${project.id}">
												</c:otherwise>
											</c:choose>
												<div class="projectOverview">
													<div class="projectHeader">
														<div class="projectInfo">
															<c:set var="bookmarked" value="false" />
															<c:forEach var="bookmark" items="${bookmarkedProjectsList}">
																<c:if test="${bookmark.id == project.id}">
																	<c:set var="bookmarked" value="true" />
																</c:if>
															</c:forEach>
															<a data-id="${project.id}" class="bookmark ${bookmarked} tooltip" title="<spring:message code="toggleFavorite" />"></a>
															<a class="projectTitle" data-id="${project.id}">${project.name}</a>
															<span>(<spring:message code="id_label" /> ${project.id})</span>
														</div>
														<div class="projectTools">
															<c:if test="${isChild || isChildNoRoot}">
																<c:choose>
																	<c:when test="${hasRun}">
																		<span class="childDate runCopy"><spring:message code="teacher.management.projectlibrarydisplay.createdForRun" /> ${projectRunIdMap[project.id]}: <fmt:formatDate value="${projectRunDateMap[project.id]}" type="date" dateStyle="medium" /></span>
																	</c:when>
																	<c:otherwise>
																		<span class="childDate"><spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" /></span>
																	</c:otherwise>
																</c:choose>
															</c:if>
															<ul class="actions">
																<li><a class="tooltip" href="<c:url value="/previewproject.html"><c:param name="projectId" value="${project.id}"/></c:url>" title="<spring:message code="preview_tip" />" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" />
																	<span<c:if test="${!isChild && !isChildNoRoot}"> style="font-weight:bold;"</c:if>><spring:message code="preview" /></span></a>&nbsp;|
																</li>
																<sec:accesscontrollist domainObject="${project}" hasPermission="16">
																	<li><a title="<spring:message code="share_tip" />" data-id="${project.id}" class="shareProject tooltip" dialog-title="<spring:message code="share_permissionsTitle" /> ${project.name} (<spring:message code="id" /> ${project.id})"><img class="icon" alt="share" src="${contextPath}/<spring:theme code="agent"/>" /><span><spring:message code="share" /></span></a>&nbsp;|</li>
																</sec:accesscontrollist>
																<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.copy_tip" />" onclick="copy('${project.id}','${project.projectType}','${projectNameEscaped}','${filenameMap[project.id]}','${urlMap[project.id]}')" ><img class="icon" alt="copy" src="${contextPath}/<spring:theme code="copy"/>" /><span><spring:message code="copy" /></span></a>&nbsp;|</li>
																<sec:accesscontrollist domainObject="${project}" hasPermission="2">
																	<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.edit_tip" />" href="${contextPath}/author/authorproject.html?projectId=${project.id}"><img class="icon" alt="edit" src="${contextPath}/<spring:theme code="edit"/>" /><span><spring:message code="edit" /></span></a>&nbsp;|</li>
																</sec:accesscontrollist>
																
																<!-- <li><a style="color:#666;">Archive</a>
																<input type='checkbox' id='public_${project.id}' onclick='changePublic("${project.id}")'/> Is Public</li>-->
																<li><a class="setupRun tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.startRun_tip" />" href="<c:url value="../run/createRun.html"><c:param name="projectId" value="${project.id}"/></c:url>"><img class="icon" alt="new run" src="${contextPath}/<spring:theme code="computer"/>" />
																	<span<c:if test="${!isChild && !isChildNoRoot}"> style="font-weight:bold;"</c:if>><spring:message code="teacher.management.projectlibrarydisplay.startRun" /></span></a>
																</li>
															</ul>
														</div>
														<div style="clear:both;"></div>
													</div>
													<div class="projectSummary">
														<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
														<div class="summaryInfo">
															<div class="sharedIcon">
															<c:if test="${fn:length(project.sharedowners) > 0}">
																<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" />
																<spring:message code="teacher.management.projectlibrarydisplay.ownedBy" /> 
																<c:forEach var="projectowner" items="${project.owners}" varStatus="status">
																	<c:out value="${projectowner.userDetails.firstname}" />
										  							<c:out value="${projectowner.userDetails.lastname}" />
																</c:forEach>
																<a class="unshare" onclick="unshareFromProject('${project.id}','<spring:escapeBody javaScriptEscape="true">${project.name}</spring:escapeBody>')"><spring:message code="teacher.management.projectlibrarydisplay.unshare" /></a>
															</c:if>
															</div>
															<div class="basicInfo">
																<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}">${project.metadata.totalTime} | </c:if>
																<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																<div style="float:right;">
																	<c:choose>
																		<c:when test="${hasRun && (isChild || isChildNoRoot)}">
																			<span class="runCopy"><spring:message code="teacher.management.projectlibrarydisplay.createdForRun" /> ${projectRunIdMap[project.id]}: <fmt:formatDate value="${projectRunDateMap[project.id]}" type="date" dateStyle="medium" /> </span><img class='tooltip' src="${contextPath}/<spring:theme code="helpicon"/>" title="<spring:message code="teacher.management.projectlibrarydisplay.help_runCopy" />" data-tooltip-anchor="left" data-tooltip-class="info" data-tooltip-event="click" data-tooltip-title="<spring:message code="teacher.management.projectlibrarydisplay.help_runCopy_title" />" alt="help" />
																		</c:when>
																		<c:otherwise>
																			<spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" />
																		</c:otherwise>
																	</c:choose>
																</div>
															</div>
															<div data-id="${project.id}" class="summaryText">
															<c:if test="${project.metadata.summary != null && project.metadata.summary != ''}">
																<c:choose>
																	<c:when test="${(fn:length(project.metadata.summary) > 170) && !isChild}">
																		<c:set var="length" value="${fn:length(project.metadata.summary)}" />
																		<c:set var="summary" value="${fn:substring(project.metadata.summary,0,170)}" />
																		<c:set var="truncated" value="${fn:substring(project.metadata.summary,170,length)}" />
																		<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${summary}<span class="ellipsis">...</span><span class="truncated">${truncated}</span>
																	</c:when>
																	<c:otherwise>
																		<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${project.metadata.summary}
																	</c:otherwise>
																</c:choose>
															</c:if>
															</div>
															<div class="details" data-id="${project.id}">
																<c:if test="${project.metadata.keywords != null && project.metadata.keywords != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tags" /></span> ${project.metadata.keywords}</p></c:if>
																<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString} (<a href="${contextPath}/pages/check.html" target="_blank"><spring:message code="teacher.projects.projectinfo.checkCompatibility" /></a>)</p></c:if>
																<c:if test="${project.metadata.compTime != null && project.metadata.compTime != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_compTime" /></span> ${project.metadata.compTime}</p></c:if>
																<p><span style="font-weight:bold;"><spring:message code="teacher.management.projectlibrarydisplay.projectContact" /></span> <a href="${contextPath}/contact/contactwiseproject.html?projectId=${project.id}"><spring:message code="contact_wise" /></a></p>
																<c:set var="lastEdited" value="${project.metadata.lastEdited}" />
																<c:if test="${lastEdited == null || lastEdited == ''}">
																	<c:set var="lastEdited" value="${project.dateCreated}" />
																</c:if>
																<p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_lastUpdated" /></span> <fmt:formatDate value="${lastEdited}" type="both" dateStyle="medium" timeStyle="short" /></p>
																<c:if test="${project.parentProjectId != null}">
																	<p><span style="font-weight:bold"><spring:message code="teacher.projects.projectinfo.copyLabel"/></span> <a data-id="${project.parentProjectId}" class="projectDetail" title="<spring:message code="project_details"/>">${project.parentProjectId}</a></p>
																</c:if>
																<c:if test="${(project.metadata.lessonPlan != null && project.metadata.lessonPlan != '') ||
																	(project.metadata.standards != null && project.metadata.standards != '')}">
																	<div class="viewLesson"><a class="viewLesson" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards_tip" />"><spring:message code="teacher.projects.projectinfo.tipsAndStandards" /></a></div>
																	<div class="lessonPlan" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards" />">
																		<div class="panelHeader">${project.name} (<spring:message code="id_label" /> ${project.id})
																			<span style="float:right;"><a class="printLesson" data-id="${project.id}"><spring:message code="print" /></a></span>
																		</div>
																		<c:if test="${project.metadata.lessonPlan != null && project.metadata.lessonPlan != ''}">
																			<div class="basicInfo sectionContent">
																				<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																				<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																				<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}"><spring:message code="teacher.projects.projectinfo.meta_duration" /> ${project.metadata.totalTime} | </c:if>
																				<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																				<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString}</p></c:if>
																			</div>
																			<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_tips" /></div>
																			<div class="sectionContent">${project.metadata.lessonPlan}</div>
																		</c:if>
																		<c:if test="${project.metadata.standards != null && project.metadata.standards != ''}">
																			<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_standards" /></div>
																			<div class="sectionContent">${project.metadata.standards}</div>
																		</c:if>
																	</div>
																</c:if>
																<c:if test="${fn:length(project.sharedowners) > 0}">
																	<div class="sharedIcon">
																		<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" />
																		<spring:message code="teacher.management.projectlibrarydisplay.sharedWith" /> 
																		<span style="font-weight:normal"><c:forEach var="sharedowner" items="${project.sharedowners}" varStatus="status">
																		  <c:out value="${sharedowner.userDetails.firstname}"/>
																		  <c:out value="${sharedowner.userDetails.lastname}"/>${not status.last ? ', ' : ''}
																		</c:forEach></span>
																	</div>
																</c:if>
															</div>
														</div>
													</div>
													<div style="clear:both;"></div>
													<div class="detailsLinks">
														<div style="float:right; text-align:right">
															<a data-id="${project.id}" class="detailsToggle"><spring:message code="teacher.management.projectlibrarydisplay.detailsShow" /></a>
														</div>
														<div style="clear:both;"></div>
													</div>
												</div>
											</div>
										</td>
										<td style="display:none;">
											<c:choose>
												<c:when test="${isChildNoRoot}">
													${project.parentProjectId}
												</c:when>
												<c:otherwise>
													${project.rootProjectId}
												</c:otherwise>
											</c:choose>
										</td>
										<td style="display:none;">shared</td>
										<td style="display:none;">${project.metadata.subject}</td>
										<td style="display:none;">${project.metadata.gradeRange}</td>
										<td style="display:none;">${project.metadata.totalTime}</td>
										<td style="display:none;">${project.metadata.compTime}</td>
										<td style="display:none;">${project.metadata.language}</td>
										<td style="display:none;">${project.dateCreated}</td>
										<td style="display:none;">${bookmarked}</td>
										<c:set var="root" value="0" />
										<c:if test="${project.rootProjectId == project.id}">
											<c:set var="root" value="1" />
										</c:if>
										<td style="display:none;">${root}</td>
										<c:set var="isLibraryFamily" value="0" />
										<c:set var="libraryFamilyName" value="" />
										<c:set var="libraryFamilyId" value="" />
										<c:forEach var="libraryProject" items="${libraryProjectsList}">
											<c:if test="${project.rootProjectId == libraryProject.id}">
												<c:set var="isLibraryFamily" value="1" />
												<c:set var="libraryFamilyName" value="${libraryProject.name}" />
												<c:set var="libraryFamilyId" value="${libraryProject.id}" />
											</c:if>
										</c:forEach>
										<td style="display:none;">${isLibraryFamily}</td>
										<td style="display:none;">${libraryFamilyName}</td>
										<td style="display:none;">${libraryFamilyId}</td>
										<td style="display:none;">${lastEdited}</td>
									</tr>
								</c:if>
							</c:forEach>
						</c:when>
					</c:choose>
					
					<c:choose>
						<c:when test="${fn:length(libraryProjectsList) > 0}">
							<c:forEach var="project" items="${libraryProjectsList}">
								<c:if test="${project.deleted == 'false'}">
									<c:set var="projectName" value="${projectNameMap[project.id]}" />
									<c:set var="projectNameEscaped" value="${projectNameEscapedMap[project.id]}" />
									<c:set var="hasRun" value="false" />
									<c:forEach var="entry" items="${projectRunDateMap}">
										<c:if test="${entry.getKey() == project.id}">
											<c:set var="hasRun" value="true" />
										</c:if>
									</c:forEach>
									<tr class="projectRow" data-id="${project.id}">
										<td>
											<c:set var="projectClass" value="projectBox rootProject library" />
											<c:forEach var="item" items="${ownedRemove}">
												<c:if test="${project eq item}">
													<c:set var="projectClass" value="projectBox rootProject library owned" />
												</c:if>
											</c:forEach>
											<c:forEach var="item" items="${sharedRemove}">
												<c:if test="${project eq item}">
													<c:set var="projectClass" value="projectBox rootProject library shared" />
												</c:if>
											</c:forEach>
											<div class="${projectClass}" data-id="${project.id}">
												<div class="projectOverview">
													<div class="projectHeader">
														<div class="projectInfo">
															<c:set var="bookmarked" value="false" />
															<c:forEach var="bookmark" items="${bookmarkedProjectsList}">
																<c:if test="${bookmark.id == project.id}">
																	<c:set var="bookmarked" value="true" />
																</c:if>
															</c:forEach>
															<a data-id="${project.id}" class="bookmark ${bookmarked} tooltip" title="<spring:message code="toggleFavorite" />"></a>
															<a class="projectTitle" data-id="${project.id}">${project.name}</a>
															<span>(<spring:message code="id_label" /> ${project.id})</span>
														</div>
														<div class="projectTools">
															<ul class="actions">
																<li><a class="tooltip" href="<c:url value="/previewproject.html"><c:param name="projectId" value="${project.id}"/></c:url>" title="<spring:message code="preview_tip" />" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" />
																	<span style="font-weight:bold;"><spring:message code="preview" /></span></a>&nbsp;|
																</li>
																<sec:accesscontrollist domainObject="${project}" hasPermission="16">
																	<li><a title="<spring:message code="share_tip" />" data-id="${project.id}" class="shareProject tooltip" dialog-title="<spring:message code="share_permissionsTitle" /> ${project.name} (<spring:message code="id" /> ${project.id})"><img class="icon" alt="share" src="${contextPath}/<spring:theme code="agent"/>" /><span><spring:message code="share" /></span></a>&nbsp;|</li>
																</sec:accesscontrollist>
																<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.copy_tip" />" onclick="copy('${project.id}','${project.projectType}','${projectNameEscaped}','${filenameMap[project.id]}','${urlMap[project.id]}')" ><img class="icon" alt="copy" src="${contextPath}/<spring:theme code="copy"/>" /><span><spring:message code="copy" /></span></a>&nbsp;|</li>
																<sec:accesscontrollist domainObject="${project}" hasPermission="2">
																	<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.edit_tip" />" href="${contextPath}/author/authorproject.html?projectId=${project.id}"><img class="icon" alt="edit" src="${contextPath}/<spring:theme code="edit"/>" /><span><spring:message code="edit" /></span></a>&nbsp;|</li>
																</sec:accesscontrollist>
																<!-- <li><a style="color:#666;">Archive</a>
																<input type='checkbox' id='public_${project.id}' onclick='changePublic("${project.id}")'/> Is Public</li>-->
																<li><a class="setupRun tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.startRun_tip" />" href="<c:url value="../run/createRun.html"><c:param name="projectId" value="${project.id}"/></c:url>"><img class="icon" alt="new run" src="${contextPath}/<spring:theme code="computer"/>" />
																	<span style="font-weight:bold;"><spring:message code="teacher.management.projectlibrarydisplay.startRun" /></span></a>
																</li>
															</ul>
														</div>
													</div>
													<div style="clear:both;"></div>
													<div class="projectSummary">
														<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
														<div class="summaryInfo">
															<c:if test="${fn:length(project.sharedowners) > 0}">
																<div class="sharedIcon" style="float:right;">
																	<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" />
																	<spring:message code="teacher.management.projectlibrarydisplay.ownedBy" /> 
																	<c:forEach var="projectowner" items="${project.owners}" varStatus="status">
																		<c:out value="${projectowner.userDetails.firstname}" />
											  							<c:out value="${projectowner.userDetails.lastname}" />
																	</c:forEach>
																</div>
															</c:if>
															<div class="libraryIcon"><img src="${contextPath}/<spring:theme code="open_book"/>" alt="library project" /> <spring:message code="teacher.management.projectlibrarydisplay.libraryProject" /></div>
															<div class="basicInfo">
																<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}">${project.metadata.totalTime} | </c:if>
																<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																<div style="float:right;">
																	<spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" />
																</div>
															</div>
															<div data-id="${project.id}" class="summaryText">
															<c:if test="${project.metadata.summary != null && project.metadata.summary != ''}">
																<c:choose>
																	<c:when test="${(fn:length(project.metadata.summary) > 170) && (projectClass != 'projectBox childProject')}">
																		<c:set var="length" value="${fn:length(project.metadata.summary)}" />
																		<c:set var="summary" value="${fn:substring(project.metadata.summary,0,170)}" />
																		<c:set var="truncated" value="${fn:substring(project.metadata.summary,170,length)}" />
																		<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${summary}<span class="ellipsis">...</span><span class="truncated">${truncated}</span>
																	</c:when>
																	<c:otherwise>
																		<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${project.metadata.summary}
																	</c:otherwise>
																</c:choose>
															</c:if>
															</div>
															<div class="details" data-id="${project.id}">
																<c:if test="${project.metadata.keywords != null && project.metadata.keywords != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tags" /></span> ${project.metadata.keywords}</p></c:if>
																<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString} (<a href="${contextPath}/pages/check.html" target="_blank"><spring:message code="teacher.projects.projectinfo.checkCompatibility" /></a>)</p></c:if>
																<c:if test="${project.metadata.compTime != null && project.metadata.compTime != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_compTime" /></span> ${project.metadata.compTime}</p></c:if>
																<p><span style="font-weight:bold;"><spring:message code="teacher.management.projectlibrarydisplay.projectContact" /></span> <a href="${contextPath}/contact/contactwiseproject.html?projectId=${project.id}"><spring:message code="contact_wise" /></a></p>
																<c:set var="lastEdited" value="${project.metadata.lastEdited}" />
																<c:if test="${lastEdited == null || lastEdited == ''}">
																	<c:set var="lastEdited" value="${project.dateCreated}" />
																</c:if>
																<p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_lastUpdated" /></span> <fmt:formatDate value="${lastEdited}" type="both" dateStyle="medium" timeStyle="short" /></p>
																<c:if test="${(project.metadata.lessonPlan != null && project.metadata.lessonPlan != '') ||
																	(project.metadata.standards != null && project.metadata.standards != '')}">
																	<div class="viewLesson"><a class="viewLesson" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards_tip" />"><spring:message code="teacher.projects.projectinfo.tipsAndStandards" /></a></div>
																	<div class="lessonPlan" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards" />">
																		<div class="panelHeader">${project.name} (<spring:message code="id_label" /> ${project.id})
																			<span style="float:right;"><a class="printLesson" data-id="${project.id}"><spring:message code="print" /></a></span>
																		</div>
																		<c:if test="${project.metadata.lessonPlan != null && project.metadata.lessonPlan != ''}">
																			<div class="basicInfo sectionContent">
																				<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																				<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																				<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}"><spring:message code="teacher.projects.projectinfo.meta_duration" /> ${project.metadata.totalTime} | </c:if>
																				<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																				<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString}</p></c:if>
																			</div>
																			<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_tips" /></div>
																			<div class="sectionContent">${project.metadata.lessonPlan}</div>
																		</c:if>
																		<c:if test="${project.metadata.standards != null && project.metadata.standards != ''}">
																			<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_standards" /></div>
																			<div class="sectionContent">${project.metadata.standards}</div>
																		</c:if>
																	</div>
															</c:if>
															</div>
														</div>
													</div>
													<div style="clear:both;"></div>
													<div class="detailsLinks">
														<div style="float:right; text-align:right">
															<a data-id="${project.id}" class="detailsToggle"><spring:message code="teacher.management.projectlibrarydisplay.detailsShow" /></a>
														</div>
														<div style="clear:both;"></div>
													</div>
												</div>
											</div>
										</td>
										<td style="display:none;">${project.rootProjectId}</td>
										<td style="display:none;">library</td>
										<td style="display:none;">${project.metadata.subject}</td>
										<td style="display:none;">${project.metadata.gradeRange}</td>
										<td style="display:none;">${project.metadata.totalTime}</td>
										<td style="display:none;">${project.metadata.compTime}</td>
										<td style="display:none;">${project.metadata.language}</td>
										<td style="display:none;">${project.dateCreated}</td>
										<td style="display:none;">${bookmarked}</td>
										<td style="display:none;">1</td>
										<td style="display:none;">1</td>
										<td style="display:none;">${project.name}</td>
										<td style="display:none;">${project.id}</td>
										<td style="display:none;">${lastEdited}</td>
									</tr>
								</c:if>
							</c:forEach>
						</c:when>
					</c:choose>
					
				</tbody>
			</table>
		</div>
	</div>
	<div id="archivedProjects">
		<c:choose>
			<c:when test="${totalArchivedProjects > 0}">
				<p class="info"><spring:message code="teacher.management.projectlibrarydisplay.archive_intro" /></p>
				
				<div class="runBox">
					<table id="myArchivedProjects" class="projectTable">
						<thead class="tableHeaderMain">
							<tr>
								<th>total available projects: (${totalArchivedProjects})</th>
								<th>root project</th>
								<th>source</th>
								<th>subject</th>
								<th>grade level</th>
								<th>duration</th>
								<th>comp duration</th>
								<th>language</th>
								<th>date created</th>
								<th>isBookmarked</th>
								<th>isRoot</th>
								<th>isLibraryFamily</th>
								<th>libraryFamilyName</th>
								<th>libraryFamilyId</th>
								<th>last updated</th>
							</tr>
						</thead>
						<tbody>
							<c:choose>
								<c:when test="${fn:length(ownedProjectsList) > 0}">
									<c:forEach var="project" items="${ownedProjectsList}">
										<c:if test="${project.deleted == 'true'}">
											<c:set var="projectName" value="${projectNameMap[project.id]}" />
											<c:set var="projectNameEscaped" value="${projectNameEscapedMap[project.id]}" />
											<c:set var="hasRun" value="false" />
											<c:forEach var="entry" items="${projectRunDateMap}">
												<c:if test="${entry.getKey() == project.id}">
													<c:set var="hasRun" value="true" />
												</c:if>
											</c:forEach>
											<tr class="projectRow" data-id="${project.id}">
												<td>
													<c:set var="projectClass" value="projectBox owned" />
													<c:set var="isChildNoRoot" value="false" />
													<c:set var="isChild" value="false" />
													<c:choose>
														<c:when test="${project.rootProjectId == project.id}">
															<c:set var="projectClass" value="projectBox owned rootProject" />
														</c:when>
														<c:otherwise>
															<c:forEach var="item" items="${projectIds}">
															  <c:if test="${item eq project.rootProjectId}">
															    <c:set var="rootId" value="${project.rootProjectId}" />
															    <c:set var="projectClass" value="projectBox owned childProject" />
															    <c:set var="isChild" value="true" />
															  </c:if>
															</c:forEach>
															<c:if test="${!isChild}">
																<c:forEach var="item" items="${projectIds}">
																  <c:if test="${item eq project.parentProjectId}">
																  	<c:set var="projectClass" value="projectBox owned childProject" />
																    <c:set var="rootId" value="${project.parentProjectId}" />
																    <c:set var="isChildNoRoot" value="true" />
																  </c:if>
																</c:forEach>
															</c:if>
														</c:otherwise>
													</c:choose>
													<c:choose>
														<c:when test="${isChild || isChildNoRoot}">
															<div class="${projectClass}" data-id="${project.id}" data-rootid="${rootId}">
														</c:when>
														<c:otherwise>
															<div class="${projectClass}" data-id="${project.id}">
														</c:otherwise>
													</c:choose>
														<div class="projectOverview">
															<div class="projectHeader">
																<div class="projectInfo">
																	<c:set var="bookmarked" value="false" />
																	<c:forEach var="bookmark" items="${bookmarkedProjectsList}">
																		<c:if test="${bookmark.id == project.id}">
																			<c:set var="bookmarked" value="true" />
																		</c:if>
																	</c:forEach>
																	<a data-id="${project.id}" class="bookmark ${bookmarked} tooltip" title="<spring:message code="toggleFavorite" />"></a>
																	<a class="projectTitle" data-id="${project.id}">${projectName}</a>
																	<span>(<spring:message code="id_label" /> ${project.id})</span>
																</div>
																<div class="projectTools">
																	<c:if test="${isChild || isChildNoRoot}">
																		<c:choose>
																			<c:when test="${hasRun}">
																				<span class="childDate runCopy"><spring:message code="teacher.management.projectlibrarydisplay.createdForRun" /> ${projectRunIdMap[project.id]}: <fmt:formatDate value="${projectRunDateMap[project.id]}" type="date" dateStyle="medium" /></span>
																			</c:when>
																			<c:otherwise>
																				<span class="childDate"><spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" /></span>
																			</c:otherwise>
																		</c:choose>
																	</c:if>
																	<ul class="actions">
																		<li><a class="tooltip" href="<c:url value="/previewproject.html"><c:param name="projectId" value="${project.id}"/></c:url>" title="<spring:message code="preview_tip" />" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" />
																			<span<c:if test="${!isChild && !isChildNoRoot}"> style="font-weight:bold;"</c:if>><spring:message code="preview" /></span></a>&nbsp;|
																		</li>
																		<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.copy_tip" />" onclick="copy('${project.id}','${project.projectType}','${projectNameEscaped}','${filenameMap[project.id]}','${urlMap[project.id]}')" ><img class="icon" alt="copy" src="${contextPath}/<spring:theme code="copy"/>" /><span><spring:message code="copy" /></span></a>&nbsp;|</li>
																		<c:set var="isOwner" value="false" />
																		<c:forEach var="owner" items="${project.owners}">
																			<c:if test="${owner.id == user.id}">
																				<c:set var="isOwner" value="true" />
																			</c:if>
																		</c:forEach>
																		<c:if test="${isOwner == 'true'}">
																			<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.restore_tip" />" onclick="archiveProject('<spring:escapeBody javaScriptEscape="true">${project.name}</spring:escapeBody>', ${project.id}, true)"><img class="icon" alt="restore" src="${contextPath}/<spring:theme code="unlock"/>" />
																			<span><spring:message code="teacher.management.projectlibrarydisplay.restore" /></span></a></li>												
																		</c:if>
																	</ul>
																</div>
																<div style="clear:both;"></div>
															</div>
															<div class="projectSummary">
																<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
																<div class="summaryInfo">
																	<div class="basicInfo">
																		<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																		<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																		<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}">${project.metadata.totalTime} | </c:if>
																		<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																		<div style="float:right;">
																			<c:choose>
																				<c:when test="${hasRun && (isChild || isChildNoRoot)}">
																					<span class="runCopy"><spring:message code="teacher.management.projectlibrarydisplay.createdForRun" /> ${projectRunIdMap[project.id]}: <fmt:formatDate value="${projectRunDateMap[project.id]}" type="date" dateStyle="medium" /> </span><img class='tooltip' src="${contextPath}/<spring:theme code="helpicon"/>" title="<spring:message code="teacher.management.projectlibrarydisplay.help_runCopy" />" data-tooltip-anchor="left" data-tooltip-class="info" data-tooltip-event="click" data-tooltip-title="<spring:message code="teacher.management.projectlibrarydisplay.help_runCopy_title" />" alt="help" />
																				</c:when>
																				<c:otherwise>
																					<spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" />
																				</c:otherwise>
																			</c:choose>
																		</div>
																	</div>
																	<div data-id="${project.id}" class="summaryText">
																	<c:if test="${project.metadata.summary != null && project.metadata.summary != ''}">
																		<c:choose>
																			<c:when test="${(fn:length(project.metadata.summary) > 170) && !isChild}">
																				<c:set var="length" value="${fn:length(project.metadata.summary)}" />
																				<c:set var="summary" value="${fn:substring(project.metadata.summary,0,170)}" />
																				<c:set var="truncated" value="${fn:substring(project.metadata.summary,170,length)}" />
																				<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${summary}<span class="ellipsis">...</span><span class="truncated">${truncated}</span>
																			</c:when>
																			<c:otherwise>
																				<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${project.metadata.summary}
																			</c:otherwise>
																		</c:choose>
																	</c:if>
																	</div>
																	<div class="details" data-id="${project.id}">
																		<c:if test="${project.metadata.keywords != null && project.metadata.keywords != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tags" /></span> ${project.metadata.keywords}</p></c:if>
																		<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString} (<a href="${contextPath}/pages/check.html" target="_blank"><spring:message code="teacher.projects.projectinfo.checkCompatibility" /></a>)</p></c:if>
																		<c:if test="${project.metadata.compTime != null && project.metadata.compTime != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_compTime" /></span> ${project.metadata.compTime}</p></c:if>
																		<p><span style="font-weight:bold;"><spring:message code="teacher.management.projectlibrarydisplay.projectContact" /></span> <a href="${contextPath}/contact/contactwiseproject.html?projectId=${project.id}"><spring:message code="contact_wise" /></a></p>
																		<c:set var="lastEdited" value="${project.metadata.lastEdited}" />
																		<c:if test="${lastEdited == null || lastEdited == ''}">
																			<c:set var="lastEdited" value="${project.dateCreated}" />
																		</c:if>
																		<p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_lastUpdated" /></span> <fmt:formatDate value="${lastEdited}" type="both" dateStyle="medium" timeStyle="short" /></p>
																		<c:if test="${project.parentProjectId != null}">
																			<p><span style="font-weight:bold"><spring:message code="teacher.projects.projectinfo.copyLabel"/></span> <a data-id="${project.parentProjectId}" class="projectDetail" title="Project Details">${project.parentProjectId}</a></p>
																		</c:if>
																		<c:if test="${(project.metadata.lessonPlan != null && project.metadata.lessonPlan != '') ||
																			(project.metadata.standards != null && project.metadata.standards != '')}">
																			<div class="viewLesson"><a class="viewLesson" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards_tip" />"><spring:message code="teacher.projects.projectinfo.tipsAndStandards" /></a></div>
																			<div class="lessonPlan" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards" />">
																				<div class="panelHeader">${project.name} (<spring:message code="id_label" /> ${project.id})
																					<span style="float:right;"><a class="printLesson" data-id="${project.id}"><spring:message code="print" /></a></span>
																				</div>
																				<c:if test="${project.metadata.lessonPlan != null && project.metadata.lessonPlan != ''}">
																					<div class="basicInfo sectionContent">
																						<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																						<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																						<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}"><spring:message code="teacher.projects.projectinfo.meta_duration" /> ${project.metadata.totalTime} | </c:if>
																						<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																						<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString}</p></c:if>
																					</div>
																					<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_tips" /></div>
																					<div class="sectionContent">${project.metadata.lessonPlan}</div>
																				</c:if>
																				<c:if test="${project.metadata.standards != null && project.metadata.standards != ''}">
																					<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_standards" /></div>
																					<div class="sectionContent">${project.metadata.standards}</div>
																				</c:if>
																			</div>
																		</c:if>
																		<c:if test="${fn:length(project.sharedowners) > 0}">
																			<div class="sharedIcon">
																				<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" />
																				<spring:message code="teacher.management.projectlibrarydisplay.sharedWith" /> 
																				<span style="font-weight:normal"><c:forEach var="sharedowner" items="${project.sharedowners}" varStatus="status">
																				  <c:out value="${sharedowner.userDetails.firstname}"/>
																				  <c:out value="${sharedowner.userDetails.lastname}"/>${not status.last ? ', ' : ''}
																				</c:forEach></span>
																			</div>
																		</c:if>
																	</div>
																</div>
															</div>
															<div style="clear:both;"></div>
															<div class="detailsLinks">
																<div style="float:right; text-align:right">
																	<a data-id="${project.id}" class="detailsToggle"><spring:message code="teacher.management.projectlibrarydisplay.detailsShow" /></a>
																</div>
																<div style="clear:both;"></div>
															</div>
														</div>
													</div>
												</td>
												<td style="display:none;">
													<c:choose>
														<c:when test="${isChildNoRoot}">
															${project.parentProjectId}
														</c:when>
														<c:otherwise>
															${project.rootProjectId}
														</c:otherwise>
													</c:choose>
												</td>
												<td style="display:none;">owned</td>
												<td style="display:none;">${project.metadata.subject}</td>
												<td style="display:none;">${project.metadata.gradeRange}</td>
												<td style="display:none;">${project.metadata.totalTime}</td>
												<td style="display:none;">${project.metadata.compTime}</td>
												<td style="display:none;">${project.metadata.language}</td>
												<td style="display:none;">${project.dateCreated}</td>
												<td style="display:none;">${bookmarked}</td>
												<c:set var="root" value="0" />
												<c:if test="${project.rootProjectId == project.id}">
													<c:set var="root" value="1" />
												</c:if>
												<td style="display:none;">${root}</td>
												<c:set var="isLibraryFamily" value="0" />
												<c:set var="libraryFamilyName" value="" />
												<c:set var="libraryFamilyId" value="" />
												<c:forEach var="libraryProject" items="${libraryProjectsList}">
													<c:if test="${project.rootProjectId == libraryProject.id}">
														<c:set var="isLibraryFamily" value="1" />
														<c:set var="libraryFamilyName" value="${libraryProject.name}" />
														<c:set var="libraryFamilyId" value="${libraryProject.id}" />
													</c:if>
												</c:forEach>
												<td style="display:none;">${isLibraryFamily}</td>
												<td style="display:none;">${libraryFamilyName}</td>
												<td style="display:none;">${libraryFamilyId}</td>
												<td style="display:none;">${lastEdited}</td>
											</tr>
										</c:if>
									</c:forEach>
								</c:when>
							</c:choose>
							<!-- shared projects -->
							<c:choose>
								<c:when test="${fn:length(sharedProjectsList) > 0}">
									<c:forEach var="project" items="${sharedProjectsList}">
										<c:if test="${project.deleted == 'true'}">
											<c:set var="projectName" value="${projectNameMap[project.id]}" />
											<c:set var="projectNameEscaped" value="${projectNameEscapedMap[project.id]}" />
											<c:set var="hasRun" value="false" />
											<c:forEach var="entry" items="${projectRunDateMap}">
												<c:if test="${entry.getKey() == project.id}">
													<c:set var="hasRun" value="true" />
												</c:if>
											</c:forEach>
											<tr class="projectRow"  data-id="${project.id}">
												<td>
													<c:set var="projectClass" value="projectBox shared" />
													<c:set var="isChildNoRoot" value="false" />
													<c:set var="isChild" value="false" />
													<c:choose>
														<c:when test="${project.rootProjectId == project.id}">
															<c:set var="projectClass" value="projectBox shared rootProject" />
														</c:when>
														<c:otherwise>
															<c:forEach var="item" items="${projectIds}">
															  <c:if test="${item eq project.rootProjectId}">
															    <c:set var="rootId" value="${project.rootProjectId}" />
															    <c:set var="projectClass" value="projectBox shared childProject" />
															    <c:set var="isChild" value="true" />
															  </c:if>
															</c:forEach>
															<c:if test="${!isChild}">
																<c:forEach var="item" items="${projectIds}">
																  <c:if test="${item eq project.parentProjectId}">
																  	<c:set var="projectClass" value="projectBox shared childProject" />
																    <c:set var="rootId" value="${project.parentProjectId}" />
																    <c:set var="isChildNoRoot" value="true" />
																  </c:if>
																</c:forEach>
															</c:if>
														</c:otherwise>
													</c:choose>
													<c:choose>
														<c:when test="${isChild || isChildNoRoot}">
															<div class="${projectClass}" data-id="${project.id}" data-rootid="${rootId}">
														</c:when>
														<c:otherwise>
															<div class="${projectClass}" data-id="${project.id}">
														</c:otherwise>
													</c:choose>
														<div class="projectOverview">
															<div class="projectHeader">
																<div class="projectInfo">
																	<c:set var="bookmarked" value="false" />
																	<c:forEach var="bookmark" items="${bookmarkedProjectsList}">
																		<c:if test="${bookmark.id == project.id}">
																			<c:set var="bookmarked" value="true" />
																		</c:if>
																	</c:forEach>
																	<a data-id="${project.id}" class="bookmark ${bookmarked} tooltip" title="<spring:message code="toggleFavorite" />"></a>
																	<a class="projectTitle" data-id="${project.id}">${project.name}</a>
																	<span>(<spring:message code="id_label" /> ${project.id})</span>
																</div>
																<div class="projectTools">
																	<c:if test="${isChild || isChildNoRoot}">
																		<c:choose>
																			<c:when test="${hasRun}">
																				<span class="childDate runCopy"><spring:message code="teacher.management.projectlibrarydisplay.createdForRun" /> ${projectRunIdMap[project.id]}: <fmt:formatDate value="${projectRunDateMap[project.id]}" type="date" dateStyle="medium" /></span>
																			</c:when>
																			<c:otherwise>
																				<span class="childDate"><spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" /></span>
																			</c:otherwise>
																		</c:choose>
																	</c:if>
																	<ul class="actions">
																		<li><a class="tooltip" href="<c:url value="/previewproject.html"><c:param name="projectId" value="${project.id}"/></c:url>" title="<spring:message code="preview_tip" />" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" />
																			<span<c:if test="${!isChild && !isChildNoRoot}"> style="font-weight:bold;"</c:if>><spring:message code="preview" /></span></a>&nbsp;|
																		</li>
																		<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.copy_tip" />" onclick="copy('${project.id}','${project.projectType}','${projectNameEscaped}','${filenameMap[project.id]}','${urlMap[project.id]}')" ><img class="icon" alt="copy" src="${contextPath}/<spring:theme code="copy"/>" /><span><spring:message code="copy" /></span></a></li>
																	</ul>
																</div>
																<div style="clear:both;"></div>
															</div>
															<div class="projectSummary">
																<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
																<div class="summaryInfo">
																	<div class="sharedIcon">
																	<c:if test="${fn:length(project.sharedowners) > 0}">
																		<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" />
																		<spring:message code="teacher.management.projectlibrarydisplay.ownedBy" /> 
																		<c:forEach var="projectowner" items="${project.owners}" varStatus="status">
																			<c:out value="${projectowner.userDetails.firstname}" />
												  							<c:out value="${projectowner.userDetails.lastname}" />
																		</c:forEach>
																		<a class="unshare" onclick="unshareFromProject('${project.id}','<spring:escapeBody javaScriptEscape="true">${project.name}</spring:escapeBody>')"><spring:message code="teacher.management.projectlibrarydisplay.unshare" /></a>
																	</c:if>
																	</div>
																	<div class="basicInfo">
																		<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																		<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																		<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}">${project.metadata.totalTime} | </c:if>
																		<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																		<div style="float:right;">
																			<c:choose>
																				<c:when test="${hasRun && (isChild || isChildNoRoot)}">
																					<span class="runCopy"><spring:message code="teacher.management.projectlibrarydisplay.createdForRun" /> ${projectRunIdMap[project.id]}: <fmt:formatDate value="${projectRunDateMap[project.id]}" type="date" dateStyle="medium" /> </span><img class='tooltip' src="${contextPath}/<spring:theme code="helpicon"/>" title="<spring:message code="teacher.management.projectlibrarydisplay.help_runCopy" />" data-tooltip-anchor="left" data-tooltip-class="info" data-tooltip-event="click" data-tooltip-title="<spring:message code="teacher.management.projectlibrarydisplay.help_runCopy_title" />" alt="help" />
																				</c:when>
																				<c:otherwise>
																					<spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" />
																				</c:otherwise>
																			</c:choose>
																		</div>
																	</div>
																	<div data-id="${project.id}" class="summaryText">
																	<c:if test="${project.metadata.summary != null && project.metadata.summary != ''}">
																		<c:choose>
																			<c:when test="${(fn:length(project.metadata.summary) > 170) && !isChild}">
																				<c:set var="length" value="${fn:length(project.metadata.summary)}" />
																				<c:set var="summary" value="${fn:substring(project.metadata.summary,0,170)}" />
																				<c:set var="truncated" value="${fn:substring(project.metadata.summary,170,length)}" />
																				<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${summary}<span class="ellipsis">...</span><span class="truncated">${truncated}</span>
																			</c:when>
																			<c:otherwise>
																				<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${project.metadata.summary}
																			</c:otherwise>
																		</c:choose>
																	</c:if>
																	</div>
																	<div class="details" data-id="${project.id}">
																		<c:if test="${project.metadata.keywords != null && project.metadata.keywords != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tags" /></span> ${project.metadata.keywords}</p></c:if>
																		<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString} (<a href="${contextPath}/pages/check.html" target="_blank"><spring:message code="teacher.projects.projectinfo.checkCompatibility"/></a>)</p></c:if>
																		<c:if test="${project.metadata.compTime != null && project.metadata.compTime != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_compTime" /></span> ${project.metadata.compTime}</p></c:if>
																		<p><span style="font-weight:bold;"><spring:message code="teacher.management.projectlibrarydisplay.projectContact" /></span> <a href="${contextPath}/contact/contactwiseproject.html?projectId=${project.id}"><spring:message code="contact_wise" /></a></p>
																		<c:set var="lastEdited" value="${project.metadata.lastEdited}" />
																		<c:if test="${lastEdited == null || lastEdited == ''}">
																			<c:set var="lastEdited" value="${project.dateCreated}" />
																		</c:if>
																		<p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_lastUpdated" /></span> <fmt:formatDate value="${lastEdited}" type="both" dateStyle="medium" timeStyle="short" /></p>
																		<c:if test="${project.parentProjectId != null}">
																			<p><span style="font-weight:bold"><spring:message code="teacher.projects.projectinfo.copyLabel"/></span> <a data-id="${project.parentProjectId}" class="projectDetail" title="Project Details">${project.parentProjectId}</a></p>
																		</c:if>
																		<c:if test="${(project.metadata.lessonPlan != null && project.metadata.lessonPlan != '') ||
																			(project.metadata.standards != null && project.metadata.standards != '')}">
																			<div class="viewLesson"><a class="viewLesson" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards_tip" />"><spring:message code="teacher.projects.projectinfo.tipsAndStandards" /></a></div>
																			<div class="lessonPlan" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards" />">
																				<div class="panelHeader">${project.name} (<spring:message code="id_label" /> ${project.id})
																					<span style="float:right;"><a class="printLesson" data-id="${project.id}"><spring:message code="print" /></a></span>
																				</div>
																				<c:if test="${project.metadata.lessonPlan != null && project.metadata.lessonPlan != ''}">
																					<div class="basicInfo sectionContent">
																						<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																						<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																						<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}"><spring:message code="teacher.projects.projectinfo.meta_duration" /> ${project.metadata.totalTime} | </c:if>
																						<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																						<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString}</p></c:if>
																					</div>
																					<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_tips" /></div>
																					<div class="sectionContent">${project.metadata.lessonPlan}</div>
																				</c:if>
																				<c:if test="${project.metadata.standards != null && project.metadata.standards != ''}">
																					<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_standards" /></div>
																					<div class="sectionContent">${project.metadata.standards}</div>
																				</c:if>
																			</div>
																		</c:if>
																		<c:if test="${fn:length(project.sharedowners) > 0}">
																			<div class="sharedIcon">
																				<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" />
																				<spring:message code="teacher.management.projectlibrarydisplay.sharedWith" /> 
																				<span style="font-weight:normal"><c:forEach var="sharedowner" items="${project.sharedowners}" varStatus="status">
																				  <c:out value="${sharedowner.userDetails.firstname}"/>
																				  <c:out value="${sharedowner.userDetails.lastname}"/>${not status.last ? ', ' : ''}
																				</c:forEach></span>
																			</div>
																		</c:if>
																	</div>
																</div>
															</div>
															<div style="clear:both;"></div>
															<div class="detailsLinks">
																<div style="float:right; text-align:right">
																	<a data-id="${project.id}" class="detailsToggle"><spring:message code="teacher.management.projectlibrarydisplay.detailsShow" /></a>
																</div>
																<div style="clear:both;"></div>
															</div>
														</div>
													</div>
												</td>
												<td style="display:none;">
													<c:choose>
														<c:when test="${isChildNoRoot}">
															${project.parentProjectId}
														</c:when>
														<c:otherwise>
															${project.rootProjectId}
														</c:otherwise>
													</c:choose>
												</td>
												<td style="display:none;">shared</td>
												<td style="display:none;">${project.metadata.subject}</td>
												<td style="display:none;">${project.metadata.gradeRange}</td>
												<td style="display:none;">${project.metadata.totalTime}</td>
												<td style="display:none;">${project.metadata.compTime}</td>
												<td style="display:none;">${project.metadata.language}</td>
												<td style="display:none;">${project.dateCreated}</td>
												<td style="display:none;">${bookmarked}</td>
												<c:set var="root" value="0" />
												<c:if test="${project.rootProjectId == project.id}">
													<c:set var="root" value="1" />
												</c:if>
												<td style="display:none;">${root}</td>
												<c:set var="isLibraryFamily" value="0" />
												<c:set var="libraryFamilyName" value="" />
												<c:set var="libraryFamilyId" value="" />
												<c:forEach var="libraryProject" items="${libraryProjectsList}">
													<c:if test="${project.rootProjectId == libraryProject.id}">
														<c:set var="isLibraryFamily" value="1" />
														<c:set var="libraryFamilyName" value="${libraryProject.name}" />
														<c:set var="libraryFamilyId" value="${libraryProject.id}" />
													</c:if>
												</c:forEach>
												<td style="display:none;">${isLibraryFamily}</td>
												<td style="display:none;">${libraryFamilyName}</td>
												<td style="display:none;">${libraryFamilyId}</td>
												<td style="display:none;">${lastEdited}</td>
											</tr>
										</c:if>
									</c:forEach>
								</c:when>
							</c:choose>
							
							<c:choose>
								<c:when test="${fn:length(libraryProjectsList) > 0}">
									<c:forEach var="project" items="${libraryProjectsList}">
										<c:if test="${project.deleted == 'true'}">
											<c:set var="projectName" value="${projectNameMap[project.id]}" />
											<c:set var="projectNameEscaped" value="${projectNameEscapedMap[project.id]}" />
											<c:set var="hasRun" value="false" />
											<c:forEach var="entry" items="${projectRunDateMap}">
												<c:if test="${entry.getKey() == project.id}">
													<c:set var="hasRun" value="true" />
												</c:if>
											</c:forEach>
											<tr class="projectRow" data-id="${project.id}">
												<td>
													<c:set var="projectClass" value="projectBox rootProject library" />
													<c:forEach var="item" items="${ownedRemove}">
														<c:if test="${project eq item}">
															<c:set var="projectClass" value="projectBox rootProject library owned" />
														</c:if>
													</c:forEach>
													<c:forEach var="item" items="${sharedRemove}">
														<c:if test="${project eq item}">
															<c:set var="projectClass" value="projectBox rootProject library shared" />
														</c:if>
													</c:forEach>
													<div class="${projectClass}" data-id="${project.id}">
														<div class="projectOverview">
															<div class="projectHeader">
																<div class="projectInfo">
																	<c:set var="bookmarked" value="false" />
																	<c:forEach var="bookmark" items="${bookmarkedProjectsList}">
																		<c:if test="${bookmark.id == project.id}">
																			<c:set var="bookmarked" value="true" />
																		</c:if>
																	</c:forEach>
																	<a data-id="${project.id}" class="bookmark ${bookmarked} tooltip" title="<spring:message code="toggleFavorite" />"></a>
																	<a class="projectTitle" data-id="${project.id}">${project.name}</a>
																	<span>(<spring:message code="id_label" /> ${project.id})</span>
																</div>
																<div class="projectTools">
																	<ul class="actions">
																		<li><a class="tooltip" href="<c:url value="/previewproject.html"><c:param name="projectId" value="${project.id}"/></c:url>" title="<spring:message code="preview_tip" />" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" />
																			<span style="font-weight:bold;"><spring:message code="preview" /></span></a>&nbsp;|
																		</li>
																		<li><a class="tooltip" title="<spring:message code="teacher.management.projectlibrarydisplay.copy_tip" />" onclick="copy('${project.id}','${project.projectType}','${projectNameEscaped}','${filenameMap[project.id]}','${urlMap[project.id]}')" ><img class="icon" alt="copy" src="${contextPath}/<spring:theme code="copy"/>" /><span><spring:message code="copy" /></span></a>&nbsp;|</li>
																		<c:set var="isOwner" value="false" />
																		<c:forEach var="owner" items="${project.owners}">
																			<c:if test="${owner.id == user.id}">
																				<c:set var="isOwner" value="true" />
																			</c:if>
																		</c:forEach>
																		<c:if test="${isOwner == 'true'}">
																			<li><a onclick="archiveProject('<spring:escapeBody javaScriptEscape="true">${project.name}</spring:escapeBody>', ${project.id}, true)"><span><spring:message code="teacher.management.projectlibrarydisplay.restore" /></span></a></li>												
																		</c:if>
																	</ul>
																</div>
															</div>
															<div style="clear:both;"></div>
															<div class="projectSummary">
																<div class="projectThumb" thumbUrl="${projectThumbMap[project.id]}"><img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></div>
																<div class="summaryInfo">
																	<c:if test="${fn:length(project.sharedowners) > 0}">
																		<div class="sharedIcon" style="float:right;">
																			<img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" />
																			<spring:message code="teacher.management.projectlibrarydisplay.ownedBy" /> 
																			<c:forEach var="projectowner" items="${project.owners}" varStatus="status">
																				<c:out value="${projectowner.userDetails.firstname}" />
													  							<c:out value="${projectowner.userDetails.lastname}" />
																			</c:forEach>
																		</div>
																	</c:if>
																	<div class="libraryIcon"><img src="${contextPath}/<spring:theme code="open_book"/>" alt="library project" /> <spring:message code="teacher.management.projectlibrarydisplay.libraryProject" /></div>
																	<div class="basicInfo">
																		<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																		<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																		<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}">${project.metadata.totalTime} | </c:if>
																		<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																		<div style="float:right;">
																			<spring:message code="teacher.management.projectlibrarydisplay.created" /> <fmt:formatDate value="${project.dateCreated}" type="date" dateStyle="medium" />
																		</div>
																	</div>
																	<div data-id="${project.id}" class="summaryText">
																	<c:if test="${project.metadata.summary != null && project.metadata.summary != ''}">
																		<c:choose>
																			<c:when test="${(fn:length(project.metadata.summary) > 170) && (projectClass != 'projectBox childProject')}">
																				<c:set var="length" value="${fn:length(project.metadata.summary)}" />
																				<c:set var="summary" value="${fn:substring(project.metadata.summary,0,170)}" />
																				<c:set var="truncated" value="${fn:substring(project.metadata.summary,170,length)}" />
																				<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${summary}<span class="ellipsis">...</span><span class="truncated">${truncated}</span>
																			</c:when>
																			<c:otherwise>
																				<span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_summary" /></span> ${project.metadata.summary}
																			</c:otherwise>
																		</c:choose>
																	</c:if>
																	</div>
																	<div class="details" data-id="${project.id}">
																		<c:if test="${project.metadata.keywords != null && project.metadata.keywords != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tags" /></span> ${project.metadata.keywords}</p></c:if>
																		<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString} (<a href="${contextPath}/pages/check.html" target="_blank"><spring:message code="teacher.projects.projectinfo.checkCompatibility" /></a>)</p></c:if>
																		<c:if test="${project.metadata.compTime != null && project.metadata.compTime != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_compTime" /></span> ${project.metadata.compTime}</p></c:if>
																		<p><span style="font-weight:bold;"><spring:message code="teacher.management.projectlibrarydisplay.projectContact" /></span> <a href="${contextPath}/contact/contactwiseproject.html?projectId=${project.id}"><spring:message code="contact_wise" /></a></p>
																		<c:set var="lastEdited" value="${project.metadata.lastEdited}" />
																		<c:if test="${lastEdited == null || lastEdited == ''}">
																			<c:set var="lastEdited" value="${project.dateCreated}" />
																		</c:if>
																		<p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_lastUpdated" /></span> <fmt:formatDate value="${lastEdited}" type="both" dateStyle="medium" timeStyle="short" /></p>
																		<c:if test="${(project.metadata.lessonPlan != null && project.metadata.lessonPlan != '') ||
																			(project.metadata.standards != null && project.metadata.standards != '')}">
																			<div class="viewLesson"><a class="viewLesson" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards_tip" />"><spring:message code="teacher.projects.projectinfo.tipsAndStandards" /></a></div>
																			<div class="lessonPlan" data-id="${project.id}" title="<spring:message code="teacher.projects.projectinfo.tipsAndStandards" />">
																				<div class="panelHeader">${project.name} (<spring:message code="id_label" /> ${project.id})
																					<span style="float:right;"><a class="printLesson" data-id="${project.id}"><spring:message code="print" /></a></span>
																				</div>
																				<c:if test="${project.metadata.lessonPlan != null && project.metadata.lessonPlan != ''}">
																					<div class="basicInfo sectionContent">
																						<c:if test="${project.metadata.subject != null && project.metadata.subject != ''}">${project.metadata.subject} | </c:if>
																						<c:if test="${project.metadata.gradeRange != null && project.metadata.gradeRange != ''}"><spring:message code="teacher.projects.projectinfo.meta_grades" /> ${project.metadata.gradeRange} | </c:if>
																						<c:if test="${project.metadata.totalTime != null && project.metadata.totalTime != ''}"><spring:message code="teacher.projects.projectinfo.meta_duration" /> ${project.metadata.totalTime} | </c:if>
																						<c:if test="${project.metadata.language != null && project.metadata.language != ''}">${project.metadata.language}</c:if>
																						<c:if test="${project.metadata.techDetailsString != null && project.metadata.techDetailsString != ''}"><p><span style="font-weight:bold;"><spring:message code="teacher.projects.projectinfo.meta_tech" /></span> ${project.metadata.techDetailsString}</p></c:if>
																					</div>
																					<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_tips" /></div>
																					<div class="sectionContent">${project.metadata.lessonPlan}</div>
																				</c:if>
																				<c:if test="${project.metadata.standards != null && project.metadata.standards != ''}">
																					<div class="sectionHead"><spring:message code="teacher.projects.projectinfo.meta_standards" /></div>
																					<div class="sectionContent">${project.metadata.standards}</div>
																				</c:if>
																			</div>
																	</c:if>
																	</div>
																</div>
															</div>
															<div style="clear:both;"></div>
															<div class="detailsLinks">
																<div style="float:right; text-align:right">
																	<a data-id="${project.id}" class="detailsToggle"><spring:message code="teacher.management.projectlibrarydisplay.detailsShow" /></a>
																</div>
																<div style="clear:both;"></div>
															</div>
														</div>
													</div>
												</td>
												<td style="display:none;">${project.rootProjectId}</td>
												<td style="display:none;">library</td>
												<td style="display:none;">${project.metadata.subject}</td>
												<td style="display:none;">${project.metadata.gradeRange}</td>
												<td style="display:none;">${project.metadata.totalTime}</td>
												<td style="display:none;">${project.metadata.compTime}</td>
												<td style="display:none;">${project.metadata.language}</td>
												<td style="display:none;">${project.dateCreated}</td>
												<td style="display:none;">${bookmarked}</td>
												<td style="display:none;">1</td>
												<td style="display:none;">1</td>
												<td style="display:none;">${project.name}</td>
												<td style="display:none;">${project.id}</td>
												<td style="display:none;">${lastEdited}</td>
											</tr>
										</c:if>
									</c:forEach>
								</c:when>
							</c:choose>
							
						</tbody>
					</table>
				</div>
			</c:when>
			<c:otherwise>
				<p class="info">
					<spring:message code="teacher.management.projectlibrarydisplay.archive_introEmpty"/>
				</p>
			</c:otherwise>
		</c:choose>
	</div>
</div>

<div id="projectDetailDialog" style="overflow:hidden;" class="dialog"></div>
<div id="shareDialog" class="dialog"></div>
<div id="unshareDialog" class="dialog"></div>
<div id="archiveDialog" class="dialog"></div>

<script type="text/javascript" src="${contextPath}/<spring:theme code="tiptip.js"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerydatatables.js"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="datatables.fngetfilterednodes.js"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="facetedfilter.js"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jqueryprintelement.js"/>"></script>

<!-- Page-specific script, TODO: move to external js - will need client-side i18n support -->
<script type="text/javascript">
	// TODO: convert to prototype format/external js (requires js i18n)

	var activeChildren = {}, archivedChildren = {}, // objects to hold all child project divs
		activeRootProjectIds = [], archivedRootProjectIds = [], // arrays to hold root project ids
		totalActiveProjects = 0, totalArchivedProjects = 0, totalProjects = 0, // ints to hold total number of projects in user's library
		otable; // object to hold datatables instances (requires jQuery datatables plugin: http://datatables.net/)
	
	// adds/removes bookmark (favorite) for the specified project. pID=projectID of project to remove bookmark
	function toggleBookmark(pID){
		var bookmarkLink = $('.bookmark[data-id="' + pID + '"]'),
			row = $('.projectRow[data-id="' + pID + '"]'),
			box = $('.projectBow[data-id="' + pID + '"]'),
			checked = bookmarkLink.hasClass('true');
		$.ajax({
			type: 'get',
			url: '${contextPath}/teacher/projects/bookmark.html?projectId=' + pID + '&checked=' + !checked,
			success: function(request){
				var updateString = '',
					updateRow,
					updateColumn = 9;
				if(checked){
					updateString = 'false';
					bookmarkLink.removeClass('true');
					if(box.hasClass('rootProject')){
						row.find('td').eq(9).text('false');
						updateRow = row[0];
					} else {
						var rootId = box.parent().parent().attr('data-id');
						var text = row.find('td').eq(9).text().replace('true','false');
						row.find('td').eq(9).text(text);
						updateRow = row[0];
					}
				} else {
					updateString = 'true';
					bookmarkLink.addClass('true');
					bookmarkLink.removeClass('false');
					if(box.hasClass('rootProject')){
						row.find('td').eq(9).text('true');
						updateRow = row[0];
					} else {
						var rootId = box.parent().parent().attr('data-id');
						var text = row.find('td').eq(9).text().replace('false','true');
						row.find('td').eq(9).text(text);
						updateRow = row[0];
					}
				}
				otable.fnUpdate( updateString, updateRow, updateColumn, false, true );
			},
			error: function(request,error){
				alert('<spring:message code="toggleFavoriteError"/>');
			}
		});
	};

	/**
	 *
	 * @param pId project id
	 * @param type the project type e.g. "LD"
	 * @param name the project name
	 * @param fileName the project file name e.g. "/wise4.project.json"
	 * @param relativeProjectFilePathUrl the relative project file path e.g. "/513/wise4.project.json" 
	 */
	function copy(pID, type, name, fileName, relativeProjectFilePathUrl){
		var $copyDialog = '<div id="copyDialog" class="dialog"><p><spring:message code="teacher.management.projectlibrarydisplay.copy_info" /></p>' +
			'<p><spring:message code="teacher.management.projectlibrarydisplay.copy_confirm" /></p></div>';
		
		var agreed = false;
		$($copyDialog).dialog({
			modal: true,
			title: '<spring:message code="teacher.management.projectlibrarydisplay.copy_title" /> ' + name,
			width: '500',
			closeOnEscape: false,
			beforeclose : function() { return agreed; },
			buttons: [
			    { text: '<spring:message code="cancel" />', class: 'secondary', click: function(){
					agreed = true;
					$(this).dialog('close');
				} },
				{ text: '<spring:message code="ok" />', click: function(){
					var $copyingDialog = '<p><spring:message code="teacher.management.projectlibrarydisplay.copy_processing" /></p>' + 
						'<p><img src="${contextPath}/themes/default/images/rel_interstitial_loading.gif" /></p>';
					$('#copyDialog').css('text-align','center');
					$('#copyDialog').html($copyingDialog);
					$('ui-dialog-titlebar-close',$(this).parent()).hide();
					$('button',$(this).parent()).hide().unbind();
					var escapedName = escape(name);
					if(type=='LD'){
						$.ajax({
							type: 'post',
							url: '${contextPath}/author/authorproject.html',
							data: 'forward=filemanager&projectId=' + pID + '&command=copyProject',
							dataType:'text',
							success: function(response){
								/*
								 * response is the new project folder
								 * e.g.
								 * 513
								 */
								
								/*
								 * get the relative project file path for the new project
								 * e.g.
								 * /513/wise4.project.json
								 */ 
								var projectPath = '/' + response + fileName;
								
								$.ajax({
									type: 'post',
									url: '${contextPath}/author/authorproject.html',
									data: 'command=createProject&parentProjectId='+pID+'&projectPath=' + projectPath + '&projectName=' + escapedName,
									dataType:'text',
									success: function(response){
										var successText = '<p><spring:message code="teacher.management.projectlibrarydisplay.copy_success" /></p><p><spring:message code="teacher.management.projectlibrarydisplay.copy_click" /></p>';
										processCopyResult(this,successText,true);
									},
									error: function(response){
										var failureText = '<spring:message code="teacher.management.projectlibrarydisplay.copy_failure" />';
										processCopyResult(this,failureText,false);
									},
									context: this
								});								
							},
							error: function(response){
								var failureText = '<p><spring:message code="teacher.management.projectlibrarydisplay.copy_error" /></p><p><spring:message code="teacher.management.projectlibrarydisplay.copy_please" /></p>';
								processCopyResult(this,failureText,false);
							},
							context: this
						});
					} else {
						$.ajax({
							type: 'get',
							url: 'copyproject.html?projectId=' + pID,
							success: function(response){//alert(o.responseText);
								var successText = '<p><spring:message code="teacher.management.projectlibrarydisplay.copy_success" /></p><p><spring:message code="teacher.management.projectlibrarydisplay.copy_click" /></p>';
								processCopyResult(this,successText,true);
							},
							error: function(response){
								var failureText = '<p><spring:message code="teacher.management.projectlibrarydisplay.copy_error" /></p><p><spring:message code="teacher.management.projectlibrarydisplay.copy_please" /></p>';
								processCopyResult(this,failureText,false);
							}
						});
					}
				} }
			]
		});
		
		function processCopyResult(item,message,success){
			$('#copyDialog').html(message);
			$('.ui-dialog-buttonset button:eq(1)',$('#copyDialog').parent()).show().click(function(){
				agreed = true;
				$(item).dialog('close');
				if(success){
					$("html, body").animate({ scrollTop: 0 }, "1");
					window.location.reload(); // TODO: modify this so that the reloaded library scrolls to the copied project and expands it
				}
			});
		};
	};

	/**
	 * Load thumbnails for each project by looking for curriculum_folder/assets/project_thumb.png (makes an ajax GET request)
	 * @method loadProjectThumbnails
	 * @returns void
	 */
	function loadProjectThumbnails() {		
		$(".projectThumb").each(function() {
			var thumbUrl = $(this).attr("thumbUrl");
			// check if thumbUrl exists
			$.ajax({
				url:thumbUrl,
				context:this,
				statusCode: {
					200:function() {
			  		    // If found (returns 200 status), replace the default image with the fetched image
						$(this).html("<img src='"+$(this).attr("thumbUrl")+"' alt='thumb'></img>");
					},
					404:function() {
					    // If not found (returns 400 status), do nothing (use the default image)
						//$(this).html("<img src='${contextPath}/<spring:theme code="project_thumb"/>' alt='thumb'></img>");
					}
				}
			});
		});
	};
	
	function getRootId(id){
		var rootBox = $('.projectBox[data-id="' + id + '"]');
		var newId = rootBox.attr('data-rootid');
		if(rootBox.hasClass('childProject') && newId){
    	  	return getRootId(newId);
       	} else {
       		return id;
       	}
	};
	
	$(document).ready(function() {
		
		totalActiveProjects = $('#activeProjects div.projectBox').length;
		totalArchivedProjects = $('#archivedProjects div.projectBox').length;
		
		$('.runBox').each(function(){
			var target = $(this).parent(),
				context = target.attr('id') == 'activeProjects' ? 'active' : 'archived',
				rootIds = context == 'active' ? activeRootProjectIds : archivedRootProjectIds,
				children = context == 'active' ? activeChildren : archivedChildren,
				tableBody = $('.projectTable > tbody',target);
			
			var missingRootIds = [];
			
			// resolve child projects that have roots set that are also children
			$("div.childProject",target).each(function(){
				var rootId = $(this).attr('data-rootid'),
					newRootId = getRootId(rootId);
				$(this).attr('data-rootid',newRootId);
				
				if($('.projectBox[data-id="' + newRootId + '"]',target).length==0){
					$(this).addClass('missingRoot');
					if($.inArray(newRootId,missingRootIds)<0){
						missingRootIds.push(newRootId);
					}
					//if($('.projectBox[data-id="' + newRootId + '"]').length){
						// if root project does not exist in this table but does in other table, add dummy copy of root project
						//var cloneTr = $('.projectBox[data-id="' + newRootId + '"]').parent().parent().clone();
						//$('.projectBox',cloneTr).addClass('dummy');
						//$('.projectTools, .bookmark',cloneTr).remove();
						//var dummyMsg = context == 'active' ? '[Archived Project]' : '[Active Project]';
						//$('.projectInfo',cloneTr).append('<span class="dummyMsg">' + dummyMsg + '</span>');
						//cloneTr.appendTo(tableBody);
					//} else {
						// if root project does not exist in either table, remove child designation from project and display as root
						//$(this).removeClass('childProject').addClass('rootProject');
						//$('.childDate',$(this)).remove();
					//}
				}
			});
			
			// for all child projects with missing root, set new root to first project in family
			for(var i=0;i<missingRootIds.length;i++){
				var missingChildren = $('div.childProject.missingRoot[data-rootid="' + missingRootIds[i] + '"]',target),
					first = $(missingChildren[missingChildren.length-1]),
					subRootId = first.attr('data-id');
				first.show().removeClass('childProject').addClass('rootProject');
				first.find('.childDate').remove();
				missingChildren.each(function(){
					if($(this).attr('data-id')!=subRootId){
						$(this).attr('data-rootid',subRootId);
					}
				});
			}
			
			// Show child link for projects with children
			$("div.projectBox",target).not(".childProject").each(function(){
				var id = $(this).attr('data-id');
				// get all child projects of current project (as projectbox div)
				var projectChildren = $('div[data-rootid="' + id + '"]',target);
				var numChildren = projectChildren.length;
				if(numChildren > 0){
					rootIds.push(id);
					var copyLabel = ' <spring:message code="copy_plural" />';
					if($(this).hasClass('missingRoot')){
						if(numChildren==1){
							copyLabel = ' <spring:message code="teacher.management.projectlibrarydisplay.sibling" />';
						} else {
							copyLabel = ' <spring:message code="teacher.management.projectlibrarydisplay.sibling_plural" />';
						}
					} else {
						if (numChildren == 1) {
							copyLabel = ' <spring:message code="copy" />';
						}
					}
					var $childLink = $('<div style="float:left;"><a data-id="' + id + '" class="childToggle">' + numChildren + copyLabel + ' +</a></div>');
					$(this).find('.detailsLinks').prepend($childLink);
					if($(this).hasClass('missingRoot')){
						$childLink.find('.childToggle').addClass('missingRoot');
					}
					$(this).find('.childToggle').on('click',function(){
						if ($(this).hasClass('expanded')){
							toggleChildren(id,false);
						} else {
							toggleChildren(id,true);
						}
						
					});
					
					// add child divs to global children object
					var key = "children_" + id;
					children[key] = projectChildren;
					
					// add all metadata (used for filtering) from child trs to corresponding root project
					// since child trs are removed from datatables object (and therefore can't be used in default serach/filter),
					// we append child characteristics to root projects so the children will be included in search and filters
					// post-processing of any filters checks all projects in a family for individual matches/non-matches
					for (var i=0; i<numChildren; i++){
						var childid = $(projectChildren[i]).attr('data-id'),
							td = $('.projectRow[data-id="' + + id + '"] > td',target),
							childTd = $('.projectRow[data-id="' + childid + '"] > td',target);
						if($(projectChildren[i]).hasClass('shared')){
							td.eq(2).append(', shared');
						} else if($(projectChildren[i]).hasClass('owned')){
							td.eq(2).append( ', owned');
						}
						if(childTd.eq(9).text().match('true')){
							td.eq(9).append(', true');
						}
						td.eq(3).append(', ' + childTd.eq(3).text());
						td.eq(4).append(', ' + childTd.eq(4).text());
						td.eq(5).append(', ' + childTd.eq(5).text());
						td.eq(7).append(', ' + childTd.eq(7).text());
						
						// remove all child trs from DOM
						$(projectChildren[i]).parent().parent().remove();
					}
				}
			});
			
			// add child project divs back into DOM
			addChildren(rootIds,children,target);
		});
		
		// Set up the bookmark link click action for each project
		$('a.bookmark').on('click',function(){
			var id = $(this).attr('data-id');
			toggleBookmark(id);
		});
		
		// Set up more details toggle click action for each project
		$('.detailsToggle, .projectTitle').on("click",function(){
			var id;
			if($(this).hasClass('detailsToggle')){
				id = $(this).attr('data-id');
			} else if($(this).hasClass('projectTitle')){
				id = $(this).attr('data-id');
			}
			
			if($('.detailsToggle[data-id="' + id + '"]').hasClass('expanded')){
				toggleDetails(id,false);
			} else {
				toggleDetails(id,true);
			}
		});
		
		// Set up view project details click action for each project id link
		$('a.projectDetail').on('click',function(){
			var title = $(this).attr('title');
			var projectId = $(this).attr('data-id');
			var path = "${contextPath}/teacher/projects/projectinfo.html?projectId=" + projectId;
			var div = $('#projectDetailDialog').html('<iframe id="projectIfrm" width="100%" height="100%"></iframe>');
			div.dialog({
				modal: true,
				width: '800',
				height: '400',
				title: title,
				position: 'center',
				close: function(){ $(this).html(''); },
				buttons: [ {
						text: '<spring:message code="close" />', 
						click: function(){ $(this).dialog('close'); }
					}
				]
			});
			$("#projectDetailDialog > #projectIfrm").attr('src',path);
		});
		
		// Set up view lesson plan click action for each project
		$('a.viewLesson').on('click',function(){
			var id = $(this).attr('data-id');
			$('.lessonPlan[data-id="' + id + '"]').dialog({
				width: 800,
				height: 400, // TODO: modify so height is set to 'auto', but if content results in dialog taller than window on load, set height smaller than window
				buttons: [ {
						text: '<spring:message code="close" />', 
						click: function(){ $(this).dialog('close'); }
					}
				]
			});
		});
		
		// Set up print lesson click action for each project
		$('.printLesson').on('click',function(){
			var id = $(this).attr('data-id');
			var printstyle = "${contextPath}/<spring:theme code="teacherrunstylesheet"/>"; // TODO: create print-optimized stylesheet
			$('.lessonPlan[data-id="' + id + '"]').printElement({
				pageTitle:'LessonPlan-WISE4-Project-' + id + '.html',
				overrideElementCSS:[{href:printstyle, media:'print'}] // TODO: create print-optimized stylesheet
			});
		});
		
		// Set up project run dialog
		$('.shareProject').on('click',function(){
			var title = $(this).attr('dialog-title');
			var projectId = $(this).attr('data-id');
			var path = "${contextPath}/teacher/projects/customized/shareproject.html?projectId=" + projectId;
			var div = $('#shareDialog').html('<iframe id="shareIfrm" width="100%" height="100%"></iframe>');
			div.dialog({
				modal: true,
				width: '650',
				height: $(window).height() - 100,
				title: title,
				position: 'center',
				close: function(){ $(this).html('');},
				buttons: [ {
						text: '<spring:message code="close" />', 
						click: function(){ $(this).dialog('close'); }
					}
				]
			});
			$("#shareDialog > #shareIfrm").attr('src',path);
		});
		
		// initialize datatables
		otable = $('.projectTable').dataTable({
			"sPaginationType": "full_numbers",
			"iDisplayLength": 10,
			"aLengthMenu": [[5, 10, 25, -1], [5, 10, 25, "All"]],
			"aaSorting": [ [11,'desc'], [12,'asc'], [8,'desc'] ],
			"oLanguage": {
				"sInfo": "_TOTAL_ <spring:message code="project_plural"/>",
				"sInfoEmpty": "<spring:message code="datatable_info_empty"/>",
				"sInfoFiltered": "<spring:message code="datatable_info_filtered_pre"/> _MAX_ <spring:message code="datatable_info_filtered_post"/>", // (from _MAX_ total)
				"sLengthMenu": "<spring:message code="datatable_lengthLabel"/> _MENU_ <spring:message code="teacher.management.projectlibrarydisplay.projectFamilies"/> <spring:message code="datatable_perPage"/>",
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
			"fnDrawCallback": function ( oSettings ) {
				var filtered = false,
					target = $(this).parent().parent().parent();
				for(iCol = 0; iCol < oSettings.aoPreSearchCols.length; iCol++) {
					if (oSettings.aoPreSearchCols[ iCol ].sSearch != '' && oSettings.aoPreSearchCols[ iCol ].sSearch != null) {
						filtered = true;
					}
				}
				if(filtered){					
					// calculate which projects, including children, are actual matches for current filters (and not just family matches)
					processFilters(oSettings,target);
				} else {
					$('.projectBox',target).removeClass('noMatch');
					// hide all filtered children
					$('.childToggle',target).each(function(){
						var id = $(this).attr('data-id');
						//if($(this).hasClass('missingRoot')){
							//toggleChildren(id,true);
						//} else {
							toggleChildren(id,false);
						//}
						
					});
					updateProjectCounts(filtered,null,target); // update project counts display
				}
				
				// setup all miniTip tooltips
				insertTooltips();
				
				// automatically scroll to top of page
				var targetOffset = $('.projectTable',target).offset().top - 10;
				if ($(window).scrollTop() > targetOffset){
					$('html,body').scrollTop(targetOffset);
				}
				
				//if($(this).is(':visible')){
					$('.projectBox',target).each(function(){setTitleWidth($(this));}); //set project title widths
				//}
				
				// hide all project details
				$('div.projectBox',target).each(function(){
					var id = $(this).attr('data-id');
					toggleDetails(id,false);
				});

				// load project thumbnails
				loadProjectThumbnails();
				
				// TODO: add url params to current page location for each filter/search/sort/pagination/projects per page
			},
			"fnInitComplete":function(){
				// setup tabs
				$( "#projectTabs" ).tabs({ 
					active: 0,
					activate: function(event, ui){
						$('div.projectBox.rootProject',ui.panel).show(); // TODO: not sure why this is necessary for some projects
						
						// set project title widths
						$('div.projectBox',ui.panel).each(function(){setTitleWidth($(this));});
						
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
			"sDom":'<"top"lip>rt<"bottom"ip<"clear">><"clear">'
			//"sDom":'<"top"lip<"clear">>rt<"bottom"ip><"clear">'
		});
		
		// define sort options
		var sortParams = {
			"items": [
				{"label": "<spring:message code="teacher.management.projectlibrarydisplay.public"/>", "columns": [11,12,8], "directions": ["desc","asc","desc"] },
				{"label": "<spring:message code="teacher.management.projectlibrarydisplay.sort_NewOld"/>", "columns": [8], "directions": ["desc"] },
				{"label": "<spring:message code="teacher.management.projectlibrarydisplay.sort_OldNew"/>", "columns": [8], "directions": ["asc"] },
				{"label": "<spring:message code="teacher.management.projectlibrarydisplay.sort_recent"/>", "columns": [14], "directions": ["desc"] },
				{"label": "<spring:message code="teacher.management.projectlibrarydisplay.sort_AZ"/>", "columns": [0], "directions": ["asc"] },
				{"label": "<spring:message code="teacher.management.projectlibrarydisplay.sort_ZA"/>", "columns": [0], "directions": ["desc"] }
			]
		}
		var i;
		for(i=0; i<otable.length; i++){
			otable.dataTableExt.iApiIndex = i;
			var wrapper = otable.fnSettings().nTableWrapper,
				table = otable.fnSettings(),
				id = $(table.oInstance).attr('id');
			
			// Define FacetedFilter options for datatable objects
			var facets = new FacetedFilter( table, {
				"bScroll": false,
				"sClearFilterLabel": "<spring:message code="datatable_ff_filter_clear"/>",
				"sClearSearchLabel": "<spring:message code="datatable_ff_search_clear"/>",
				"sFilterLabel": "<spring:message code="datatable_ff_filter_label"/>",
				"sSearchLabel": "<spring:message code="datatable_ff_search_label"/>",
				"fnCallback": function(){
					$('div.projectBox').each(function(){setTitleWidth($(this));});
				},
				"fnInitCallback": function(){
					setTimeout(function(){$('div.projectBox').each(function(){setTitleWidth($(this));}),1000});
					// TODO: call function that processes any url params and sets specified filters/searches/sort/pagination/projects per page
				},
				"aSearchOpts": [
					{
						"identifier": "keyword", "label": "<spring:message code="datatable_ff_keyword_label"/> ", "column": 0, "maxlength": 50
					}
				 ],
				"aFilterOpts": [
					{
						"identifier": "bookmark", "label": "<spring:message code="teacher.management.projectlibrarydisplay.filter_favorites"/>", "column": 9,
						"options": [
							{"query": "true", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_favorites_star"/>"} // TODO: modify FacetedFilter plugin to only require a query for each filter, use query as display if display option is not set
						]
					},
					{
						"identifier": "source", "label": "<spring:message code="teacher.management.projectlibrarydisplay.filter_source"/>", "column": 2,
						"options": [
							{"query": "library", "display": "<spring:message code="teacher.management.projectlibrarydisplay.public"/>"}, // TODO: modify FacetedFilter plugin to only require a query for each filter, use query as display if display option is not set
							{"query": "owned", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_source_owned"/>"},
							{"query": "shared", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_source_shared"/>"}
						]
					},
					{
						"identifier": "subject", "label": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject"/>", "column": 3,
						"options": [
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_genScience"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_genScience"/>"}, // TODO: modify FacetedFilter plugin to only require a query for each filter, use query as display if display option is not set
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_earthScience"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_earthScience"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_lifeScience"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_lifeScience"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_physicalScience"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_physicalScience"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_biology"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_biology"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_chemistry"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_chemistry"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_physics"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_physics"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_research"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_subject_research"/>"}
						]
					},
					{
						"identifier": "grade", "label": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade"/>", "column": 4,
						"options": [
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_3-5"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_3-5"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_6-8"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_6-8"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_6-12"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_6-12"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_9-12"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_9-12"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_12+"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_grade_12+"/>"}
						]
					},
					{
						"identifier": "duration", "label": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time"/>", "column": 5,
						"options": [
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_2-3h"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_2-3h"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_4-5h"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_4-5h"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_6-7h"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_6-7h"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_8-9h"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_8-9h"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_10-11h"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_10-11h"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_12h+"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_time_12h+"/>"}
						]
					},
					{
						"identifier": "language", "label": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language"/>", "column": 7,
						"options": [
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_chinese"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_chinese"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_dutch"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_dutch"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_english"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_english"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_hebrew"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_hebrew"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_japanese"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_japanese"/>"},
							{"query": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_spanish"/>", "display": "<spring:message code="teacher.management.projectlibrarydisplay.filter_language_spanish"/>"}
						]
					}
				]
			});
			
			// add sort logic
			setSort(i,sortParams,wrapper);
		}
		
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
		
		/**
		 * Setup datatable sorting
		 * @method setSort
		 * @param {integer} index iApiIndex of datatables object
		 * @param {object} sortParams Sort settings object
		 * @param {object} wrapper Dom element of datatables wrapper
		 * @returns void
		 */
		function setSort(index,sortParams,wrapper) {
			if(sortParams.items.length){
				// insert sort options into DOM
				var sortHtml = '<div class="dataTables_sort"><spring:message code="datatable_sort"/> <select id="' + 'datatablesSort_' + index + '"  size="1">';
				$.each(sortParams.items,function(){
					sortHtml += '<option>' + this.label + '</option>';
				});
				sortHtml +=	'</select></div>';
				$(wrapper).children('.top').prepend(sortHtml);
				
				$('#datatablesSort_' + index).change(function(){
					$.fn.dataTableExt.iApiIndex = index;
					var i = $('option:selected', '#datatablesSort_' + index).index();
					var sortOptions = [];
					for(var a=0;a<sortParams.items[i].columns.length;a++){
						sortOptions.push([sortParams.items[i].columns[a],sortParams.items[i].directions[a]]);
					}
					otable.fnSort( sortOptions );
				});
			}
		};
		
		/**
		 * Show or hide list of child projects for a root project
		 * @method toggleChildren
		 * @param {string} id Root project's projectId
		 * @param {boolean} open Boolean to specify whether children should be shown (optional) 
		 * @returns void
		 */
		function toggleChildren(id,open){
			if (typeof open == 'undefined'){
				open = false;
			}
			var childToggle = $('.childToggle[data-id="' + id + '"]'),
				box = $('.projectBox[data-id="' + id + '"]'),
				text = childToggle.text();
			if(open){
				childToggle.addClass('expanded');
				$('div[data-rootid="' + id + '"]').slideDown('fast');
				$('div.projectBox').each(function(){setTitleWidth($(this));}); //set project title widths
				text = text.replace('+','-');
				childToggle.text(text);
			} else {
				childToggle.removeClass('expanded');
				if(box.is(":hidden")) {
					$('div[data-rootid="' + id + '"]').hide();
				} else {
					$('div[data-rootid="' + id + '"]').slideUp("fast");
				}
				text = text.replace('-','+');
				childToggle.text(text);
			}
		};
		
		/**
		 * Add child projects back into DOM as appended divs (not trs - to preserve datatables paging)
		 * @method addChildren
		 * @param rootIds
		 * @param children
		 * @param target
		 * @returns void
		 */
		function addChildren(rootIds,children,target){
			for (var i=0; i<rootIds.length; i++){
				var id = rootIds[i];
				var parent = $('.projectBox[data-id="' + id + '"]',target);
				var key = "children_" + id;
				for (var a=0; a<children[key].length; a++){
					parent.after($(children[key][a]));
				}
			}
		};
		
		/**
		 * Dynamically set width of project title depending on which tool links are active for the project
		 * @method setTitleWidth
		 * @param {object} projectDiv jQuery DOM element of target project
		 * @returns void
		 */
		function setTitleWidth(projectDiv){
			var toolWidth = projectDiv.find('.projectTools').width();
			var titleWidth = projectDiv.find('.projectHeader').width() - toolWidth - 10;
			projectDiv.find('.projectInfo').width(titleWidth);
		}
		
		/**
		 * Show or hide detailed info for a project
		 * @method toggleDetails
		 * @param {string} id Target project's projectId
		 * @param {boolean} open Boolean to specify whether details should be shown or hidden (optional)
		 * @returns void
		 */
		function toggleDetails(id,open){
			if (typeof open == 'undefined'){
				open = false;
			}
			var box = $('.projectBox[data-id="' + id + '"]'),
				summary = $('.summaryText[data-id="' + id + '"]'),
				detailsToggle = $('.detailsToggle[data-id="' + id + '"]'),
				details = $('.details[data-id="' + id + '"]');
			if (open){
				if(box.hasClass('childProject')){
					box.find('.childDate').hide();
					box.find('ul.actions').show(0,function(){
						setTitleWidth(box);
					});
					box.find('.projectSummary').slideDown('fast');
					box.find('.detailsLinks').slideDown('fast');
				} else {
					summary.find('.ellipsis').remove();
					summary.find('.truncated').slideDown('fast');
					summary.find('.truncated').css('display','inline');
				}
				detailsToggle.addClass('expanded').text('<spring:message code="teacher.management.projectlibrarydisplay.detailsHide" />');
				details.slideDown('fast');
			} else {
				if(box.hasClass('childProject')){
					box.find('ul.actions').hide();
					box.find('.childDate').show(0,function(){
						setTitleWidth(box);
					});
					if(box.is(":hidden")) {
						box.find('.projectSummary').hide();
						box.find('.detailsLinks').hide();
					} else {
						box.find('.projectSummary').slideUp('fast');
						box.find('.detailsLinks').slideUp('fast');
					}
				} else {
					if(summary.find('span.ellipsis').length == 0){
						summary.find('.truncated').before('<span class="ellipsis">...</span>');	
					}
					if(box.is(":hidden")) {
						summary.find('.truncated').hide();
					} else {
						summary.find('.truncated').slideUp('fast');
					}
				}
				if(box.is(":hidden")) {
					details.hide();
				} else {
					details.slideUp('fast');
				}
				detailsToggle.removeClass('expanded').text('<spring:message code="teacher.management.projectlibrarydisplay.detailsShow" />');
			}
		};
		
		/**
		 * Gray out project parents or children that are not matches for the current filters
		 * @method processFilters
		 * @param {object} oSettings Setting object of datatables instance
		 * @param target jQuery Dom object 
		 * @returns void
		 */
		function processFilters(oSettings,target){
			var oTable = $('.projectTable',target).dataTable();
			$('.projectBox',oTable.fnGetNodes()).removeClass('noMatch');
			
			var searchStrings = [], // array to hold keyword search strings
				filterStrings = [], // array to hold selected faceted filter options (except source)
				sourceStrings = [], // array to hold selected source options
				favoriteOptions = []; // array to hold favorite filter options
			var matchIds = []; // array to hold div ids that match all filters
			
			// populate filter arrays
			for(iCol = 0; iCol < oSettings.aoPreSearchCols.length; iCol++) {
				if (oSettings.aoPreSearchCols[ iCol ].sSearch != '' && oSettings.aoPreSearchCols[ iCol ].sSearch != null) {
					var current = [];
					if(iCol==0){
						current = oSettings.aoPreSearchCols[ iCol ].sSearch.split(/[\s]+/);
						for (var i=0; i<current.length; i++){
							searchStrings.push(current[i]);
						}
					} else if (iCol==2){
						current = oSettings.aoPreSearchCols[ iCol ].sSearch.split('|');
						for (var i=0; i<current.length; i++){
							sourceStrings.push(current[i]);
						}
					} else if (iCol==9){
						current = oSettings.aoPreSearchCols[ iCol ].sSearch;
						favoriteOptions.push(current);
					} else {
						current = oSettings.aoPreSearchCols[ iCol ].sSearch.split('|');
						for (var i=0; i<current.length; i++){
							filterStrings.push(current[i]);
						}
					}
					
				}
			}
			
			// process filter arrays - check whether current filters match each project in filter results
			// gray out divs of non-matches
			$('.projectBox',oTable.fnGetFilteredNodes()).each(function(){
				var searchMatch = true,
					filterMatch = true,
					sourceMatch = true,
					favoriteMatch = true;
				if (searchStrings.length > 0){
					for (var i=0; i<searchStrings.length; i++){
						if($(this).text().match(new RegExp(searchStrings[i], "i"))){
							searchMatch = true;
						} else {
							searchMatch = false;
							break;
						}
					}
				}
				if (searchMatch){
					if (filterStrings.length > 0){
						for (var i=0; i<filterStrings.length; i++){
							if($('.basicInfo', this).text().match(new RegExp(filterStrings[i], "i"))){
								filterMatch = true;
								break;
							} else {
								filterMatch = false;
							}
						}
					}
				}
				if (filterMatch){
					if (sourceStrings.length > 0){
						for (var i=0; i<sourceStrings.length; i++){
							if($(this).hasClass(sourceStrings[i])){
								sourceMatch = true;
								break;
							} else {
								sourceMatch = false;
							}
						}
					}
				}
				if (sourceMatch){
					if (favoriteOptions.length > 0){
						for (var i=0; i<favoriteOptions.length; i++){
							if($('.bookmark',this).hasClass(favoriteOptions[i])){
								favoriteMatch = true;
								break;
							} else {
								favoriteMatch = false;
							}
						}
					}
				}
				if (!filterMatch || !searchMatch || !sourceMatch || !favoriteMatch){
					$(this).addClass('noMatch');
				}
			});
			
			// if at least one child matches in a family, show them
			$('.childToggle',target).each(function(){
				var id = $(this).attr('data-id'),
					match = false,
					children = $('div[data-rootid="' + id + '"]');
				for(var i=0; i<children.length; i++){
					if (!$(children[i]).hasClass('noMatch')){
						match = true;
						break;
					}
				};
				if (match){
					toggleChildren(id,true);
				}
			});
			updateProjectCounts(true,oTable.fnGetFilteredNodes(),target);
		};
		
		/**
		 * Update the jQuery datables instance's info display with correct project count depending on set filters (count all matched projects)
		 * @method updateProjectCounts
		 * @param {boolean} filtered Boolean specifying whether datables instance has been filtered
		 * @param {object} $targets Set of target DOM elements 
		 * @param {DOM element} target jQuery DOM element
		 * @returns void
		 */
		function updateProjectCounts(filtered,$targets,target){
			var $items,
				totalProjects = target.attr('id')=='activeProjects' ? totalActiveProjects : totalArchivedProjects,
				$info = $('.dataTables_info',target);
			if($targets){
				$items = $('.projectBox:not(.noMatch)',$targets);
			} else {
				$items = $('.projectBox:not(.noMatch)',target);
			}
			if(filtered){
				var numResults = $items.length;
				$info.html('<spring:message code="datatable_info_showing"/> ' + 
						numResults + ' <spring:message code="project_plural"/> ' + 
						'<spring:message code="datatable_info_filtered_pre"/> ' +
						totalProjects + ' <spring:message code="datatable_info_filtered_post"/>');
			} else {
				$info.html(totalProjects + ' <spring:message code="project_plural"/>');
			}
		};
		
		// load project thumbnails		
		loadProjectThumbnails();
	});
	
	/**
	 * Archive the project. This won't actually delete the project content,
	 * it will only set a boolean flag in the projects table in the database.
	 */
	function archiveProject(projectTitle, projectId, restore){
		var agreed = false, revive = 'false',
			dialogContent = '<spring:message code="teacher.management.projectlibrarydisplay.archive_confirm" htmlEscape="false" />',
			title = '<spring:message code="teacher.management.projectlibrarydisplay.archive_title" /> ' + projectTitle + ' (<spring:message code="id" />: ' + projectId + ')',
			processing = '<spring:message code="teacher.management.projectlibrarydisplay.archive_processing" />';
		if(restore){
			revive = 'true';
			dialogContent = '<spring:message code="teacher.management.projectlibrarydisplay.restore_confirm" htmlEscape="false" />';
			title = '<spring:message code="teacher.management.projectlibrarydisplay.restore_title" /> ' + projectTitle + ' (<spring:message code="id" />: ' + projectId + ')',
			processing = '<spring:message code="teacher.management.projectlibrarydisplay.restore_processing" />';
		}
		$('#archiveDialog').html(dialogContent).dialog({
			modal: true,
			title: title,
			width: '500',
			closeOnEscape: false,
			beforeclose : function() { return agreed; },
			buttons: [
				{ text: '<spring:message code="cancel" />', class: 'secondary', click: function(){
					agreed = true;
					$(this).dialog('close');
				} },
				{ text: '<spring:message code="ok" />', click: function(){
					var processingHtml = '<p>' + processing + '</p>' + 
						'<p><img src="${contextPath}/themes/default/images/rel_interstitial_loading.gif" /></p>';
					$('#archiveDialog').css('text-align','center');
					$('#archiveDialog').html(processingHtml);
					$('ui-dialog-titlebar-close',$(this).parent()).hide();
					$('button',$(this).parent()).hide().unbind();
					//make the request to archive or restore the project
					$.ajax({
						url:"../../deleteproject.html",
						data:{projectId:projectId,revive:revive},
						success: function(data, text, xml){
							var success = false;
							if(text == 'success') {
								success = true;
								var successMsg = '<spring:message code="teacher.management.projectlibrarydisplay.archive_success" />';
								if(restore){
									successMsg = '<spring:message code="teacher.management.projectlibrarydisplay.restore_success" />';
								}
								// the project was successfully archived or restored, so we will display the success message to the user
								$('#archiveDialog').html('<p>' + successMsg + ' ' + projectTitle + ' (<spring:message code="id" />: ' + projectId + ')</p><p><spring:message code="teacher.management.projectlibrarydisplay.reloadmessage" /></p>');
							} else if(text == 'failure: not owner') {
								//the user is not the owner of the project so the project was not deleted
								restore ? $('#archiveDialog').html('<p><spring:message code="teacher.management.projectlibrarydisplay.restore_failPermission" /></p>') :
									$('#archiveDialog').html('<p><spring:message code="teacher.management.projectlibrarydisplay.archive_failPermission" /></p>');
							} else if(text == 'failure: invalid project id' || text == 'failure: project does not exist') {
								restore ? $('#archiveDialog').html('<p><spring:message code="teacher.management.projectlibrarydisplay.restore_failId" /></p>') :
									$('#archiveDialog').html('<p><spring:message code="teacher.management.projectlibrarydisplay.archive_failId" /></p>');
							} else if(text == 'failure') {
								restore ? $('#archiveDialog').html('<p><spring:message code="teacher.management.projectlibrarydisplay.restore_fail" /></p>') :
									$('#archiveDialog').html('<p><spring:message code="teacher.management.projectlibrarydisplay.archive_fail" /></p>');
							}
							$('button:eq(1)',$('#archiveDialog').parent()).show().click(function(){
								agreed = true;
								$('#archiveDialog').dialog('close');
								if(success){
									$("html, body").animate({ scrollTop: 0 }, "1");
									//refresh the project library page
									// TODO: update library via ajax instead of page reload
									window.location.reload();
								}
							});
						},
						error: function(data, text, xml){
							// an error occured, so we will display an error message to the user
							restore ? $('#archiveDialog').html('<p><spring:message code="teacher.management.projectlibrarydisplay.restore_fail" /></p>') :
								$('#archiveDialog').html('<p><spring:message code="teacher.management.projectlibrarydisplay.archive_fail" /></p>');
							$('button:eq(1)',$('#archiveDialog').parent()).show().click(function(){
								agreed = true;
								$('#archiveDialog').dialog('close');
							});
						}
					});
				} }
			]
		});
	};
	
	function unshareFromProject(projectId,projectTitle) {
		var agreed = false,
			dialogContent = '<spring:message code="teacher.management.projectlibrarydisplay.unshare_confirm" htmlEscape="false" />',
			title = '<spring:message code="teacher.management.projectlibrarydisplay.unshare_title" /> ' + projectTitle + ' (<spring:message code="id" />: ' + projectId + ')',
			processing = '<spring:message code="teacher.management.projectlibrarydisplay.unshare_processing" />';
		$('#unshareDialog').html(dialogContent).dialog({
			modal: true,
			title: title,
			width: '500',
			closeOnEscape: false,
			beforeclose : function() { return agreed; },
			buttons: [
				{ text: '<spring:message code="cancel" />', class: 'secondary', click: function(){
					agreed = true;
					$(this).dialog('close');
				} },
				{ text: '<spring:message code="ok" />', click: function(){
					var processingHtml = '<p>' + processing + '</p>' + 
						'<p><img src="${contextPath}/themes/default/images/rel_interstitial_loading.gif" /></p>';
					$('#unshareDialog').css('text-align','center');
					$('#unshareDialog').html(processingHtml);
					$('ui-dialog-titlebar-close',$(this).parent()).hide();
					$('button',$(this).parent()).hide().unbind();
					//make the request to unshare the project
					$.ajax({
						url:"${contextPath}/teacher/projects/customized/unshareproject.html",
						type:"POST",
						data:{"projectId":projectId},
						success: function(data, text, xml){
							$('#unshareDialog').html("<p><spring:message code='teacher.management.projectlibrarydisplay.unshare_success' /></p><p><spring:message code='teacher.management.projectlibrarydisplay.reloadmessage' /></p>");
							$('button:eq(1)',$('#unshareDialog').parent()).show().click(function(){
								agreed = true;
								$('#unshareDialog').dialog('close');
								$("html, body").animate({ scrollTop: 0 }, "1");
								//refresh the project library page
								// TODO: update library datatable instead of page reload
								window.location.reload();
								//$(".projectRow[data-id='"+projectId+"']")[0].fadeOut($(this).remove());
							});
						},
						error: function(data, text, xml){
							// an error occured, so we will display an error message to the user
							$('#unshareDialog').html('<p><spring:message code="teacher.management.projectlibrarydisplay.unshare_fail" /></p>');
							$('button:eq(1)',$('#unshareDialog').parent()).show().click(function(){
								agreed = true;
								$('#unshareDialog').dialog('close');
							});
						}
					});
				} }
			]
		});
	};
</script>