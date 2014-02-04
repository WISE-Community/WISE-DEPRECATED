<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html lang="en">
<head>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
    
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerycookiesource"/>"></script>
<!-- <script type="text/javascript" src="<spring:theme code="jqueryuisource"/>"></script>  -->
<script type="text/javascript" src="${contextPath}/<spring:theme code="generalsource"/>"></script>

    
<title><spring:message code="wiseAdmin" /></title>

<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<script type="text/javascript">

	//set unread message count and last login time in session (used in page headers)
	//if(!$.cookie("unreadMessages")){
		//$.cookie("unreadMessages","<c:out value="${fn:length(unreadMessages)}" />");
	//}
	
	//if(!$.cookie("lastLoginTime")){
		<c:choose>
			<c:when test="${userDetails.lastLoginTime == null}">
				var lastLogin = "never";
			</c:when>
			<c:otherwise>
				var lastLogin = "<fmt:formatDate value="${userDetails.lastLoginTime}" type="both" dateStyle="medium" timeStyle="short" />";
			</c:otherwise>
		</c:choose>
		//$.cookie("lastLoginTime",lastLogin);
	//}
</script>

</head>
    
<body>
<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>
	
	<div id="page">
			
		<div id="pageContent">
			
			<div class="contentPanel">
				<div class="panelHeader"><spring:message code='admin.index.wiseAdministratorTools'/></div>
				<div class="panelContent">

					<div class="sectionHead" style="padding-top:0;"><spring:message code='admin.index.userManagement'/></div>
					<div class="sectionContent"> 
						<h5><spring:message code='admin.index.list'/>: <a href="account/manageusers.html?userType=teacher"><spring:message code='admin.index.allTeachers'/></a> | 
								  <a href="account/manageusers.html?userType=student"><spring:message code='admin.index.allStudents'/></a> 
								   <sec:authorize ifAnyGranted="ROLE_ADMINISTRATOR">
								   |
								  <a href="account/manageusers.html?onlyShowLoggedInUser=true"><spring:message code='admin.index.allCurrentlyLoggedInUsers'/></a> |
								  <a href="account/manageusers.html?onlyShowUsersWhoLoggedInToday=true"><spring:message code='admin.index.allUsersWhoLoggedInToday'/></a>
						   	 	  </sec:authorize>
								  
						</h5>
						<h5><spring:message code='admin.index.find'/>: <a href="account/lookupteacher.html"><spring:message code='teacher_cap'/></a> | <a href="account/lookupstudent.html"><spring:message code='student_cap'/></a></h5>
						<h5><a href="account/enabledisableuser.html"><spring:message code='admin.index.enableDisableUser'/></a></h5>
					</div>
						
					<div class="sectionHead"><spring:message code='admin.index.projectRunManagement'/></div>
					<div class="sectionContent">
						<h5><spring:message code='admin.index.listRunsRun'/> (<a href="run/runstats.html?command=today"><spring:message code='today'/></a> | <a href="run/runstats.html?command=week"><spring:message code='thisWeek'/></a> | <a href="run/runstats.html?command=month"><spring:message code='thisMonth'/></a>) | <a href="run/runstats.html?command=activity"><spring:message code='admin.index.runsByActivity'/></a></h5>
					
						<!-- 
						<h5><spring:message code='admin.index.manageProjectRuns'/>: <a href="run/manageallprojectruns.html?q=current"><spring:message code='current'/></a> | 
												 <a href="run/manageallprojectruns.html?q=archived"><spring:message code='archived'/></a>
												 </h5>
												  -->
						<h5><spring:message code='admin.index.findProjectRunsBy'/> 
							<a href="run/findprojectrunsbyteacher.html"><spring:message code='teacher_cap'/></a> | <a href='run/findprojectrunsbyprojectid.html'><spring:message code='project_id'/></a> | <a href='run/findprojectrunsbyrunid.html'><spring:message code='run_id'/></a>
						</h5>
					</div>
					
					
					<sec:authorize ifAnyGranted="ROLE_ADMINISTRATOR">
						<div class="sectionHead"><spring:message code='admin.index.projectManagement'/></div>
						<div class="sectionContent">
							    <spring:message code='admin.index.manageByProjectId'/>: <form action="project/manageallprojects.html" method="GET" style="display:inline"><input type="text" name="projectId" size="5"></input><input type="Submit" value="Go"></input></form><br/>
							<h5><a href="project/manageallprojects.html"><spring:message code='admin.index.manageAllProjects'/></a></h5>
							<h5><a href="project/uploadproject.html"><spring:message code='admin.index.importProject'/></a></h5>
							<h5><a href="project/currentlyAuthoredProjects.html"><spring:message code='admin.index.viewCurrentAuthors'/></a></h5>
						</div>
					</sec:authorize>
					
					<sec:authorize ifAnyGranted="ROLE_ADMINISTRATOR">
						<div class="sectionHead"><spring:message code='admin.index.newsManagement'/></div>
						<div class="sectionContent">
							<h5><a href="news/managenewsitems.html"><spring:message code='admin.index.workWithNewsItems'/></a></h5>
						</div>

						<div class="sectionHead"><spring:message code='admin.index.portalManagement'/></div>
						<div class="sectionContent">
							<h5><a href="statistics.html"><spring:message code='admin.index.statistics'/></a></h5>
							<h5><a href="portal/manageportal.html"><spring:message code='admin.index.configurePortalSettings'/></a></h5>
						</div>
						
					</sec:authorize>
				
				</div>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->
	
	<%@ include file="../footer.jsp"%>
</div>
	
</body>
</html>