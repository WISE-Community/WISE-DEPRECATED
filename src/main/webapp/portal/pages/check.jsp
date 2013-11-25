<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
    
<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="<spring:theme code="jquerycookiesource"/>"></script>
<script type="text/javascript" src="<spring:theme code="utilssource"/>"></script>
<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
<script type="text/javascript" src="<spring:theme code="browserdetectsource"/>"></script>
<script type="text/javascript" src="<spring:theme code="checkcompatibilitysource"/>"></script>
<script type="text/javascript" src="../javascript/tels/deployJava.js"></script>

<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
  
<title><spring:message code="pages.check.title" /></title>

<link rel="shortcut icon" href="./themes/tels/default/images/favicon_panda.ico" /> 

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
									<th><spring:message code="pages.check.browser_status" /></th>
									<th><spring:message code="pages.check.browser_requiredVersion" /></th>
									<th><spring:message code="pages.check.browser_userVersion" /></th>
									<th><spring:message code="pages.check.browser_requirementSatisfied" /></th>
									<th><spring:message code="pages.check.browser_info" /></th>
								</tr>
								<noscript>
								<tr>
									<td><spring:message code="pages.check.browser_javascript" /></td>
									<td><spring:message code="pages.check.required" /></td>
									<td><spring:message code="pages.check.enabled" /></td>
									<td><spring:message code="pages.check.disabled" /></td>
									<td><img src='../themes/tels/default/images/error_16.gif' /></td>
									<td><a href='https://www.google.com/support/adsense/bin/answer.py?answer=12654'><spring:message code="pages.check.browser_howToEnabledJS" /></a></td>
								</tr>
								</noscript>
								<tr>
									<td id='javascriptResource'><spring:message code="pages.check.browser_javascript" /></td>
									<td id='javascriptStatus'><spring:message code="pages.check.required" /></td>
									<td id='javascriptRequiredVersion'><spring:message code="pages.check.enabled" /></td>
									<td id='javascriptYourVersion'>
										<span id="jsEnabled" style="display:none;"><spring:message code="pages.check.enabled" /></span>
										<noscript>
											<span><spring:message code="pages.check.disabled" /></span>
										</noscript>
									</td>
									<td id='javascriptRequirementSatisfied'></td>
									<td id='javascriptAdditionalInfo'><a href='https://www.google.com/support/adsense/bin/answer.py?answer=12654'><spring:message code="pages.check.browser_howToEnabledJS" /></a></td>
								</tr>
								<tr>
									<td id='browserResource'></td>
									<td id='browserStatus'><spring:message code="pages.check.required" /></td>
									<td id='browserRequiredVersion'></td>
									<td id='browserYourVersion'></td>
									<td id='browserRequirementSatisfied'></td>
									<td id='browserAdditionalInfo'>
										<a id='upgradeFirefox' href='http://www.mozilla.org/firefox'><spring:message code="pages.check.browser_upgradeFirefox" /></a>
										<a id='upgradeChrome' href='http://www.google.com/chrome'><spring:message code="pages.check.browser_upgradeChrome" /></a>
										<a id='upgradeSafari' href='http://www.apple.com/safari/'><spring:message code="pages.check.browser_upgradeSafari" /></a>
										<a id='upgradeIE' href='http://windows.microsoft.com/en-US/internet-explorer/download-ie'><spring:message code="pages.check.browser_upgradeIE" /></a>
									</td>
								</tr>
								<tr>
									<td id='quickTimeResource'><spring:message code="pages.check.browser_qt" /></td>
									<td id='quickTimeStatus'><spring:message code="pages.check.recommended" /></td>
									<td id='quickTimeRequiredVersion'></td>
									<td id='quickTimeYourVersion'></td>
									<td id='quickTimeRequirementSatisfied'></td>
									<td id='quickTimeAdditionalInfo'><a href='http://www.apple.com/quicktime/download/'><spring:message code="pages.check.browser_upgradeQT" /></a></td>
								</tr>
								<tr>
									<td id='flashResource'><spring:message code="pages.check.browser_flash" /></td>
									<td id='flashStatus'><spring:message code="pages.check.recommended" /></td>
									<td id='flashRequiredVersion'></td>
									<td id='flashYourVersion'></td>
									<td id='flashRequirementSatisfied'></td>
									<td id='flashAdditionalInfo'><a href='http://get.adobe.com/flashplayer/'><spring:message code="pages.check.browser_upgradeFlash" /></a></td>
								</tr>
								<tr>
									<td id='javaResource'><spring:message code="pages.check.browser_java" /></td>
									<td id='javaStatus'><spring:message code="pages.check.recommended" /></td>
									<td id='javaRequiredVersion'></td>
									<td id='javaYourVersion'></td>
									<td id='javaRequirementSatisfied'></td>
									<td id='javaAdditionalInfo'><a href='http://www.java.com/download/'><spring:message code="pages.check.browser_upgradeJava" /></a></td>
								</tr>
							</table>
						</div>
						<noscript>
						<div class='checkCompatibilityWarning'><spring:message code="pages.check.browser_jsDisabled" /></div>
						</noscript>
						<div id='browserFail' style="font-weight:bold; display:none;"><spring:message code="pages.check.browser_fail" /></div>
						<div id='browserPass' style="font-weight:bold; display:none;"><spring:message code="pages.check.browser_pass" /></div>
						<div id='compatibilityCheckMessages'>
							<p id='browserFailMsg' class='checkCompatibilityWarning'><spring:message code="pages.check.browser_oldWarning" /></p>
							<p id='browserFailMsgUnsupported' class='checkCompatibilityWarning'><spring:message code="pages.check.browser_oldWarning" /> <spring:message code="pages.check.browser_switchWarning" /></p>
							<p id='qtMsg' class='checkCompatibilityCaution'><spring:message code="pages.check.browser_qtWarning" /></p>
							<p id='javaMsg' class='checkCompatibilityCaution'><spring:message code="pages.check.browser_javaWarning" /></p>
							<p id='flashMsg' class='checkCompatibilityCaution'><spring:message code="pages.check.browser_flashWarning" /></p>
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
					
					<div id='contentFilter' class="sectionHead"><spring:message code="pages.check.browserRecs" /></div>
					<div class="sectionContent"> 
						<div><spring:message code="pages.check.browserRecs_info" /></div>
						<div>
							<table class="compatibility">
								<tr>
									<th><spring:message code="pages.check.browserRecs_option" /></th>
									<th><spring:message code="pages.check.browserRecs_issues" /></th>
									<th><spring:message code="pages.check.browserRecs_level" /></th>
								</tr>
								<tr>
									<td><spring:message code="pages.check.browserRecs_firefox" /></td>
									<td><spring:message code="pages.check.browserRecs_noIssues" /></td>
									<td><spring:message code="pages.check.browserRecs_strong" /></td>
								</tr>
								<tr>
									<td><spring:message code="pages.check.browserRecs_chrome" /></td>
									<td><spring:message code="pages.check.browserRecs_noIssues" /></td>
									<td><spring:message code="pages.check.browserRecs_strong" /></td>
								</tr>
								<tr>
									<td><spring:message code="pages.check.browserRecs_safari" /></td>
									<td><spring:message code="pages.check.browserRecs_noIssues" /></td>
									<td><spring:message code="pages.check.browserRecs_medium" /></td>
								</tr>
								<tr>
									<td><spring:message code="pages.check.browserRecs_ie" /></td>
									<td><spring:message code="pages.check.browserRecs_ieIssues" /></td>
									<td><spring:message code="pages.check.browserRecs_weak" /></td>
								</tr>
								<tr>
									<td colspan="3"><spring:message code="pages.check.browserRecs_other" /></td>
								</tr>
							</table>
						</div>
					</div>
					
					<div id='contentFilter' class="sectionHead"><spring:message code="pages.check.system" /></div>
					<div class="sectionContent"> 
						<div><spring:message code="pages.check.system_fullSupport" /></div>
						<div>
							<table class="compatibility">
								<tbody> 
									<tr> 
										<td><spring:message code="pages.check.system_os" /></td> 
										<td><spring:message code="pages.check.system_osFull" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_ram" /></td> 
										<td><spring:message code="pages.check.system_ramFull" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_java" /></td> 
										<td><spring:message code="pages.check.system_javaFull" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_flash" /></td> 
										<td><spring:message code="pages.check.system_flashFull" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_firewall" /></td> 
										<td><spring:message code="pages.check.system_firewallFull" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_proxy" /></td> 
										<td><spring:message code="pages.check.system_proxyFull" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_execution" /></td> 
										<td><spring:message code="pages.check.system_executionFull" /> <a href="http://javatechniques.com/blog/launching-java-webstart-from-the-command-line" rel="nofollow">javaws</a></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_storage" /></td> 
										<td><spring:message code="pages.check.system_storageFull" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_persistence" /></td> 
										<td><spring:message code="pages.check.system_persistenceFull" /></td> 
									</tr> 
								</tbody>
							</table>
						</div>
						<div style="margin-top:1em;"><spring:message code="pages.check.system_partialSupport" /></div>
						<div>
							<table class="compatibility">
								<tbody> 
									<tr> 
										<td><spring:message code="pages.check.system_os" /></td> 
										<td><spring:message code="pages.check.system_osPartial" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_ram" /></td> 
										<td><spring:message code="pages.check.system_ramPartial" /></td> 
									</tr>  
									<tr> 
										<td><spring:message code="pages.check.system_java" /></td> 
										<td><spring:message code="pages.check.system_javaPartial" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_flash" /></td> 
										<td><spring:message code="pages.check.system_flashPartial" /></td> 
									</tr>
									<tr> 
										<td><spring:message code="pages.check.system_firewall" /></td> 
										<td><spring:message code="pages.check.system_firewallPartial" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_proxy" /></td> 
										<td><spring:message code="pages.check.system_proxyPartial" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_execution" /></td> 
										<td><spring:message code="pages.check.system_executionPartial" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_storage" /></td> 
										<td><spring:message code="pages.check.system_storagePartial" /></td> 
									</tr> 
									<tr> 
										<td><spring:message code="pages.check.system_persistence" /></td> 
										<td><spring:message code="pages.check.system_persistencePartial" /></td> 
									</tr> 
								</tbody>
							</table> 
						</div>
						<div style="margin-top:1em;"><a href="./schoolIT.html"><spring:message code="pages.check.schoolTech" /></a></div>
					</div>
				</div>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->
	
	<%@ include file="../footer.jsp"%>
</div>

</body>
</html>


