<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource" />"></script>
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />

<script type="text/javascript">
$(document).ready(function() {
	// refactor this so we can use the same body for both isLoginAllowed and isSendStatisticsToHub
  $("select").bind("change",
		  function() {
	  	    var attrVal = this.id.substr(0,this.id.lastIndexOf("_"));
	        var portalId = this.id.substr(this.id.lastIndexOf("_")+1);
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
});
</script>
</head>
<body>
<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>
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
<select id="isLoginAllowed_${portal.id}">
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
Send WISE statistics to WISE4.org (for research purpose only, no personal data will be sent)<br/>
<select id="isSendStatisticsToHub_${portal.id}">
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
<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>
</body>
</html>
