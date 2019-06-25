<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html x-dir="${textDirection}"> <%-- The page always ltr --%>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
	<title>Import Project</title>

	<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
	<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" >
	<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >

	<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
	<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>

	<script type="text/javascript">
		function validateForm() {
			if ($("#projectZipFile").val() == "") {
				alert("Please specify a project zip file to import.");
				return false;
			}
			if ($("#projectVersionSelect").val() == "none") {
				alert("Please specify a WISE version.");
				return false;
			}
			return true;
		}

		$(document).ready(function() {
			$.ajax("getImportableProjects").success(function(projectsResponse) {
				var importableProjects = JSON.parse(projectsResponse);
				importableProjects.map(function(importableProject) {
					$("#importableWISEProjects").append(
							"<option value='" + importableProject.id + "'>"
							+ importableProject.name
							+ "</option>");
				});
			});
		});
		function importableWISEProjectSubmit() {
			var importableWISEProjectId = $("#importableWISEProjects option:selected").attr("id");
			$.ajax({});
			alert();
		}
	</script>
</head>
<body>
<%@ include file="../../headermain.jsp"%>
<div id="page">
	<div id="pageContent" class="contentPanel">
		<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>
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
				<a href="${contextPath}/admin/project/manageallprojects.html?projectLookupType=id&projectLookupValue=${newProject.id}">Manage Project</a>
				<br/><br/>
				<a target=_blank href="${contextPath}/previewproject.html?projectId=${newProject.id}">Preview Project</a>
			</div>
			<br/>
		</c:if>
		<br/>
		<div id="importFromHubDiv" style="background:#FFF9EF; padding: 10px">
			<h3>Select a WISE Project to Import</h3>
			<form action="importFromHub" method="POST">
				<select id="importableWISEProjects" name="importableProjectId"></select>
				<button type="submit">Import</button>
			</form>
		</div>
		<br/>- OR -<br/><br/>
		<div id="manualImport" style="background:#FFF9EF; padding: 10px">
			<h3>Manually Import WISE Project</h3>

			<br/>
			<div>
				NOTE:
				<ol>
					<li>1. File must be a zip file, and must have a .zip extension</li>
					<li>2. Zip filename must be the same as the root folder inside it</li>
					<li>3. If the project is a WISE 4 project, the unzipped folder must contain a wise4.project.json file in the top/root level</li>
					<li>4. If the project is a WISE 5 project, the unzipped folder must contain a project.json file in the top/root level</li>
				</ol>
				<br/>
<pre>
example.zip

unzipped:
  + example/
	+ assets/
	  - car.jpg
	  - cup.png
	- wise4.project.json (or project.json for WISE 5 project)
	- intro.ht
	- intro.html
	...
</pre>
			</div>
			<br/><br/>
			<form:form method="post" action="import"
					   modelAttribute="projectZipFile" id="editproject" enctype="multipart/form-data" autocomplete='off' onsubmit="return validateForm();">

				<!--
				Which WISE version is this project?<br/>
				<select id="projectVersionSelect" name="projectVersion">
					<option value="none">Choose...</option>
					<option value="wise4">WISE 4</option>
					<option value="wise5">WISE 5</option>
				</select>
				<br/><br/>
				-->
				<div>Project Zip File</div>
				<input type="file" name="file" id="projectZipFile"/>
				<br/><br/>

				<input type="submit" value="Import" />
			</form:form>
		</div>
	</div>
</div>
</body>
</html>
