<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="wiseAdmin" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" >
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>

<script type="text/javascript">
function validateForm(type) {
	if (type=='project') {
		if ("id" == $("#projectLookupType :selected").val()) {
			// make sure id is numeric
			if (!$.isNumeric($("#projectLookupValue").val())) {
				alert("Please enter a numeric Project ID value.");
				return false;
			}
		}
	} else if (type=='run') {
		if ("runId" == $("#runLookupType :selected").val()) {
			// make sure id is numeric
			if (!$.isNumeric($("#runLookupValue").val())) {
				alert("Please enter a numeric Run ID value.");
				return false;
			}
		}
	}
	return true;
}
</script>
</head>
<body>
	<div id="pageWrapper">
		<%@ include file="../headermain.jsp"%>
		<div id="page">

			<div id="pageContent">

				<div class="contentPanel">
					<div class="panelHeader">
						<spring:message code='admin.index.wiseAdministratorTools' />
					</div>
					<div class="panelContent">

						<div class="sectionHead" style="padding-top: 0;">
							<spring:message code='admin.index.userManagement' />
						</div>
						<div class="sectionContent">
							<h5>
								<spring:message code='admin.index.list' />
								<sec:authorize ifAnyGranted="ROLE_ADMINISTRATOR">
									<spring:message code='admin.index.allUsersWhoLoggedIn' />
									<a href="account/manageusers.html?onlyShowLoggedInUser=true">
										<spring:message code='now' /> (${numCurrentlyLoggedInUsers})</a> | 
								   <a href="account/manageusers.html?onlyShowUsersWhoLoggedIn=today">
										<spring:message code='today' /> (${numUsersWhoLoggedInToday})</a> | 
								   <a href="account/manageusers.html?onlyShowUsersWhoLoggedIn=thisWeek">
								   		<spring:message code='thisWeek' /></a> | 
								   <a href="account/manageusers.html?onlyShowUsersWhoLoggedIn=thisMonth">
								   		<spring:message code='thisMonth' /></a> | 
								   <a href="account/manageusers.html?onlyShowUsersWhoLoggedIn=thisYear">
								   		<spring:message code='thisYear' /></a>
								</sec:authorize>
							</h5>
							<h5>
								<spring:message code='admin.index.list' />
								<a href="account/manageusers.html?userType=teacher"><spring:message
										code='admin.index.allTeachers' /></a> | <a
									href="account/manageusers.html?userType=student"><spring:message
										code='admin.index.allStudents' /></a>

							</h5>
							<h5>
								<spring:message code='admin.index.find' />
								<a href="account/lookupuser.html?userType=teacher"><spring:message
										code='teacher_cap' /></a> | <a
									href="account/lookupuser.html?userType=student"><spring:message
										code='student_cap' /></a>
							</h5>
							<h5>
								<a href="account/enabledisableuser.html"><spring:message
										code='admin.index.enableDisableUser' /></a>
							</h5>
							<c:if test="${isBatchCreateUserAccountsEnabled}">
								<h5>
									<a href="account/batchcreateuseraccounts.html"><spring:message
											code='admin.index.batchCreateUserAccounts' /></a>
								</h5>
							</c:if>
						</div>

						<div class="sectionHead">
							<spring:message code='admin.index.projectRunManagement' />
						</div>
						<div class="sectionContent">
							<h5>
								<spring:message code='admin.index.listRunsRun' />
								(<a href="run/runstats.html?command=today"><spring:message
										code='today' /></a> | <a href="run/runstats.html?command=week"><spring:message
										code='thisWeek' /></a> | <a
									href="run/runstats.html?command=month"><spring:message
										code='thisMonth' /></a>) | <a
									href="run/runstats.html?command=activity"><spring:message
										code='admin.index.runsByActivity' /></a>
							</h5>

							<h5>
								<spring:message code='admin.index.findProjectRunsBy' />
								<form style="display:inline" id="lookupProjectForm" action="run/manageprojectruns.html" method="GET" onsubmit="return validateForm('run')">								
									<select name="runLookupType" id="runLookupType">
										<option value="runId"><spring:message code='run_id' /></option>
										<!-- <option value="projectId"><spring:message code='project_id' /></option> -->
										<option value="teacherUsername"><spring:message code='student.studentinfo.runTeacherUsername' /></option>
									</select>
									<input type="text" name="runLookupValue" id="runLookupValue" size="20"></input>
									<input type="Submit" value="Go"></input>
								</form>		
							</h5>
							
						</div>


						<sec:authorize ifAnyGranted="ROLE_ADMINISTRATOR">
							<div class="sectionHead">
								<spring:message code='admin.index.projectManagement' />
							</div>
							<div class="sectionContent">
								<spring:message code='admin.index.manageProjectBy' />
								<form style="display:inline" id="lookupProjectForm" action="project/manageallprojects.html" method="GET" onsubmit="return validateForm('project')">								
									<select name="projectLookupType" id="projectLookupType">
										<option value="id"><spring:message code='id' /></option>
										<option value="title"><spring:message code='title' /></option>
										<option value="author"><spring:message code='author' /></option>
									</select>
									<input type="text" name="projectLookupValue" id="projectLookupValue" size="20"></input>
									<input type="Submit" value="Go"></input>
								</form>
								<br />
								<h5>
									<a href="project/manageallprojects.html"><spring:message
											code='admin.index.manageAllProjects' /></a>
								</h5>
								<h5>
									<a href="project/importproject.html"><spring:message
											code='admin.index.importProject' /></a>
								</h5>
								<h5>
									<a href="project/currentlyAuthoredProjects.html"><spring:message
											code='admin.index.viewCurrentAuthors' /></a>
								</h5>
							</div>
						</sec:authorize>

						<sec:authorize ifAnyGranted="ROLE_ADMINISTRATOR">
							<div class="sectionHead">
								<spring:message code='admin.index.newsManagement' />
							</div>
							<div class="sectionContent">
								<h5>
									<a href="news/managenewsitems.html"><spring:message
											code='admin.index.workWithNewsItems' /></a>
								</h5>
							</div>

							<div class="sectionHead">
								<spring:message code='admin.index.wiseManagement' />
							</div>
							<div class="sectionContent">
								<h5>
									<a href="portal/manageportal.html"><spring:message
											code='admin.index.configureWISESettings' /></a>
								</h5>
								<h5>
									<a href="${contextPath}/pages/statistics.html"><spring:message
											code='admin.index.statistics' /></a>
								</h5>
								<h5>
									<a href="${contextPath}/admin/memorymonitor.html"><spring:message
											code='admin.index.memoryMonitor' /></a>
								</h5>
								<table class="table table-condensed table-hover">
									<thead style="background-color: antiquewhite">
										<tr>
											<th>&nbsp;</th>
											<th>Installed</th>
											<th>Latest</th>
											<th>&nbsp;</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td class="title">Version</td>
											<td class="version-number">${thisWISEVersion}</td>
											<td class="version-number">${globalWISEVersion}</td>
											<c:choose>
												<c:when test="${wiseUpdateUrl == null}">
													<td class="version-notes">${versionNotes}</td>
												</c:when>
												<c:otherwise>
													<td class="version-notes"><a target=_blank
														href="${wiseUpdateUrl}">${versionNotes}</a></td>
												</c:otherwise>
											</c:choose>
										</tr>
									</tbody>
								</table>

								<div style="font-weight:bold;padding:10px;background-color:antiquewhite;margin:10px 0px 0px 0px"><a href="https://github.com/WISE-Community/WISE">Latest Changes: please update often!</a></div>
								<div style="height:150px; overflow:auto; border: 1px solid lightgray; margin:0">
                                    <div id="recentCommitHistory"></div>
                                </div>								

							</div>

						</sec:authorize>

					</div>
				</div>
			</div>
			<div style="clear: both;"></div>
		</div>
		<!-- End of page-->

		<%@ include file="../footer.jsp"%>
	</div>

<script type="text/javascript">
var recentCommitHistoryArray = ${recentCommitHistoryJSON};
if (recentCommitHistoryArray != null) {
	var commitsUL = $("<ul>");
	for (var i=0; i<recentCommitHistoryArray.length; i++) {
		var commitHistory = recentCommitHistoryArray[i];
		var commitLI = $("<li>").css("margin","0").css("padding","4px 8px");
		var commitA = $("<a>").attr("href",commitHistory.html_url).html(commitHistory.commit.message);
		var commitBy = $("<div>").html("by <span style='font-weight:bold'>" + commitHistory.commit.committer.name + "</span> - " + commitHistory.commit.committer.date);
		commitLI.append(commitA);
		commitLI.append(commitBy);
		commitsUL.append(commitLI);
	}
	$("#recentCommitHistory").html(commitsUL);
}
</script>
</body>
</html>