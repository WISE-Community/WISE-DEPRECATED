<%@ include file="include.jsp"%>
<%@ page import="net.tanesha.recaptcha.ReCaptcha" %>
<%@ page import="net.tanesha.recaptcha.ReCaptchaFactory" %>

<!-- $Id$ -->

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<meta name="description" content="login for portal"/>

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />

<style type="text/css" media="screen">
  .inplaceeditor-saving {background: url(<spring:theme code="wait"/>) bottom right no-repeat; }
</style>

<link rel="shortcut icon" href="<spring:theme code="favicon"/>" />

<title><spring:message code="signIn" /></title>

</head>

<body onload="document.getElementById('j_username').focus();">

<div id="pageWrapper" style="min-width:550px; background:transparent;">
			
			<div class="infoContent loginContent">
				<div class="panelHeader"><spring:message code="signIn"/></div>
				<div>
					<form id="home" method="post" action="j_acegi_security_check" autocomplete="off">
						<div id="signinForm">
							<div class="errorMsgNoBg">
								<c:if test="${failed}">
								  <p><spring:message code="login.failed" /></p>
								</c:if>
							</div>
							<div>
								<label for="username"><spring:message code="usernameLabel"/></label><input class="dataBoxStyle" type="text" name="j_username" id="j_username" size="18" maxlength="60" <c:if test="${userName != ''}">value="${userName}"</c:if> />
							</div>
							<div>
								<label for="password"><spring:message code="passwordLabel"/></label><input class="dataBoxStyle" type="password" name="j_password" id="j_password" size="18" maxlength="30" />
							</div>
							<c:if test="${requireCaptcha && reCaptchaPublicKey != null && reCaptchaPrivateKey != null}">
								<%
									//get the captcha public and private key so we can make the captcha
									String reCaptchaPublicKey = (String) request.getAttribute("reCaptchaPublicKey");
									String reCaptchaPrivateKey = (String) request.getAttribute("reCaptchaPrivateKey");
									
									//create the captcha factory
									ReCaptcha c = ReCaptchaFactory.newReCaptcha(reCaptchaPublicKey, reCaptchaPrivateKey, false);
									
									//make the html that will display the captcha
									String reCaptchaHtml = c.createRecaptchaHtml(null, null);
									
									//output the instructions for the captcha
									out.print("<p><spring:message code='login.recaptcha'/></p>");
									
									//output the captcha html to the page
									out.print(reCaptchaHtml);
								%>
							</c:if>
							<input type='hidden' value='${redirect}' name='redirect'/>
						</div>
						<div>
							<input type="submit" id="signInButton" name="signInButton" class="wisebutton smallbutton" value="<spring:message code="signIn"/>"></input>
						</div>
					</form>
			    	<div id="forgotLogin">   
				        <ul id="signInLinkPosition"> <!-- TODO: make these open in top window -->
				       		<li><a href="forgotaccount/selectaccounttype.html" class="forgotlink"><spring:message code="login.forgot"/></a>  </li>
				       		<li><a href="signup.html" class="joinlink"><spring:message code="login.createAccount"/></a></li>
				       		<li><a href="/webapp/index.html" class="joinlink"><spring:message code="returnHome"/></a></li>
				        </ul>
			 		</div>
				</div>
			</div>
		</div>

</body>
</html>
