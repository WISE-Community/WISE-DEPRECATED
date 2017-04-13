<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<%@ include file="../favicon.jsp"%>
<title><spring:message code="pages.check.title" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="browserdetectsource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="checkcompatibilitysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="deployJava.js"/>" type="text/javascript"></script>

<style>
table.compatibility {
	width:100%;
}

#browserAdditionalInfo a {
	display:none;
}

.checkCompatibilityWarning {
	font-size:1.0em;
	text-align:left;
	color:red
}

.checkCompatibilityCaution {
	font-size:1.0em;
	text-align:left;
	color:blue
}
</style>
</head>
<body onload='checkCompatibility(${specificRequirements})'>
<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>

	<div id="page">

		<div id="pageContent">

			<div class="contentPanel">
				<div class="panelHeader"><spring:message code="pages.check.header" /></div>
				<div class="panelContent">

					<div class="sectionHead"><spring:message code="pages.check.browser" /></div>
					<div class="sectionContent">
						<div>
							<table class="compatibility">
								<tr>
									<th><spring:message code="pages.check.browser_resource" /></th>
									<th><spring:message code="pages.check.browser_minimumVersion" /></th>
									<th><spring:message code="pages.check.browser_userVersion" /></th>
									<th><spring:message code="pages.check.browser_requirementSatisfied" /></th>
									<th><spring:message code="pages.check.browser_info" /></th>
								</tr>
								<tr>
									<td id='browserResource'></td>
									<td id='browserRequiredVersion'></td>
									<td id='browserYourVersion'></td>
									<td id='browserRequirementSatisfied'></td>
									<td id='browserAdditionalInfo'>
										<a id='upgradeFirefox' href='http://www.mozilla.org/firefox'><spring:message code="pages.check.browser_upgradeFirefox" /></a>
										<a id='upgradeChrome' href='https://www.google.com/chrome/browser/'><spring:message code="pages.check.browser_upgradeChrome" /></a>
										<a id='upgradeSafari' href='http://www.apple.com/safari/'><spring:message code="pages.check.browser_upgradeSafari" /></a>
										<a id='upgradeIE' href='http://windows.microsoft.com/en-US/internet-explorer/download-ie'><spring:message code="pages.check.browser_upgradeIE" /></a>
									</td>
								</tr>
							</table>
						</div>
						<div id='browserFail' style="font-weight:bold; display:none;"><spring:message code="pages.check.browser_result" />: <font color="red"><spring:message code="pages.check.browser_fail" /></font></div>
						<div id='browserPass' style="font-weight:bold; display:none;"><spring:message code="pages.check.browser_result" />: <font color="green"><spring:message code="pages.check.browser_pass" /></font></div>
					</div>

					<div id='projectSpecificRequirementsDiv' style='display:none'>
					<div class="sectionHead"><spring:message code="pages.check.project" /></div>
                    <div class="sectionContent">
                        <div>Project ID: <span id='projectId'></span></div>
                        <div>Project Name: <span id='projectName'></span></div>
                        <div id='projectSpecificRequirementsTable' style='display:none'>
                            <table class="compatibility">
                                <tr>
                                    <th><spring:message code="pages.check.browser_resource" /></th>
                                    <th><spring:message code="pages.check.browser_minimumVersion" /></th>
                                    <th><spring:message code="pages.check.browser_userVersion" /></th>
                                    <th><spring:message code="pages.check.browser_requirementSatisfied" /></th>
                                    <th><spring:message code="pages.check.browser_info" /></th>
                                </tr>
                                <tr id='flashRow' style='display:none'>
                                    <td id='flashResource'><spring:message code="pages.check.browser_flash" /></td>
                                    <td id='flashRequiredVersion'></td>
                                    <td id='flashYourVersion'></td>
                                    <td id='flashRequirementSatisfied'></td>
                                    <td id='flashAdditionalInfo'><a href='http://get.adobe.com/flashplayer/'><spring:message code="pages.check.browser_upgradeFlash" /></a></td>
                                </tr>
                                <tr id='javaRow' style='display:none'>
                                    <td id='javaResource'><spring:message code="pages.check.browser_java" /></td>
                                    <td id='javaRequiredVersion'></td>
                                    <td id='javaYourVersion'></td>
                                    <td id='javaRequirementSatisfied'></td>
                                    <td id='javaAdditionalInfo'><a href='http://www.java.com/download/'><spring:message code="pages.check.browser_upgradeJava" /></a></td>
                                </tr>
                            </table>
                        </div>
                        <div id='projectNoSpecificRequirements' style="font-weight:bold; display:none;"><spring:message code="pages.check.browser_result" />: <font color="green"><spring:message code="pages.check.project_no_specific_requirements" /></font></div>
                        <div id='projectPass' style="font-weight:bold; display:none;"><spring:message code="pages.check.browser_result" />: <font color="green"><spring:message code="pages.check.project_specific_requirements_satisfied" /></font></div>
                        <div id='projectFail' style="font-weight:bold; display:none;"><spring:message code="pages.check.browser_result" />: <font color="red"><spring:message code="pages.check.project_specific_requirements_not_satisfied" /></font></div>
                        <div id='flashMsg' style="font-weight:bold; display:none;"><font color="red"><spring:message code="pages.check.project_specific_requirements_flash_not_satisfied" /></font></div>
                        <div id='javaMsg' style="font-weight:bold; display:none;"><font color="red"><spring:message code="pages.check.project_specific_requirements_java_not_satisfied" /></font></div>
                        <div id='javaMsgUsingChrome' style="font-weight:bold; display:none;"><font color="red"><spring:message code="pages.check.project_specific_requirements_java_not_satisfied_using_chrome" /></font></div>
                        <div><a id='previewProjectLink' href='' target='_blank'><img class="icon" alt="preview" src="${contextPath}/portal/themes/default/images/icons/teal/screen.png"> <spring:message code="pages.check.project_specific_preview_project" /></a> (<spring:message code="pages.check.project_specific_preview_project_message" />)</div>
                    </div>
                    </div>

					<div id='contentFilter' class="sectionHead"><spring:message code="pages.check.browserRecs" /></div>
					<div class="sectionContent">
						<div><spring:message code="pages.check.browserRecs_info" /></div>
						<div>
							<table class="compatibility">
								<tr>
									<th><spring:message code="pages.check.browserRecs_option" /></th>
									<th><spring:message code="pages.check.browserRecs_level" /></th>
									<th><spring:message code="pages.check.browserRecs_download" /></th>
								</tr>
                                <tr>
                                    <td><spring:message code="pages.check.browserRecs_chrome" /></td>
                                    <td><spring:message code="pages.check.browserRecs_strong" /></td>
                                    <td><a href='https://www.google.com/chrome/browser/'>Download Chrome</a></td>
                                </tr>
								<tr>
									<td><spring:message code="pages.check.browserRecs_firefox" /></td>
									<td><spring:message code="pages.check.browserRecs_strong" /></td>
									<td><a href='http://www.mozilla.org/firefox'>Download Firefox</a></td>
								</tr>
								<tr>
									<td><spring:message code="pages.check.browserRecs_safari" /></td>
									<td><spring:message code="pages.check.browserRecs_medium" /></td>
									<td><a href='https://support.apple.com/downloads/safari'>Download Safari</a></td>
								</tr>
                                <tr>
                                    <td><spring:message code="pages.check.browserRecs_edge" /></td>
                                    <td><spring:message code="pages.check.browserRecs_weak" /></td>
                                    <td><a href='https://www.microsoft.com/en-us/windows/microsoft-edge'>Download Edge</a></td>
                                </tr>
								<tr>
									<td><spring:message code="pages.check.browserRecs_ie" /></td>
									<td><spring:message code="pages.check.browserRecs_weak" /></td>
									<td><a href='http://windows.microsoft.com/en-us/internet-explorer/download-ie'>Download Internet Explorer</a></td>
								</tr>
								<tr>
									<td colspan="3"><spring:message code="pages.check.browserRecs_other" /></td>
								</tr>
							</table>
						</div>
					</div>
                    <div id='contentFilter' class="sectionHead" style="padding-top:0;"><spring:message code="pages.check.network" /></div>
                    <div class="sectionContent">
                        <div><spring:message code="pages.check.network_info" /></div>
                        <div id='contentFilterMessageSwf'>
                            <span><spring:message code="pages.check.network_flash" /></span><span id='contentFilterSwfRequirementSatisfied'><spring:message code="pages.check.processing" /></span><br/><br/>
                            <span><spring:message code="pages.check.network_java" /></span><span id='contentFilterJarRequirementSatisfied'><spring:message code="pages.check.processing" /></span>
                        </div>
                    </div>
					<div style="margin-top:1em;"><a href="${contextPath}/pages/schoolIT.html"><spring:message code="pages.check.schoolTech" /></a></div>
				</div>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->

	<%@ include file="../footer.jsp"%>
</div>
</body>
</html>
