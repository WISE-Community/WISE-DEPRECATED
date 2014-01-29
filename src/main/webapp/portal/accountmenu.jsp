<link rel="stylesheet" type="text/css" href="${contextPath}/<spring:theme code="jquerystylesheet"/>">
<link rel="stylesheet" type="text/css" href="${contextPath}/<spring:theme code="superfishstylesheet"/>" media="screen">
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<sec:authorize ifNotGranted="ROLE_USER">
	<div id="userInfoBlock">
		<form id="home" method="post" action="${contextPath}/j_acegi_security_check" autocomplete="off">
			<div id="signinForm">
				<div>
					<label for="username"><spring:message code="usernameLabel" /></label><input class="dataBoxStyle" type="text" name="j_username" id="j_username" size="18" maxlength="60" />
				</div>
				<div>
					<label for="password"><spring:message code="passwordLabel" /></label><input class="dataBoxStyle" type="password" name="j_password" id="j_password" size="18" maxlength="30" />
				</div>
			</div>
			<div id="submitSignIn">
				<input type="submit" id="signInButton" name="signInButton" class="wisebutton smallbutton" value="<spring:message code="signIn"/>"></input>
				<div id="forgotLogin"><a href="${contextPath}/forgotaccount/selectaccounttype.html"><spring:message code="accountmenu.forgot" /></a></div>
			</div>
		</form>
	</div>
	
	<div id="accountMenu" class="guest">
		<ul class="welcome-menu">
			<li><spring:message code="accountmenu.welcomeNewToWise"/></li>
		</ul>
		<a id="createAccountButton" href="${contextPath}/signup.html" class="wisebutton signup" title="<spring:message code="accountmenu.createAccountTitle"/>"><spring:message code="accountmenu.createAccount"/></a>
	</div>
</sec:authorize>

<sec:authorize ifAnyGranted="ROLE_USER">
	<div id="userInfoBlock" class="userInfo">
		<a id="signOut" class="wisebutton minibutton" href="<c:url value="/j_spring_security_logout"/>" title="<spring:message code="signOutTitle"/>"><spring:message code="signOut"/></a>
		<div id="userName">
			<c:set var="firstName"><sec:authentication property="principal.firstname" htmlEscape="false"/></c:set>
			<c:set var="lastName"><sec:authentication property="principal.lastname" htmlEscape="false"/></c:set>
			<span><spring:message code="accountmenu.welcome" arguments="${firstName},${lastName}"/></span>
		</div>
		<div<sec:authorize ifAnyGranted="ROLE_STUDENT"></sec:authorize>>
			<spring:message code="accountmenu.lastVisit" /> <span id="lastLogin"></span>
		</div>
		<sec:authorize ifNotGranted="ROLE_STUDENT">
			<div>
				<a href="${contextPath}/teacher/management/updatemyaccount.html"><spring:message code="accountmenu.myAccount" /></a>
				<!-- <a href="${contextPath}/message.html?action=index" ><spring:message code="accountmenu.messages"/><span id="unreadMsg"></span></a>  -->
			</div>
		</sec:authorize>
		<sec:authorize ifAnyGranted="ROLE_ADMINISTRATOR">
			<a id="adminTools" class="wisebutton smallbutton-wide" href="${contextPath}/admin/index.html" ><spring:message code="accountmenu.admin"/></a>
		</sec:authorize>
		<sec:authorize ifAnyGranted="ROLE_RESEARCHER">
			<a id="researchTools" class="wisebutton smallbutton-wide" href="${contextPath}/admin/index.html" ><spring:message code="accountmenu.research"/></a>
		</sec:authorize>
		<sec:authorize ifAnyGranted="ROLE_STUDENT">
			<a id="researchTools" class="wisebutton smallbutton-wide" href="${contextPath}/student/index.html" ><spring:message code="accountmenu.student"/></a>
		</sec:authorize>
	</div>
	
	<sec:authorize ifNotGranted="ROLE_STUDENT">
		<div id="accountMenu">
			<ul class="sf-menu">
				<sec:authorize ifNotGranted="ROLE_STUDENT">
					<li class="level1 menu1">
						<a><spring:message code="accountmenu.help"/></a> 
						<ul>	
							<li><a href="${contextPath}/pages/gettingstarted.html"><spring:message code="accountmenu.quickstart"/></a></li>
							<li><a href="${contextPath}/pages/teacherfaq.html"><spring:message code="accountmenu.faq"/></a></li>
							<!--  
				            <li><a href="#" style="color:#999;">Search the Help Guide</a></li>
				            -->
				            <li><a href="${contextPath}/contact/contactwisegeneral.html"><spring:message code="accountmenu.contact"/></a></li>
						</ul>
					</li>
					
					<li class="level1 menu2">
						<a><spring:message code="accountmenu.management"/></a>
					    <ul>
				            <li><a href="${contextPath}/teacher/management/library.html"><spring:message code="accountmenu.library"/></a></li>
				            <li><a href="${contextPath}/teacher/management/classroomruns.html"><spring:message code="accountmenu.runs"/></a></li>
							<li><a href="${contextPath}/author/authorproject.html"><spring:message code="accountmenu.authoring"/></a></li>
							<li><a onclick="editPremadeComments()"><spring:message code="accountmenu.editpremadecomments"/></a></li>
				        </ul>
						</li>
					<li class="level1 menu3"><a href="${contextPath}/teacher/index.html" ><spring:message code="accountmenu.teacherHome"/></a></li>
					
				</sec:authorize>
	   	</ul>
	   </div>
	</sec:authorize>
	<sec:authorize ifAnyGranted="ROLE_STUDENT">
		<div id="accountMenu" class="guest">
		<ul class="welcome-menu">
			<li><spring:message code="accountmenu.welcomeNewToWise"/></li>
		</ul>
		<a id="createAccountButton" href="${contextPath}/signup.html" class="wisebutton signup" title="<spring:message code="accountmenu.createAccountTitle"/>"><spring:message code="accountmenu.createAccount"/></a>
	</div>
	</sec:authorize>
