<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="chrome=1" />
    <%@ include file="../favicon.jsp"%>
    <title><spring:message code="wiseAdmin" /></title>

    <link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css" />
    <link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >
    <c:if test="${textDirection == 'rtl' }">
        <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
    </c:if>

    <script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
    <script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>

    <script type="text/javascript">
        function validateForm(type) {
            if (type === 'project') {
                if ("id" === $("#projectLookupType :selected").val()) {
                    if (!$.isNumeric($("#projectLookupValue").val())) {
                        alert("Please enter a numeric Project ID value.");
                        return false;
                    }
                }
            } else if (type === 'run') {
                if ("runId" === $("#runLookupType :selected").val()) {
                    if (!$.isNumeric($("#runLookupValue").val())) {
                        alert("Please enter a numeric Run ID value.");
                        return false;
                    }
                }
            }
            return true;
        }
        // confirm with user before proceeding, as this will take some time
        function mergeProjectMetadata() {
            var result = confirm("This will take some time, depending on the number of projects in your database (~1 second per project). Continue?");
            if (result) {
                window.location.href="${contextPath}/admin/mergeProjectMetadata";
            }
        }

        $(document).ready(function() {
            $.ajax("${contextPath}/admin/latestWISEVersion").success(function(response) {
                if (response === "null") {
                    $("#globalWISEVersion").html("Error retrieving global WISE version.");
                } else {
                    var globalWISEVersion = response;
                    $("#globalWISEVersion").html(globalWISEVersion);
                    var thisWISEVersion = $("#thisWISEVersion").html();
                    if (thisWISEVersion != null && thisWISEVersion != "") {
                        if (thisWISEVersion < globalWISEVersion) {
                            $("#versionNotes").html("<a target=_blank href=\"${updateWISEURL}\">A new version of WISE is available. Please update!</a>");
                        } else {
                            $("#versionNotes").html("WISE is up-to-date. :)");
                        }
                    }
                }
            });
            $.ajax("${contextPath}/admin/recentCommitHistory").success(function(response) {
                if (response === "null" || response === "error") {
                    $("#globalWISEVersion").html("Error retrieving recent commits.");
                } else {
                    var recentCommitHistoryArray = JSON.parse(response);
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
                }
            });
        })
    </script>
