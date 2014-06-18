<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<script type="text/javascript" src="${contextPath}/portal/javascript/general.js"></script>
    
<title>Upload Project Page</title>

</head>
<body>

<%@ include file="../../headermain.jsp"%>
<div id="page">
<div id="pageContent" class="contentPanel">
<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>
<br/>

<c:if test="${msg != null}">
	<div style="width:500px;font-size:1.2em;font-weight:bold;border:2px solid lightgreen">
		${msg}<br/><br/>
		Project Name: ${newProject.name}<br/>
		Project ID: ${newProject.id}<br/>
		<c:if test="${newProject.metadata != null && newProject.metadata.author != null}">
			Author: ${newProject.metadata.author}<br/>
		</c:if>
		<c:if test="${newProject.metadata != null && newProject.metadata.subject != null}">
			Subject: ${newProject.metadata.subject}<br/>
		</c:if>		
		<c:if test="${newProject.metadata != null && newProject.metadata.keywords != null}">
			Keywords: ${newProject.metadata.keywords}<br/>
		</c:if>		
		<br/><br/>
		<a href="${contextPath}/admin/project/manageallprojects.html?projectId=${newProject.id}">Manage Project</a>		
		<br/><br/>
		<a target=_blank href="${contextPath}/previewproject.html?projectId=${newProject.id}">Preview Project</a>
	</div>
<br/>
</c:if>
<br/>
<h3>Import WISE Project</h3>


<br/>
<div>
NOTE:
<ol>
  <li>1. File must be a zip file, and must have a .zip extension</li>
  <li>2. ZipFile name must be the same as the root folder inside it</li>
  <li>3. File must contain a wise4.project.json file in the top/root level</li>
</ol>
<br/>
<pre>
example.zip

unzipped:
  + example/
    + assets/
      - car.jpg
      - cup.png
    - wise4.project.json
    - intro.ht
    - intro.html
    ...    
</pre>
</div>
<br/><br/>
<form:form method="post" action="importproject.html" 
	commandName="projectZipFile" id="editproject" enctype="multipart/form-data" autocomplete='off'>

	<div>Project Zip File</div>
	<input type="file" name="file" id="projectZipFile"/>
    <br/><br/>
    
    <input type="submit" value="Import" />
</form:form>


</div>
</div>
</body>
</html>