</sec:authorize>

<div id="editPremadeCommentsDiv" style="display:none;"></div>
<div id="editPremadeCommentsLoadingDiv" style="display:none;"><h5 style="text-align:center"><spring:message code="accountmenu.loadingPremadeComments"/></h5></div>

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="superfishsource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerycookiesource"/>"></script>

<script type="text/javascript">
	
	//$.cookie("lastLoginTime",lastLogin,{path:"/"});

	// initialise menu, set last login time and unread messages
	$(function(){
		$('ul.sf-menu').superfish({ });
		if($.cookie("unreadMessages") != null && typeof $.cookie("unreadMessages") == "string"){
			var unreadMessages = " (" + $.cookie("unreadMessages") + ")";
			$('#unreadMsg').text(unreadMessages);
		}
		<c:choose>
			<c:when test="${user.userDetails.lastLoginTime == null}">
				var lastLogin = "";
			</c:when>
			<c:otherwise>
				var lastLogin = "<fmt:formatDate value="${user.userDetails.lastLoginTime}" type="both" dateStyle="medium" timeStyle="short" />";
				$.cookie("lastLoginTime",lastLogin, {path:"/"});
			</c:otherwise>
		</c:choose>
		if($.cookie("lastLoginTime") != null && $.cookie("lastLoginTime") != "" && typeof $.cookie("lastLoginTime") == "string"){
			$('#lastLogin').text($.cookie("lastLoginTime"));
		}
	});
	
	/**
	 * the user has clicked "Edit Premade Comments" from the drop down on
	 * the teacher home page.
	 * TODO: move to external js file
	 */
	function editPremadeComments() {

		//create a popup for the loading premade comments message
		$('#editPremadeCommentsLoadingDiv').dialog({
			autoOpen:false
		});
		
		//display the loading premade comments message
		$('#editPremadeCommentsLoadingDiv').dialog('open');
		
		//create a div with an iframe in it so we can load the vle in it
		var div = $('#editPremadeCommentsDiv').html('<iframe id="editPremadeCommentsIfrm" width="100%" height="100%" style="overflow-y:hidden;"></iframe>');
		
		/*
		 * the path to open the authoring tool that will automatically
		 * open the premade comments. this will not display the authoring
		 * tool. we are only loading the authoring tool so that the vle
		 * is loaded and can then open the premade comments editing view.
		 */
		var path = '${contextPath}/author/authorproject.html?editPremadeComments=true';
		
		//set the path to start loading the authoring tool
		$("#editPremadeCommentsIfrm").attr('src',path);
	}
	
	/**
	 * Close the loading premade comments message
	 */
	function closeLoadingPremadeCommentsDialog() {
		$('#editPremadeCommentsLoadingDiv').dialog('close');
	}

</script>