<%@ include file="include.jsp"%>
<%@ page import="net.tanesha.recaptcha.ReCaptcha" %>
<%@ page import="net.tanesha.recaptcha.ReCaptchaFactory" %>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<meta name="description" content="login for portal"/>
<%@ include file="favicon.jsp"%>
<title><spring:message code="signIn" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />

<script type="text/javascript">
function validateLoginForm() {
	var username=document.getElementById("username").value;
	var password=document.getElementById("password").value;
	if (username==null || username=="" || password==null || password=="") {
	  	window.location="login?failed=true";
	  	return false;
	}
	return true;
}
</script>
<script src='https://www.google.com/recaptcha/api.js'></script>
</head>
<body onload="document.getElementById('username').focus();">

<div id="pageWrapper" style="min-width:550px; background:transparent;">

			<div class="infoContent loginContent">
				<div class="panelHeader"><spring:message code="signIn"/></div>
				<div>
					<form id="home" method="post" action="j_acegi_security_check" onsubmit="return validateLoginForm()" autocomplete="off">
						<div id="signinForm">
							<div class="errorMsgNoBg">
								<c:choose>
                                    <c:when test="${reCaptchaFailed}">
                                        <p><spring:message code="login.recaptcha.incorrect" /></p>
                                    </c:when>
                                    <c:when test="${failed}">
                                        <p><spring:message code="login.failed" /></p>
                                    </c:when>
                                </c:choose>
							</div>
							<div>
								<label for="username"><spring:message code="usernameLabel"/></label><input class="dataBoxStyle" type="text" name="username" id="username" size="18" maxlength="60" <c:if test="${userName != ''}">value="${userName}"</c:if> />
							</div>
							<div>
								<label for="password"><spring:message code="passwordLabel"/></label><input class="dataBoxStyle" type="password" name="password" id="password" size="18" maxlength="30" />
							</div>
							<c:if test="${requireCaptcha && not empty reCaptchaPublicKey && not empty reCaptchaPrivateKey}">
								<div style="width: 60%; margin:0 auto">
								<div class="g-recaptcha" data-sitekey="${reCaptchaPublicKey}"></div>
								</div>
							</c:if>
							<input type='hidden' value='${redirect}' name='redirect'/>
						</div>
						<div>
							<input type="submit" id="signInButton" name="signInButton" class="wisebutton smallbutton" value="<spring:message code="signIn"/>"></input>
						</div>
					</form>
			    	<div id="forgotLogin">
				        <ul id="signInLinkPosition"> <!-- TODO: make these open in top window -->
						    <li><a href="forgotaccount/selectaccounttype" class="forgotlink"><spring:message code="login.forgot"/></a></li>
				       	    <li><a href="join" class="joinlink"><spring:message code="login.createAccount"/></a></li>
				       	    <li><a href="${contextPath}/" class="joinlink"><spring:message code="returnHome"/></a></li>
				        </ul>
			 		</div>
				</div>
			</div>
		</div>
</body>
</html>
