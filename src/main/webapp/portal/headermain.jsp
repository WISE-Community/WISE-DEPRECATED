<div id="header">
	<div class="banner">

		<a id="name" href="${contextPath}/legacy" title="<spring:message code="wiseHomepage" />"></a>

		<sec:authorize access="!hasAnyRole('ROLE_USER')">
			<script type="text/javascript">
				function validateLoginForm() {
					var username = document.getElementById("username").value;
					var password = document.getElementById("password").value;
					if (username == null || username == "" || password == null || password == "") {
						window.location = "login?failed=true";
						return false;
					}
					return true;
				}
			</script>
			<div id="userInfoBlock">
				<form id="home" method="post"
					action="${contextPath}/j_acegi_security_check"
					onsubmit="return validateLoginForm()" autocomplete="off">
					<div id="signinForm">
						<div>
							<label for="username"> <spring:message code="usernameLabel" /></label>
							<input class="dataBoxStyle" type="text" name="username" id="username" size="18" maxlength="60" />
						</div>
						<div>
							<label for="password"><spring:message code="passwordLabel" /></label>
							<input class="dataBoxStyle" type="password" name="password" id="password" size="18" maxlength="30" />
						</div>
					</div>
					<div id="submitSignIn">
						<input type="submit" id="signInButton" name="signInButton" class="wisebutton smallbutton" value="<spring:message code="signIn"/>"></input>
						<div id="forgotLogin">
							<a href="${contextPath}/legacy/forgotaccount/selectaccounttype"><spring:message code="accountmenu.forgot" /></a>
						</div>
					</div>
				</form>
			</div>

			<div id="accountMenu" class="guest">
				<ul class="welcome-menu">
					<li><spring:message code="accountmenu.welcomeNewToWise" /></li>
				</ul>
				<a id="createAccountButton" href="${contextPath}/legacy/join" class="wisebutton signup" title="<spring:message code="accountmenu.createAccountTitle"/>">
					<spring:message code="accountmenu.createAccount" />
				</a>
			</div>
		</sec:authorize>

		<sec:authorize access="hasRole('ROLE_USER')">
			<div id="userInfoBlock" class="userInfo">
                <a id="signOut" class="wisebutton minibutton" href="${contextPath}/logout" title="<spring:message code="signOutTitle"/>"><spring:message code="signOut" /></a>
				<div id="username">
					<c:set var="firstName">
						<sec:authentication property="principal.firstname" htmlEscape="false" />
					</c:set>
					<c:set var="lastName">
						<sec:authentication property="principal.lastname" htmlEscape="false" />
					</c:set>
					<span><spring:message code="accountmenu.welcome" arguments="${firstName},${lastName}" /></span>
				</div>
				<sec:authorize access="!hasAnyRole('ROLE_STUDENT,ROLE_PREVIOUS_ADMINISTRATOR')">
					<div>
						<a href="${contextPath}/legacy/teacher/account"><spring:message code="accountmenu.myAccount" /></a>
					</div>
				</sec:authorize>
				<sec:authorize access="hasRole('ROLE_ADMINISTRATOR')">
					<a id="adminTools" class="wisebutton smallbutton-wide" href="${contextPath}/admin"><spring:message code="accountmenu.admin" /></a>
				</sec:authorize>
				<sec:authorize access="hasRole('ROLE_RESEARCHER')">
					<a id="researchTools" class="wisebutton smallbutton-wide" href="${contextPath}/admin">
						<spring:message code="accountmenu.research" />
					</a>
				</sec:authorize>
				<sec:authorize access="hasRole('ROLE_PREVIOUS_ADMINISTRATOR')">
					<a id="logOutImpersonator" onclick='switchBackToOriginalUser()'>
						<spring:message code="accountmenu.switchBackToOriginalUser" />
					</a>
				</sec:authorize>
				<sec:authorize access="hasRole('ROLE_STUDENT')">
					<a id="researchTools" class="wisebutton smallbutton-wide" href="${contextPath}/legacy/student">
						<spring:message code="accountmenu.student" />
					</a>
				</sec:authorize>
			</div>

			<sec:authorize access="!hasAnyRole('ROLE_STUDENT')">
				<div id="accountMenu">
					<ul class="sf-menu">
							<li class="level1 menu1"><a><spring:message code="accountmenu.help" /></a>
								<ul>
									<li><a href="${contextPath}/legacy/pages/gettingstarted.html"><spring:message code="accountmenu.quickstart" /></a></li>
									<li><a href="${contextPath}/legacy/pages/teacherfaq.html"><spring:message code="accountmenu.faq" /></a></li>
									<c:if test="${discourseSSOLoginURL != null}">
										<li><a target=_blank href="${discourseSSOLoginURL}"><spring:message code="wiseTeacherCommunity" /></a></li>
									</c:if>
									<li><a href="${contextPath}/legacy/contact/contactwise.html"><spring:message code="accountmenu.contact" /></a></li>
								</ul>
							</li>
							<li class="level1 menu2"><a><spring:message code="accountmenu.management" /></a>
								<ul>
									<li><a href="${contextPath}/legacy/teacher/management/library.html"><spring:message code="accountmenu.library" /></a></li>
									<li><a href="${contextPath}/legacy/teacher/management/classroomruns.html"><spring:message code="accountmenu.runs" /></a></li>
									<li><a href="${contextPath}/author"><spring:message code="accountmenu.authoring" /></a></li>
									<li><a href="${contextPath}/author/authorproject.html"><spring:message code="accountmenu.launchLegacyAuthoringTool" /></a></li>
								</ul>
							</li>
							<li class="level1 menu3"><a href="${contextPath}/legacy/teacher"><spring:message code="accountmenu.teacherHome" /></a></li>
					</ul>
				</div>
			</sec:authorize>
			<sec:authorize access="hasRole('ROLE_STUDENT')">
				<div id="accountMenu" class="guest">
					<ul class="welcome-menu">
						<li><spring:message code="accountmenu.welcomeNewToWise" /></li>
					</ul>
					<a id="createAccountButton" href="${contextPath}/legacy/join" class="wisebutton signup" title="<spring:message code="accountmenu.createAccountTitle"/>">
						<spring:message code="accountmenu.createAccount" />
					</a>
				</div>
			</sec:authorize>
		</sec:authorize>

		<script type="text/javascript">
			// initialise menu, set last login time
			$(function() {
				$('ul.sf-menu').superfish({});
			});
		</script>
	</div>
</div>
