<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource" />"></script>
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />

<script type="text/javascript">
$(document).ready(function() {
  var portalId = $("#portalId").html();
  $("select").bind("change",
		  function() {
	  	    var attrVal = this.id;
	        $(this).find(":selected").each(function() {
	    	    	$.ajax(
	    	    	    	{type:'POST', 
	    		    	    	url:'manageportal.html', 
	    		    	    	data:'attr='+attrVal+'&portalId=' + portalId + '&val=' + $(this).val(), 
	    		    	    	error:function(){alert('Error: please talk to wise administrator, which might be you. If this is the case, please talk to yourself.');}, 
	    		    	    	success:function(){}
	    	    	    	});
	        });
  });  
	$("#saveSurveyTemplateButton").on("click", function() {
		var defaultSurveyTemplateStr = $("#defaultSurveyTemplate").val();
		$.ajax(
    	    	{type:'POST', 
	    	    	url:'manageportal.html', 
	    	    	data:'attr=runSurveyTemplate&portalId=' + portalId + '&val=' + defaultSurveyTemplateStr, 
	    	    	error:function(){alert('Error: please talk to wise administrator, which might be you. If this is the case, please talk to yourself.');}, 
	    	    	success:function(){alert('Save Successful!');}
    	    	});		
	});
});
</script>
</head>
<body>
<span id="portalId" style="display:none">${portal.id}</span>
<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>
<br/><br/>
<br/>
name: ${portal.portalName}
<br/>
address: ${portal.address}
<br/>
send_email_on_exception: ${portal.sendMailOnException}
<br/>
<br/>
Is Login Allowed:<br/>
<select id="isLoginAllowed">
	    		<c:choose>
	    			<c:when test="${portal.loginAllowed}">
				    	<option value="true" selected="selected">YES</option>
	    				<option value="false">NO</option>
	    			</c:when>
	    			<c:otherwise>
				    	<option value="true">YES</option>
	    				<option value="false" selected="selected">NO</option>
	    			</c:otherwise>
	    		</c:choose>
</select>

<br/><br/>
Send WISE statistics to WISE4.org (for research purpose only, no personal data will be sent. Please consider enabling this as it will help improve WISE!)<br/>
<select id="isSendStatisticsToHub">
	    		<c:choose>
	    			<c:when test="${portal.sendStatisticsToHub}">
				    	<option value="true" selected="selected">YES</option>
	    				<option value="false">NO</option>
	    			</c:when>
	    			<c:otherwise>
				    	<option value="true">YES</option>
	    				<option value="false" selected="selected">NO</option>
	    			</c:otherwise>
	    		</c:choose>
</select>
<br/><br/>
Default Run Survey Template (must be a valid JSON object)<br/>
<textarea id="defaultSurveyTemplate" rows="20" cols="100">${portal.runSurveyTemplate}</textarea><br/>
<input id="saveSurveyTemplateButton" type="button" value="Save" />
<br/><br/>
<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>
</body>
</html>