</head>
<body>
<div id="pageWrapper">
    <%@ include file="../headermain.jsp"%>
    <div id="page">

        <div id="pageContent">

            <div class="contentPanel">
                <div class="panelHeader">
                    <spring:message code='admin.index.wiseAdministratorTools' /> (${portal.portalName})
                </div>
                <div class="panelContent">

                    <div class="sectionHead" style="padding-top: 0;">
                        <spring:message code='admin.index.userManagement' />
                    </div>
                    <div class="sectionContent">
                        <h5>
                            <sec:authorize access="hasRole('ROLE_ADMINISTRATOR')">
                                <spring:message code='admin.index.list' />
                                <spring:message code='admin.index.allUsersWhoLoggedIn' />
                                <a href="${contextPath}/admin/account/manageusers?onlyShowLoggedInUser=true">
                                    <spring:message code='now' /> (${numCurrentlyLoggedInUsers})</a> |
                                <a href="${contextPath}/admin/account/manageusers?onlyShowUsersWhoLoggedIn=today">
                                    <spring:message code='today' /> (${numUsersWhoLoggedInToday})</a> |
                                <a href="${contextPath}/admin/account/manageusers?onlyShowUsersWhoLoggedIn=thisWeek">
                                    <spring:message code='thisWeek' /></a> |
                                <a href="${contextPath}/admin/account/manageusers?onlyShowUsersWhoLoggedIn=thisMonth">
                                    <spring:message code='thisMonth' /></a> |
                                <a href="${contextPath}/admin/account/manageusers?onlyShowUsersWhoLoggedIn=thisYear">
                                    <spring:message code='thisYear' /></a>
                            </sec:authorize>
                        </h5>
                        <h5>
                            <spring:message code='admin.index.find' />
                            <a href="${contextPath}/admin/account/lookupuser?userType=teacher">
                                <spring:message code='teacher_cap' /></a> |
                            <a href="${contextPath}/admin/account/lookupuser?userType=student">
                                <spring:message code='student_cap' /></a>
                        </h5>
                        <h5>
                            <spring:message code='admin.index.list' />
                            <a href="${contextPath}/admin/account/manageusers?userType=teacher">
                                <spring:message code='admin.index.allTeachers' /></a> |
                            <a href="${contextPath}/admin/account/manageusers?userType=student">
                                <spring:message code='admin.index.allStudents' /></a>

                        </h5>
                        <h5>
                            <a href="${contextPath}/admin/account/enabledisableuser">
                                <spring:message code='admin.index.enableDisableUser' /></a>
                        </h5>
                        <c:if test="${isBatchCreateUserAccountsEnabled}">
                            <h5>
                                <a href="${contextPath}/admin/account/batchcreateuseraccounts.html">
                                    <spring:message code='admin.index.batchCreateUserAccounts' /></a>
                            </h5>
                        </c:if>
                    </div>

                    <div class="sectionHead">
                        <spring:message code='admin.index.projectRunManagement' />
                    </div>
                    <div class="sectionContent">
                        <h5>
                            <spring:message code='admin.index.listRunsRun' />
                            (<a href="${contextPath}/admin/run/stats?period=today"><spring:message code='today' /></a> |
                            <a href="${contextPath}/admin/run/stats?period=week"><spring:message code='thisWeek' /></a> |
                            <a href="${contextPath}/admin/run/stats?period=month"><spring:message code='thisMonth' /></a>) |
                            <a href="${contextPath}/admin/run/stats-by-activity"><spring:message code='admin.index.runsByActivity' /></a>
                        </h5>

                        <h5>
                            <spring:message code='admin.index.findProjectRunsBy' />
                            <form style="display:inline" id="lookupProjectForm" action="${contextPath}/admin/run/manageprojectruns.html" method="GET" onsubmit="return validateForm('run')">
                                <select name="runLookupType" id="runLookupType">
                                    <option value="runId"><spring:message code='run_id' /></option>
                                    <option value="projectId"><spring:message code='project_id' /></option>
                                    <option value="teacherUsername"><spring:message code='student.studentinfo.runTeacherUsername' /></option>
                                    <option value="runTitle"><spring:message code='title' /></option>
                                </select>
                                <input type="text" name="runLookupValue" id="runLookupValue" size="20"></input>
                                <input type="Submit" value="Go"></input>
                            </form>
                        </h5>

                    </div>

                    <div class="sectionHead">
                        <spring:message code='admin.index.projectManagement' />
                    </div>
                    <div class="sectionContent">
                        <spring:message code='admin.index.manageProjectBy' />
                        <form style="display:inline" id="lookupProjectForm" action="${contextPath}/admin/project/manageallprojects.html" method="GET" onsubmit="return validateForm('project')">
                            <select name="projectLookupType" id="projectLookupType">
                                <option value="id"><spring:message code='id' /></option>
                                <option value="title"><spring:message code='title' /></option>
                                <option value="author"><spring:message code='author' /></option>
                            </select>
                            <input type="text" name="projectLookupValue" id="projectLookupValue" size="20"></input>
                            <input type="Submit" value="Go"></input>
                        </form> |
                        <a href="${contextPath}/admin/project/manageallprojects.html">
                            <spring:message code='admin.index.manageAllProjects' /></a>
                        <h5>
                            <a href="${contextPath}/admin/project/currentlyAuthoredProjects">
                                <spring:message code='admin.index.viewCurrentAuthors' /></a>
                        </h5>
                        <h5>
                            <a href="${contextPath}/admin/project/import">
                                <spring:message code='admin.index.importProject' /></a>
                        </h5>
                    </div>

                    <div class="sectionHead">
                        <spring:message code='misc' />
                    </div>
                    <div class="sectionContent">
                        <h5><a href="${contextPath}/admin/run/mergespreadsheets"><spring:message code='admin.index.mergeFiles' /></a>
                            | <a href="${contextPath}/translate"><spring:message code='admin.index.translateWISE' /></a>
                            <sec:authorize access="hasRole('ROLE_ADMINISTRATOR')">
                                | <a href="${contextPath}/admin/run/replacebase64withpng.html"><spring:message code='admin.index.replaceBase64WithPNG' /></a>
                                | <a onclick="mergeProjectMetadata()"><spring:message code='admin.index.mergeProjectMetadata' /></a>
                                | <a href="${contextPath}/admin/project/updatesharedprojects"><spring:message code='admin.index.updateSharedProjectsPermissions' /></a>
                            </sec:authorize>
                        </h5>
                    </div>


                    <sec:authorize access="hasRole('ROLE_ADMINISTRATOR')">
                        <div class="sectionHead">
                            <spring:message code='admin.index.newsManagement' />
                        </div>
                        <div class="sectionContent">
                            <h5>
                                <a href="${contextPath}/admin/news/manage">
                                    <spring:message code='admin.index.workWithNewsItems' /></a>
                            </h5>
                        </div>

                        <div class="sectionHead">
                            <spring:message code='admin.index.wiseManagement' />
                        </div>
                        <div class="sectionContent">
                            <h5>
                                <a href="${contextPath}/admin/portal/manage">
                                    <spring:message code='admin.index.configureWISESettings' /></a>
                            </h5>
                            <h5>
                                <a href="${contextPath}/pages/statistics.html">
                                    <spring:message code='admin.index.statistics' /></a>
                            </h5>
                            <h5>
                                <a href="${contextPath}/admin/memorymonitor.html">
                                    <spring:message code='admin.index.memoryMonitor' /></a>
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
                                    <td class="version-number" id="thisWISEVersion">${thisWISEVersion}</td>
                                    <td class="version-number" id="globalWISEVersion"></td>
                                    <td class="version-notes" id="versionNotes"></td>
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
    <%@ include file="../footer.jsp"%>
</div>
</body>
</html>
