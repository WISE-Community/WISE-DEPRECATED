<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="wiseAdmin" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" >
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jquerymigrate.js"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="projecttags.js"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>

<script type='text/javascript'>
<c:forEach var='project' items="${internal_project_list}">
	<c:forEach var='tag' items="${project.tags}">
		tagNameMap['${tag.id}'] = '${tag.name}';
	</c:forEach>
</c:forEach>

<c:forEach var='project' items="${external_project_list}">
	<c:forEach var='tag' items="${project.tags}">
		tagNameMap['${tag.id}'] = '${tag.name}';
	</c:forEach>
</c:forEach>
</script>

<style type="text/css">
#adminManageProjectsTable > tbody > tr, #adminManageProjectsTable > tbody > tr > td, #adminManageProjectsTable > tbody > tr > th
{
	border: 1px solid black;
}

#adminManageProjectsTable > tbody > tr > th
{
    font-weight:bold;
}

</style>
</head>
<script type="text/javascript">
$(document).ready(function() {
  $(".isCurrent_select").bind("change",
		  function() {
	        var projectId = this.id.substr(this.id.lastIndexOf("_")+1);
	        $(this).find(":selected").each(function() {
	    	        var isCurrent = $(this).val();
	    	    	$.ajax(
	    	    	    	{type:'POST',
	    		    	    	url:'manageallprojects.html',
	    		    	    	data:'attr=isCurrent&projectId=' + projectId + '&val=' + isCurrent,
	    		    	    	error:function(){alert('error: please talk to wise administrator.');},
	    		    	    	success:function(){}
	    	    	    	});
	        });
  });
});

function updateMaxTotalAssetsSize(projectId, newMaxTotalAssetsSize) {
	var projectId = parseInt(projectId);
	var newMaxTotalAssetsSize = parseInt(newMaxTotalAssetsSize);
	if (isNaN(newMaxTotalAssetsSize)) {
		alert("Error updating max total assets size. Please make sure that you entered a number.");
	} else {
		$.ajax(
				{
					type:'POST',
					url:'manageallprojects.html',
					data:{attr:"maxTotalAssetsSize",projectId:projectId,val:newMaxTotalAssetsSize},
    	    		error:function(){alert('error: please talk to wise administrator.');},
    	    		success:function(){}
				}
				);
	}
}
</script>
<body>
<%@ include file="../../headermain.jsp"%>
<div id="page">
<div id="pageContent" class="contentPanel">
<%@page import="org.wise.portal.domain.project.impl.ProjectType" %>

<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>

<c:out value="${message}" />
<br/>
<table id="adminManageProjectsTable">
	<tr>
		<th> Project Id</th>
		<th> Project Title </th>
		<th> Is Current</th>
		<th> Max Assets Size (in bytes) <a onClick="alert('Empty=Use System Default Value, usually 10MB\n10MB=10485760 bytes\n15MB=15728640 bytes\n20MB=20971520 bytes\n100MB=104857600 bytes')">Help</a></th>
		<th> Tags </th>
		<th> Actions </th>
	</tr>
	<c:forEach var="project" items="${internal_project_list}">
	<tr>
		<td>${project.id}</td>
		<td><a target=_blank href="${contextPath}/previewproject.html?projectId=${project.id}">${project.name}</a><br/>
			<span style="font-size:.4em">${project.modulePath}</span>
		</td>
	    <td>Is Current:
	    	<select class="isCurrent_select" id="isCurrent_select_${project.id}">
	    		<c:choose>
	    			<c:when test="${project.current}">
				    	<option value="true" selected="selected">YES</option>
	    				<option value="false">NO</option>
	    			</c:when>
	    			<c:otherwise>
				    	<option value="true">YES</option>
	    				<option value="false" selected="selected">NO</option>
	    			</c:otherwise>
	    		</c:choose>
	    	</select></td>
	    <td>
			<input id="maxTotalAssetsSize_${project.id}" type='text' size=8 value='${project.maxTotalAssetsSize}' onblur="updateMaxTotalAssetsSize(${project.id},this.value)" />
	    </td>
		<td>
			<div class="existingTagsDiv">
				<div>Existing Tags</div>
				<div id="existingTagsDiv_${project.id}">
					<c:forEach var="tag" items="${project.tags}">
						<table class='existingTags' id="tagTable_${project.id}_${tag.id}">
							<tbody>
								<tr>
									<td><input id="tagEdit_${project.id}_${tag.id}" type='text' value='${tag.name}' onchange="tagChanged($(this).attr('id'))" readonly/></td>
									<td><input id="removeTag_${project.id}_${tag.id}" type='button' value='remove' onclick="removeTag($(this).attr('id'))" readonly/></td>
								</tr>
							</tbody>
						</table>
					</c:forEach>
				</div>
			</div>
			<div class="createTagsDiv">
				<div id='createTagMsgDiv_${project.id}' class='tagMessage'></div>
				<div>Create A New Tag</div>
				<div><input id="createTagInput_${project.id}" type="text"/><input type="button" value="create" onclick="createTag('${project.id}')"/></div>
			</div>
		</td>
		<td>
		<a href="${contextPath}/author/authorproject.html?projectId=${project.id}">Edit Project</a><br/>
		<a href="${contextPath}/project/export/${project.id}">Export project as Zip</a>
		</td>
	</tr>
	</c:forEach>
</table>

</div></div>
</body>
</html>
